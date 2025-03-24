import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Invoice } from "@/lib/types"
import { formatDate, formatCurrency } from "@/lib/utils"

interface InvoiceDetailsProps {
  invoice: Invoice
}

export default function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Invoice #{invoice.invoiceNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">Created: {formatDate(invoice.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Total Amount</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.totalAmount)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Seller Information</h3>
            <div className="space-y-1">
              <p className="font-medium">{invoice.seller.name}</p>
              <p className="text-sm">{invoice.seller.address}</p>
              <p className="text-sm">Phone: {invoice.seller.phone}</p>
              <p className="text-sm">Email: {invoice.seller.email}</p>
              <p className="text-sm font-medium">GST: {invoice.seller.gstNumber}</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Buyer Information</h3>
            <div className="space-y-1">
              <p className="font-medium">{invoice.buyer.name}</p>
              <p className="text-sm">{invoice.buyer.address}</p>
              <p className="text-sm">
                {invoice.buyer.state} ({invoice.buyer.stateCode})
              </p>
              <p className="text-sm font-medium">GST: {invoice.buyer.gstNumber}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-medium">Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Item</th>
                  <th className="text-left py-2 font-medium">HSN Code</th>
                  <th className="text-right py-2 font-medium">Qty</th>
                  <th className="text-right py-2 font-medium">Rate</th>
                  <th className="text-right py-2 font-medium">GST %</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-muted">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.hsnCode}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-2 text-right">{item.gstPercentage}%</td>
                    <td className="py-2 text-right">{formatCurrency(item.rate * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.isIntraState ? (
            <>
              <div className="flex justify-between">
                <span>CGST ({invoice.items[0]?.gstPercentage / 2}%):</span>
                <span>{formatCurrency(invoice.taxes.cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({invoice.items[0]?.gstPercentage / 2}%):</span>
                <span>{formatCurrency(invoice.taxes.sgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span>IGST ({invoice.items[0]?.gstPercentage}%):</span>
              <span>{formatCurrency(invoice.taxes.igst)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

