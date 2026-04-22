import type { Metadata } from 'next';
import { getTinTucBySlug } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import ChiTietTinTucPage from './chitiettintuc';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getTinTucBySlug(slug);

    const title = article?.titleSEO || article?.ten || 'Chi tiết tin tức';
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
        url: `${siteUrl}/tin-tuc-khuyen-mai/${slug}`,
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
        canonical: `${siteUrl}/tin-tuc-khuyen-mai/${slug}`,
      },
    };
  } catch {
    return {
      title: 'Chi tiết tin tức',
      description: 'Tin tức & khuyến mãi tại mayhutsua.com.vn',
    };
  }
}

export default function Page() {
  return <ChiTietTinTucPage />;
}