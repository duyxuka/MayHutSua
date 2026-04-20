export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mayhutsua.com.vn/dataApi/api/app/';
export const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'https://mayhutsua.com.vn/dataApi/files/';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mayhutsua.com.vn/dataApi/';

export function getImageUrl(fileName: string): string {
  return fileName ? MEDIA_URL + fileName : '';
}