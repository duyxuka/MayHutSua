import type { Metadata } from 'next';
import { getSeoByPageKey } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import TrangChuClient from './trangchu';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await getSeoByPageKey('TrangChu');
    const title = seo?.seoTitle || 'Máy hút sữa Spectra chính hãng giá tốt';
    const description = seo?.seoDescription || '';
    const keywords = seo?.seoKeywords || '';
    const robots = seo?.robots || 'index, follow';

    const ogTitle = seo?.ogTitle || title;
    const ogDescription = seo?.ogDescription || description;
    const ogImage = seo?.ogImageUrl
      ? getImageUrl(seo.ogImageUrl)
      : `${siteUrl}/default-og-image.jpg`;

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords,
      robots,

      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url: siteUrl,
        siteName: 'mayhutsua.com.vn',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: ogTitle,
          },
        ],
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
        canonical: siteUrl,
      },
    };
  } catch (error) {
    return {
      metadataBase: new URL(siteUrl),
      title: 'Máy hút sữa Spectra chính hãng giá tốt',
      description: 'Chuyên cung cấp máy hút sữa chính hãng, giá tốt.',
    };
  }
}

export default function Page() {
  return <TrangChuClient />;
}