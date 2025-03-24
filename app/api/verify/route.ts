import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { verify } from "jsonwebtoken"
import type { JwtPayload } from "@/lib/types"

const JWT_SECRET = "bobby2005"
const MONGODB_URI = "mongodb+srv://bobby:bobby2005@cluster0hack.ug01f.mongodb.net/"
const DB_NAME = "bobby2005"
const COLLECTION_NAME = "governmentBills"

export async function POST(request: NextRequest) {
  try {
    const { jwtToken } = await request.json()

    if (!jwtToken) {
      return NextResponse.json({ error: "JWT token is required" }, { status: 400 })
    }

    // Verify and decode JWT token
    const decoded = verify(jwtToken, JWT_SECRET) as JwtPayload

    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    // Query the database for the invoice
    const invoice = await collection.findOne({
      invoiceNumber: decoded.invoiceNumber,
      "seller.gstNumber": decoded.sellerGST,
      totalAmount: decoded.totalAmount,
    })

    await client.close()

    if (!invoice) {
      return NextResponse.json(
        {
          isValid: false,
          message: "Invoice not found in the government database",
        },
        { status: 404 },
      )
    }

    // Convert MongoDB ObjectId to string
    const formattedInvoice = {
      ...invoice,
      _id: invoice._id.toString(),
      localDbId: invoice.localDbId ? invoice.localDbId.toString() : undefined,
    }

    return NextResponse.json({
      isValid: true,
      invoice: formattedInvoice,
    })
  } catch (error) {
    console.error("Error verifying invoice:", error)

    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError") {
        return NextResponse.json(
          {
            isValid: false,
            message: "Invalid QR code or JWT token",
          },
          { status: 400 },
        )
      } else if (error.name === "TokenExpiredError") {
        return NextResponse.json(
          {
            isValid: false,
            message: "The invoice token has expired",
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      {
        isValid: false,
        message: "Failed to verify invoice",
      },
      { status: 500 },
    )
  }
}

