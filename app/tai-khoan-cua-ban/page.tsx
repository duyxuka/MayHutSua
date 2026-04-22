import type { Metadata } from 'next';
import { getSeoByPageKey } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import TaiKhoanCuaBanPage from './taikhoancuaban';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await getSeoByPageKey('ThongTinCaNhan');
    const title = seo?.seoTitle || 'Thông tin cá nhân';
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
        url: `${siteUrl}/tai-khoan-cua-ban`,
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
        canonical: `${siteUrl}/tai-khoan-cua-ban`,
      },
    };
  } catch {
    return {
      title: 'Thông tin cá nhân',
      description: 'Xem và quản lý thông tin cá nhân của bạn tại mayhutsua.com.vn',
      robots: 'noindex, nofollow',
    };
  }
}

export default function Page() {
  return <TaiKhoanCuaBanPage />;
}