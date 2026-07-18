import { NextResponse } from "next/server"
import { getReviewsForProduct, createReview } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const reviews = await getReviewsForProduct(id)
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Vous devez être connecté pour laisser un avis." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json({ error: "Note et commentaire requis" }, { status: 400 })
    }

    const review = await createReview({
      productId: id,
      author: session.user.name || session.user.email.split("@")[0],
      email: session.user.email,
      rating,
      comment,
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
