"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QrScanner from "@/components/qr-scanner"
import InvoiceDetails from "@/components/invoice-details"
import { verifyInvoice } from "@/lib/invoice-service"
import type { Invoice } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQrCodeScanned = async (jwtToken: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await verifyInvoice(jwtToken)
      setInvoice(result.invoice)
      setIsValid(result.isValid)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify invoice")
      setIsValid(false)
      setInvoice(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">GST Invoice Verification System</CardTitle>
          <CardDescription>Scan a QR code from an invoice to verify its authenticity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
              <TabsTrigger value="result" disabled={isValid === null}>
                Verification Result
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scan" className="py-4">
              <QrScanner onScan={handleQrCodeScanned} />
            </TabsContent>
            <TabsContent value="result" className="py-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Verifying invoice...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                    <span className="text-2xl text-destructive">✕</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Invalid Invoice</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              ) : isValid ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <span className="text-2xl text-green-600">✓</span>
                    </div>
                    <h3 className="text-xl font-semibold">Valid Invoice</h3>
                    <p className="text-muted-foreground">This invoice has been verified in the government database.</p>
                  </div>
                  {invoice && <InvoiceDetails invoice={invoice} />}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                    <span className="text-2xl text-destructive">✕</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Invalid Invoice</h3>
                  <p className="text-muted-foreground">
                    This invoice could not be verified in the government database.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}

