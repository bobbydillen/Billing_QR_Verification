"use server"

import type { JwtPayload, VerificationResult } from "./types"
import { MongoClient } from "mongodb"
import { verify } from "jsonwebtoken"

const JWT_SECRET = "bobby2005"
const MONGODB_URI = "mongodb+srv://bobby:bobby2005@cluster0hack.ug01f.mongodb.net/"
const DB_NAME = "bobby2005"
const COLLECTION_NAME = "governmentBills"

export async function verifyInvoice(jwtToken: string): Promise<VerificationResult> {
  try {
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
      return {
        isValid: false,
        invoice: null,
        message: "Invoice not found in the government database",
      }
    }

    // Convert MongoDB ObjectId to string
    const formattedInvoice = {
      ...invoice,
      _id: invoice._id.toString(),
      localDbId: invoice.localDbId ? invoice.localDbId.toString() : undefined,
    }

    return {
      isValid: true,
      invoice: formattedInvoice,
    }
  } catch (error) {
    console.error("Error verifying invoice:", error)

    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError") {
        return {
          isValid: false,
          invoice: null,
          message: "Invalid QR code or JWT token",
        }
      } else if (error.name === "TokenExpiredError") {
        return {
          isValid: false,
          invoice: null,
          message: "The invoice token has expired",
        }
      }
    }

    return {
      isValid: false,
      invoice: null,
      message: "Failed to verify invoice",
    }
  }
}

