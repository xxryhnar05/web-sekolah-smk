const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const IMAGE_UPLOAD_ACCEPT = SUPPORTED_IMAGE_TYPES.join(',')

// Foto HEIC dari iPhone bisa masuk ke storage, tetapi tidak tampil di sebagian besar browser.
export function getImageUploadError(file: File): string | null {
  if (SUPPORTED_IMAGE_TYPES.includes(file.type)) return null

  return `Format file "${file.name}" belum didukung. Gunakan foto JPG, PNG, atau WEBP. Foto iPhone (HEIC) perlu diubah ke JPG terlebih dahulu.`
}
