'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getListFilterTinTuc } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import { Pagination } from '@/components/ProductGrid';

export default function TinTucPage() {
  const [news, setNews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => { loadData(1); }, []);

  function loadData(p: number) {
    getListFilterTinTuc({ skipCount: (p - 1) * pageSize, maxResultCount: pageSize })
      .then(res => { setNews(res.items || []); setTotal(res.totalCount); })
      .catch(() => {});
  }

  function handlePage(p: number) { setPage(p); loadData(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Tin tức - Khuyến mãi</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Tin tức - Khuyến mãi</span>
            </nav>
          </div>
        </div>
      </div>

      <section className="space-top space-extra-bottom" id="blog-sec">
        <div className="container">
          <div className="row gy-4 justify-content-center">
            {news.map((item, i) => (
              <div key={i} className="col-xl-4 col-md-6">
                <div className="blog-card style2">
                  <div className="blog-img">
                    <Link href={`/tin-tuc-khuyen-mai/${item.slug}`}><img src={getImageUrl(item.anh)} alt="blog image" /></Link>
                    <span className="blog-tag">Hot</span>
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <Link href={`/tin-tuc-khuyen-mai/${item.slug}`}>
                        <i className="far fa-calendar-days"></i>
                        {new Date(item.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Link>
                      <Link href={`/tin-tuc-khuyen-mai/${item.slug}`}><i className="far fa-user"></i>Admin mayhutsua.com.vn</Link>
                    </div>
                    <h3 className="box-title"><Link href={`/tin-tuc-khuyen-mai/${item.slug}`}>{item.ten}</Link></h3>
                    <Link href={`/tin-tuc-khuyen-mai/${item.slug}`} className="link-btn">Xem thêm<i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="ot-pagination text-center mt-40">
            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
          </div>
        </div>
      </section>
    </>
  );
}
