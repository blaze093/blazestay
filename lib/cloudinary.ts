export const CLOUDINARY_CONFIG = {
  cloudName: "dc2v84v36",
  apiKey: "735295564642131",
  apiSecret: "eY8NYX-CCr0deZUUDoN7959O1tk",
  uploadPreset: "blazekart",
  folder: "blazekart",
}

export const uploadToCloudinary = async (
  file: File,
  folder = "products",
  onProgress?: (progress: number) => void,
): Promise<string> => {
  // Validate file
  if (!file) {
    throw new Error("No file provided")
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB")
  }

  // Use our server-side API route instead of direct Cloudinary upload
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)

  let retries = 3
  let lastError: Error | null = null

  while (retries > 0) {
    try {
      // Use our server API route instead of direct Cloudinary access
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      const data = await response.json()

      if (!data.url) {
        throw new Error("No URL returned from upload API")
      }

      return data.url
    } catch (error) {
      retries--
      lastError = error instanceof Error ? error : new Error("Unknown error occurred")
      console.error(`Upload attempt failed (${3 - retries}/3):`, error)

      if (retries === 0) {
        throw lastError
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw new Error("Upload failed after multiple attempts")
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
      throw new Error("Failed to delete image")
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw error
  }
}
