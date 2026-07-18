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
