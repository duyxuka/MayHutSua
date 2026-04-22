import type { Metadata } from 'next';
import { getDanhMucCamNangListAll } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import DanhMucKienThucPage from './danhmuckienthuc';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const categories = await getDanhMucCamNangListAll();
    const dm = categories?.find((c: any) => c.slug === slug);
    const title = dm?.titleSEO || dm?.ten || 'Danh mục cẩm nang';
    const description = dm?.descriptionSEO || '';
    const keywords = dm?.keyword || '';
    const robots = dm?.trangThai ? 'index, follow' : 'noindex, nofollow';
    const ogImage = dm?.anh
      ? getImageUrl(dm.anh)
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
        url: `${siteUrl}/danh-muc-kien-thuc/${params.slug}`,
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
        canonical: `${siteUrl}/danh-muc-kien-thuc/${params.slug}`,
      },
    };
  } catch {
    return {
      title: 'Danh mục cẩm nang',
      description: 'Cẩm nang kiến thức mẹ bé tại mayhutsua.com.vn',
    };
  }
}

export default function Page() {
  return <DanhMucKienThucPage />;
}