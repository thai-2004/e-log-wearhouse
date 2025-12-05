import { API_CONFIG } from '@config'

// Inline SVG fallback để tránh phụ thuộc file tĩnh
export const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none">
    <rect width="160" height="160" fill="#f3f4f6"/>
    <path d="M52 66c0-10.493 8.507-19 19-19h18c10.493 0 19 8.507 19 19v28c0 10.493-8.507 19-19 19H71c-10.493 0-19-8.507-19-19V66Z" stroke="#9ca3af" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="80" cy="80" r="12" stroke="#9ca3af" stroke-width="6"/>
    <path d="m64 105 12-12 8 8 16-16" stroke="#9ca3af" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`)

export const resolveImageUrl = (url) => {
  if (!url) return FALLBACK_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }

  const backendBase = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '')
  const cleanPath = url
    .replace(/^\/?api\//, '') // bỏ tiền tố api/ nếu có
    .replace(/^\/?/, '')      // bỏ slash đầu

  if (cleanPath.startsWith('uploads/')) {
    return `${backendBase}/${cleanPath}`
  }

  // Mặc định gắn với backend (đảm bảo không trả về /imgaes lỗi chính tả)
  return `${backendBase}/${cleanPath}`
}
