import type { Metadata } from 'next';
import { getCamNangBySlug } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import ChiTietCamNangPage from './chitiet';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';

export async function generateMetadata(
  { params }: { params: Promise<{ categorySlug: string; productSlug: string }> }
): Promise<Metadata> {
  try {
    const { categorySlug, productSlug } = await params;
    const article = await getCamNangBySlug(productSlug);

    const title = article?.titleSEO || article?.ten || 'Chi tiết cẩm nang';
    const description = article?.descriptionSEO || article?.mota || '';
    const keywords = article?.keyword || '';
    const robots = article?.trangThai ? 'index, follow' : 'noindex, nofollow';
    const ogImage = article?.anh
      ? getImageUrl(article.anh)
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
        url: `${siteUrl}/kien-thuc-me-be/${categorySlug}/${productSlug}`,
        siteName: 'mayhutsua.com.vn',
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        type: 'article',
        locale: 'vi_VN',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `${siteUrl}/kien-thuc-me-be/${categorySlug}/${productSlug}`,
      },
    };
  } catch {
    return {
      title: 'Chi tiết cẩm nang',
      description: 'Cẩm nang kiến thức mẹ bé tại mayhutsua.com.vn',
    };
  }
}

export default function Page() {
  return <ChiTietCamNangPage />;
}