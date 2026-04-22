import type { Metadata } from 'next';
import { getSanPhamBySlug } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import ChiTietSanPhamPage from './chitiet';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';

export async function generateMetadata(
  { params }: { params: Promise<{ categorySlug: string; productSlug: string }> }
): Promise<Metadata> {
  try {
    const { categorySlug, productSlug } = await params;
    const product = await getSanPhamBySlug(productSlug);

    const title = product?.titleSEO || product?.ten || 'Chi tiết sản phẩm';
    const description = product?.descriptionSEO || product?.moTaNgan || '';
    const keywords = product?.keyword || '';
    const robots = product?.trangThai ? 'index, follow' : 'noindex, nofollow';
    const ogImage = product?.anh
      ? getImageUrl(product.anh)
      : `${siteUrl}/default-og-image.jpg`;

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords,
      robots,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/san-pham/${categorySlug}/${productSlug}`,
        siteName: 'mayhutsua.com.vn',
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        type: 'website',
        locale: 'vi_VN',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `${siteUrl}/san-pham/${categorySlug}/${productSlug}`,
      },
    };
  } catch {
    return {
      title: 'Chi tiết sản phẩm',
      description: 'Sản phẩm máy hút sữa chính hãng tại mayhutsua.com.vn',
    };
  }
}

export default function Page() {
  return <ChiTietSanPhamPage />;
}