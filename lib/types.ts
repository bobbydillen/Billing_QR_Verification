export interface InvoiceItem {
  productId: string
  name: string
  hsnCode: string
  quantity: number
  rate: number
  gstPercentage: number
}

export interface Seller {
  name: string
  address: string
  phone: string
  gstNumber: string
  email: string
}

export interface Buyer {
  name: string
  gstNumber: string
  address: string
  state: string
  stateCode: string
}

export interface Taxes {
  cgst: number
  sgst: number
  igst: number
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  createdAt: string
  dueDate?: string
  seller: Seller
  buyer: Buyer
  items: InvoiceItem[]
  subtotal: number
  taxes: Taxes
  totalAmount: number
  isIntraState: boolean
  qrCodeUrl?: string
  localDbId?: string
}

export interface JwtPayload {
  invoiceNumber: string
  sellerGST: string
  totalAmount: number
  timestamp: string
  iat: number
  exp: number
}

export interface VerificationResult {
  isValid: boolean
  invoice: Invoice | null
  message?: string
}

