import { NextResponse } from "next/server"
import { CLOUDINARY_CONFIG } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "products"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const uploadFormData = new FormData()
    uploadFormData.append("file", file)
    uploadFormData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset)
    uploadFormData.append("folder", `${CLOUDINARY_CONFIG.folder}/${folder}`)
    uploadFormData.append("quality", "auto")
    uploadFormData.append("fetch_format", "auto")

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error?.message || `Upload failed with status ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ url: data.secure_url, publicId: data.public_id })
  } catch (error) {
    console.error("Error in upload API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
