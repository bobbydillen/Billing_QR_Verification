"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QrScannerProps {
  onScan: (jwtToken: string) => void
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationFrameId: number
    let jsQRScanner: any

    const loadJsQR = async () => {
      try {
        // Dynamically import jsQR
        const jsQR = (await import("jsqr")).default
        jsQRScanner = jsQR
        return true
      } catch (error) {
        console.error("Failed to load jsQR:", error)
        return false
      }
    }

    const startScanning = async () => {
      if (!videoRef.current || !canvasRef.current) return

      const jsQRLoaded = await loadJsQR()
      if (!jsQRLoaded) {
        toast({
          title: "Error",
          description: "Failed to load QR scanner library",
          variant: "destructive",
        })
        setScanning(false)
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        const scanQRCode = () => {
          if (!videoRef.current || !canvasRef.current || !jsQRScanner) return

          const canvas = canvasRef.current
          const context = canvas.getContext("2d")

          if (context && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            canvas.height = videoRef.current.videoHeight
            canvas.width = videoRef.current.videoWidth
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQRScanner(imageData.data, imageData.width, imageData.height)

            if (code) {
              handleQrCodeDetected(code.data)
              return
            }
          }

          animationFrameId = requestAnimationFrame(scanQRCode)
        }

        scanQRCode()
      } catch (error) {
        console.error("Error accessing camera:", error)
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access to scan QR codes",
          variant: "destructive",
        })
        setScanning(false)
      }
    }

    if (scanning) {
      startScanning()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [scanning, toast])

  const handleQrCodeDetected = (data: string) => {
    setScanning(false)
    onScan(data)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const img = new Image()
        img.onload = async () => {
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")

          if (!context) {
            toast({
              title: "Error",
              description: "Failed to process QR code image",
              variant: "destructive",
            })
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          context.drawImage(img, 0, 0)

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

          // Dynamically import jsQR
          const jsQR = (await import("jsqr")).default
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code) {
            handleQrCodeDetected(code.data)
          } else {
            toast({
              title: "No QR Code Found",
              description: "Could not detect a QR code in the uploaded image",
              variant: "destructive",
            })
          }
        }

        img.src = e.target?.result as string
      } catch (error) {
        console.error("Error processing QR code:", error)
        toast({
          title: "Error",
          description: "Failed to process QR code image",
          variant: "destructive",
        })
      }
    }

    reader.readAsDataURL(file)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  return (
    <div className="space-y-6">
      {scanning ? (
        <div className="relative">
          <video ref={videoRef} className="w-full rounded-lg border border-border" playsInline />
          <canvas ref={canvasRef} className="hidden" />
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-background/80"
            onClick={() => setScanning(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-6 border-dashed border-2 border-muted-foreground/30">
          <div className="mb-4 text-muted-foreground text-center">
            <Camera className="h-12 w-12 mx-auto mb-2" />
            <p>Scan a QR code from an invoice</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <Button onClick={() => setScanning(true)} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Scan QR Code
            </Button>
            <div className="relative flex-1">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or enter JWT token manually</span>
        </div>
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-2">
        <Input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Paste JWT token here"
        />
        <Button type="submit" variant="secondary" className="w-full">
          Verify Token
        </Button>
      </form>
    </div>
  )
}

