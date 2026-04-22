import type { Metadata } from 'next';
import { getDanhMucSPListAll } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import DanhMucSanPhamPage from './danhmucsanpham';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayhutsua.com.vn';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const categories = await getDanhMucSPListAll();
    const dm = categories?.find((c: any) => c.slug === slug);

    const title = dm?.titleSEO || dm?.ten || 'Danh mục sản phẩm';
    const description = dm?.descriptionSEO || '';
    const keywords = dm?.keyword || '';
    const robots = dm?.trangThai ? 'index, follow' : 'noindex, nofollow';
    const ogImage = dm?.anhThumbnail
      ? getImageUrl(dm.anhThumbnail)
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
        url: `${siteUrl}/danh-muc-san-pham/${slug}`,
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
        canonical: `${siteUrl}/danh-muc-san-pham/${slug}`,
      },
    };
  } catch {
    return {
      title: 'Danh mục sản phẩm',
      description: 'Sản phẩm máy hút sữa chính hãng tại mayhutsua.com.vn',
    };
  }
}

export default function Page() {
  return <DanhMucSanPhamPage />;
}