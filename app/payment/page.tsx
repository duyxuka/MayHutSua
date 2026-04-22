import type { Metadata } from 'next';
import { getSeoByPageKey } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import KetQuaThanhToanPage from './payment';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await getSeoByPageKey('KetQuaThanhToan');
    const title = seo?.seoTitle || 'Kết quả thanh toán';
    const description = seo?.seoDescription || '';
    const ogTitle = seo?.ogTitle || title;
    const ogDescription = seo?.ogDescription || description;
    const ogImage = seo?.ogImageUrl
      ? getImageUrl(seo.ogImageUrl)
      : `${siteUrl}/default-og-image.jpg`;

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords: seo?.seoKeywords || '',
      robots: seo?.robots || 'noindex, nofollow',
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url: `${siteUrl}/payment`,
        siteName: 'mayhutsua.com.vn',
        images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
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
        canonical: `${siteUrl}/payment`,
      },
    };
  } catch {
    return {
      title: 'Kết quả thanh toán',
      description: 'Kết quả thanh toán tại mayhutsua.com.vn',
      robots: 'noindex, nofollow',
    };
  }
}

export default function Page() {
  return <KetQuaThanhToanPage />;
}