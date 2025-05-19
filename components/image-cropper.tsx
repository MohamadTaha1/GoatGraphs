"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Undo2, ZoomIn, ZoomOut, RotateCw, Save } from "lucide-react"

interface ImageCropperProps {
  imageUrl: string
  aspectRatio?: number
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({ imageUrl, aspectRatio = 16 / 9, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(aspectRatio)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // When the image loads, set up the initial crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget

    // Initialize the crop when the image loads
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect))
    }

    setImageLoaded(true)
  }

  // Update the preview canvas whenever the crop changes
  useEffect(() => {
    if (completedCrop && imgRef.current && previewCanvasRef.current) {
      const img = imgRef.current
      const canvas = previewCanvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        return
      }

      // Calculate the pixel ratio for high DPI displays
      const pixelRatio = window.devicePixelRatio || 1

      // Calculate the cropped image dimensions
      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height

      const sourceX = completedCrop.x * scaleX
      const sourceY = completedCrop.y * scaleY
      const sourceWidth = completedCrop.width * scaleX
      const sourceHeight = completedCrop.height * scaleY

      // Set canvas dimensions to match the cropped image
      canvas.width = completedCrop.width * pixelRatio
      canvas.height = completedCrop.height * pixelRatio

      // Scale the canvas context for high DPI displays
      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = "high"

      // Apply rotation if needed
      if (rotate !== 0) {
        ctx.save()
        ctx.translate(canvas.width / (2 * pixelRatio), canvas.height / (2 * pixelRatio))
        ctx.rotate((rotate * Math.PI) / 180)
        ctx.translate(-canvas.width / (2 * pixelRatio), -canvas.height / (2 * pixelRatio))
      }

      // Draw the cropped image on the canvas
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, completedCrop.width, completedCrop.height)

      // Restore the context if we applied rotation
      if (rotate !== 0) {
        ctx.restore()
      }
    }
  }, [completedCrop, rotate])

  // Handle aspect ratio changes
  const handleAspectChange = (newAspect: string) => {
    if (imgRef.current) {
      const { width, height } = imgRef.current

      if (newAspect === "free") {
        setAspect(undefined)
      } else if (newAspect === "16:9") {
        setAspect(16 / 9)
        setCrop(centerAspectCrop(width, height, 16 / 9))
      } else if (newAspect === "4:3") {
        setAspect(4 / 3)
        setCrop(centerAspectCrop(width, height, 4 / 3))
      } else if (newAspect === "1:1") {
        setAspect(1)
        setCrop(centerAspectCrop(width, height, 1))
      } else if (newAspect === "9:16") {
        setAspect(9 / 16)
        setCrop(centerAspectCrop(width, height, 9 / 16))
      }
    }
  }

  // Reset the crop, scale, and rotation
  const handleReset = () => {
    setScale(1)
    setRotate(0)
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, aspect))
    } else {
      setCrop(undefined)
    }
  }

  // Generate the final cropped image
  const handleSave = () => {
    if (!completedCrop || !previewCanvasRef.current) {
      return
    }

    // Convert the canvas to a Blob
    previewCanvasRef.current.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty")
          return
        }
        onCropComplete(blob)
      },
      "image/jpeg",
      0.95, // Quality
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 overflow-auto">
          <div className="bg-gray-100 rounded-lg p-2 mb-4">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minHeight={50}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl || "/placeholder.svg"}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
                className="max-w-full max-h-[500px] mx-auto"
              />
            </ReactCrop>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="zoom" className="text-sm">
                Zoom: {scale.toFixed(1)}x
              </Label>
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                <Slider
                  id="zoom"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>

            <div>
              <Label htmlFor="rotate" className="text-sm">
                Rotate: {rotate}°
              </Label>
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                <Slider
                  id="rotate"
                  min={0}
                  max={360}
                  step={1}
                  value={[rotate]}
                  onValueChange={(value) => setRotate(value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label className="text-sm mb-1 block">Aspect Ratio</Label>
              <Tabs defaultValue={aspect === 16 / 9 ? "16:9" : "free"} onValueChange={handleAspectChange}>
                <TabsList className="grid grid-cols-5 h-8">
                  <TabsTrigger value="free" className="text-xs">
                    Free
                  </TabsTrigger>
                  <TabsTrigger value="16:9" className="text-xs">
                    16:9
                  </TabsTrigger>
                  <TabsTrigger value="4:3" className="text-xs">
                    4:3
                  </TabsTrigger>
                  <TabsTrigger value="1:1" className="text-xs">
                    1:1
                  </TabsTrigger>
                  <TabsTrigger value="9:16" className="text-xs">
                    9:16
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 flex flex-col space-y-4">
          <div>
            <Label className="text-sm mb-1 block">Preview</Label>
            <div className="bg-gray-100 rounded-lg p-2 relative">
              <AspectRatio ratio={aspect || 16 / 9} className="bg-white">
                <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
              </AspectRatio>
              {!completedCrop && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 rounded-lg">
                  <p className="text-sm text-gray-500">Adjust crop to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          <Button type="button" variant="outline" onClick={handleReset} className="mr-2">
            <Undo2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!completedCrop || !imageLoaded}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Apply Crop
        </Button>
      </div>
    </div>
  )
}
