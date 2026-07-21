import { neon } from "@neondatabase/serverless"
import { mockProducts, type ProductData } from "./product-utils"

function getSql() {
  const connectionString =
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.NEON_DATABASE_URL_UNPOOLED ||
    process.env.NEON_POSTGRES_URL_NON_POOLING ||
    process.env.NEON_POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  if (!connectionString) {
    throw new Error("No database connection string found in environment variables")
  }
  return neon(connectionString)
}

let initialized = false

async function ensureInitialized() {
  if (initialized) return
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      last_login_at TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id TEXT NOT NULL,
      author TEXT NOT NULL,
      email TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS admin_activity (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_email TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_lat DOUBLE PRECISION,
      customer_lng DOUBLE PRECISION,
      items JSONB NOT NULL,
      total NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `

  // Backfill columns for databases created before location tracking was added
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lat DOUBLE PRECISION`
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lng DOUBLE PRECISION`

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      email TEXT PRIMARY KEY,
      subscribed_at TIMESTAMPTZ DEFAULT now()
    )
  `

  const existing = await sql`SELECT COUNT(*)::int as count FROM products`
  const count = (existing[0] as any)?.count ?? 0

  if (count === 0) {
    // Seed the table with the original mock products so the site keeps working
    for (const product of mockProducts) {
      await sql`
        INSERT INTO products (id, data)
        VALUES (${product.id}, ${JSON.stringify(product)}::jsonb)
        ON CONFLICT (id) DO NOTHING
      `
    }
  }

  initialized = true
}

export async function getAllProducts(): Promise<ProductData[]> {
  await ensureInitialized()
  const sql = getSql()
  const rows = await sql`SELECT data FROM products ORDER BY created_at ASC`
  return rows.map((row: any) => row.data as ProductData)
}

export async function getProductById(id: string): Promise<ProductData | null> {
  await ensureInitialized()
  const sql = getSql()
  const rows = await sql`SELECT data FROM products WHERE id = ${id}`
  if (rows.length === 0) return null
  return rows[0].data as ProductData
}

export async function createProduct(product: ProductData): Promise<ProductData> {
  await ensureInitialized()
  const sql = getSql()
  await sql`
    INSERT INTO products (id, data)
    VALUES (${product.id}, ${JSON.stringify(product)}::jsonb)
  `
  return product
}

export async function updateProduct(id: string, product: ProductData): Promise<ProductData> {
  await ensureInitialized()
  const sql = getSql()
  await sql`
    UPDATE products
    SET data = ${JSON.stringify(product)}::jsonb, updated_at = now()
    WHERE id = ${id}
  `
  return product
}

export async function deleteProduct(id: string): Promise<void> {
  await ensureInitialized()
  const sql = getSql()
  await sql`DELETE FROM products WHERE id = ${id}`
}

export async function upsertCustomer(customer: { email: string; name?: string | null; image?: string | null }) {
  await ensureInitialized()
  const sql = getSql()
  const id = customer.email // email as stable unique id for simplicity
  await sql`
    INSERT INTO customers (id, email, name, image)
    VALUES (${id}, ${customer.email}, ${customer.name || null}, ${customer.image || null})
    ON CONFLICT (email)
    DO UPDATE SET name = ${customer.name || null}, image = ${customer.image || null}, last_login_at = now()
  `
}

export async function getAllCustomers() {
  await ensureInitialized()
  const sql = getSql()
  return sql`SELECT id, email, name, image, created_at, last_login_at FROM customers ORDER BY created_at DESC`
}

export async function getReviewsForProduct(productId: string) {
  await ensureInitialized()
  const sql = getSql()
  return sql`
    SELECT id, product_id, author, rating, comment, created_at
    FROM reviews
    WHERE product_id = ${productId}
    ORDER BY created_at DESC
  `
}

export async function createReview(review: {
  productId: string
  author: string
  email: string
  rating: number
  comment: string
}) {
  await ensureInitialized()
  const sql = getSql()
  const rows = await sql`
    INSERT INTO reviews (product_id, author, email, rating, comment)
    VALUES (${review.productId}, ${review.author}, ${review.email}, ${review.rating}, ${review.comment})
    RETURNING id, product_id, author, rating, comment, created_at
  `
  return rows[0]
}

function generateOrderId() {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `NOS-${y}${m}${d}-${rand}`
}

export interface OrderItem {
  name: string
  colorLabel: string
  size: string
  quantity: number
  price: number
}

export async function createOrder(order: {
  customerEmail?: string | null
  customerName: string
  customerPhone: string
  customerAddress: string
  customerLat?: number | null
  customerLng?: number | null
  items: OrderItem[]
  total: number
}) {
  await ensureInitialized()
  const sql = getSql()
  const id = generateOrderId()
  const rows = await sql`
    INSERT INTO orders (id, customer_email, customer_name, customer_phone, customer_address, customer_lat, customer_lng, items, total, status)
    VALUES (${id}, ${order.customerEmail || null}, ${order.customerName}, ${order.customerPhone}, ${order.customerAddress}, ${order.customerLat ?? null}, ${order.customerLng ?? null}, ${JSON.stringify(order.items)}::jsonb, ${order.total}, 'pending')
    RETURNING *
  `
  return rows[0]
}

export async function getOrderById(id: string) {
  await ensureInitialized()
  const sql = getSql()
  const rows = await sql`SELECT * FROM orders WHERE id = ${id}`
  return rows[0] || null
}

export async function getAllOrders() {
  await ensureInitialized()
  const sql = getSql()
  return sql`SELECT * FROM orders ORDER BY created_at DESC`
}

export async function getOrdersForCustomer(email: string) {
  await ensureInitialized()
  const sql = getSql()
  return sql`SELECT * FROM orders WHERE customer_email = ${email} ORDER BY created_at DESC`
}

export async function updateOrderStatus(id: string, status: string) {
  await ensureInitialized()
  const sql = getSql()
  const rows = await sql`
    UPDATE orders SET status = ${status}, updated_at = now() WHERE id = ${id} RETURNING *
  `
  return rows[0] || null
}

export async function subscribeToNewsletter(email: string) {
  await ensureInitialized()
  const sql = getSql()
  await sql`
    INSERT INTO newsletter_subscribers (email) VALUES (${email})
    ON CONFLICT (email) DO NOTHING
  `
}

export async function getAllNewsletterSubscribers() {
  await ensureInitialized()
  const sql = getSql()
  return sql`SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC`
}

export async function getStats() {
  await ensureInitialized()
  const sql = getSql()

  const [orderStats] = await sql`
    SELECT
      COUNT(*)::int AS total_orders,
      COALESCE(SUM(total), 0)::float AS total_revenue,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_orders
    FROM orders
  `

  const [customerCount] = await sql`SELECT COUNT(*)::int AS total_customers FROM customers`
  const [productCount] = await sql`SELECT COUNT(*)::int AS total_products FROM products`

  const topProductsRaw = await sql`
    SELECT items FROM orders
  `
  const productSales: Record<string, number> = {}
  for (const row of topProductsRaw as any[]) {
    const items = row.items as OrderItem[]
    for (const item of items) {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity
    }
  }
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }))

  return {
    totalOrders: orderStats?.total_orders || 0,
    totalRevenue: orderStats?.total_revenue || 0,
    pendingOrders: orderStats?.pending_orders || 0,
    deliveredOrders: orderStats?.delivered_orders || 0,
    totalCustomers: customerCount?.total_customers || 0,
    totalProducts: productCount?.total_products || 0,
    topProducts,
  }
}

export async function logAdminActivity(action: "login" | "logout", ipAddress?: string, userAgent?: string) {
  await ensureInitialized()
  const sql = getSql()
  await sql`
    INSERT INTO admin_activity (action, ip_address, user_agent)
    VALUES (${action}, ${ipAddress || null}, ${userAgent || null})
  `
}

export async function getAdminActivity(limit = 50) {
  await ensureInitialized()
  const sql = getSql()
  return sql`
    SELECT id, action, ip_address, user_agent, created_at
    FROM admin_activity
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
}
