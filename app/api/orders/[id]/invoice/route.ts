import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { getOrderById, type OrderItem } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()
    let y = height - 60

    // Header
    page.drawText("NOSTRA", { x: 50, y, size: 28, font: fontBold, color: rgb(0, 0, 0) })
    page.drawText("FACTURE", { x: width - 150, y, size: 20, font: fontBold, color: rgb(0.3, 0.3, 0.3) })
    y -= 40

    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) })
    y -= 30

    // Order info
    page.drawText(`Numéro de commande: ${order.id}`, { x: 50, y, size: 11, font })
    y -= 18
    page.drawText(`Date: ${new Date(order.created_at).toLocaleDateString("fr-FR")}`, { x: 50, y, size: 11, font })
    y -= 18
    page.drawText(`Statut: ${order.status}`, { x: 50, y, size: 11, font })
    y -= 35

    // Customer info
    page.drawText("Facturé à:", { x: 50, y, size: 12, font: fontBold })
    y -= 18
    page.drawText(order.customer_name, { x: 50, y, size: 11, font })
    y -= 16
    page.drawText(order.customer_phone, { x: 50, y, size: 11, font })
    y -= 16
    page.drawText(order.customer_address, { x: 50, y, size: 11, font, maxWidth: 300 })
    y -= 40

    // Table header
    page.drawRectangle({ x: 50, y: y - 8, width: width - 100, height: 24, color: rgb(0.95, 0.95, 0.95) })
    page.drawText("Produit", { x: 58, y, size: 10, font: fontBold })
    page.drawText("Qté", { x: 320, y, size: 10, font: fontBold })
    page.drawText("Prix", { x: 380, y, size: 10, font: fontBold })
    page.drawText("Total", { x: 460, y, size: 10, font: fontBold })
    y -= 30

    const items = order.items as OrderItem[]
    let total = 0
    for (const item of items) {
      const lineTotal = item.price * item.quantity
      total += lineTotal
      const label = `${item.name} (${item.colorLabel}, ${item.size})`
      page.drawText(label.substring(0, 40), { x: 58, y, size: 10, font })
      page.drawText(String(item.quantity), { x: 320, y, size: 10, font })
      page.drawText(`${item.price} DH`, { x: 380, y, size: 10, font })
      page.drawText(`${lineTotal} DH`, { x: 460, y, size: 10, font })
      y -= 22
    }

    y -= 15
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) })
    y -= 25

    page.drawText("Total:", { x: 380, y, size: 13, font: fontBold })
    page.drawText(`${order.total} DH`, { x: 460, y, size: 13, font: fontBold })

    // Footer
    page.drawText("Merci pour votre commande chez NOSTRA !", {
      x: 50,
      y: 60,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="facture-${order.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
