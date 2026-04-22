'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTinTucBySlug, getTinTucList, getSanPhamTopBanChay } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import './chitiettintuc.css';

export default function ChiTietTinTucPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getTinTucBySlug(slug).then(res => {
      setArticle(res);
      setLoading(false);
      getTinTucList(0, 10).then((r: any) => {
        const list = r.items || r;
        setRelated(list.filter((x: any) => x.id !== res.id).slice(0, 4));
      }).catch(() => {});
    }).catch(() => setLoading(false));
    getSanPhamTopBanChay(4).then(setFeatured).catch(() => {});
  }, [slug]);

  if (loading) return <div className="container py-5 text-center"><i className="fas fa-spinner fa-spin fa-2x"></i></div>;
  if (!article) return <div className="container py-5 text-center">Không tìm thấy bài viết</div>;

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">{article.ten}</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <Link href="/tin-tuc-khuyen-mai">Tin tức & Khuyến mãi</Link>
              <span className="separator">&gt;</span>
              <span className="current">{article.ten}</span>
            </nav>
          </div>
        </div>
      </div>

      <section className="ot-blog-wrapper blog-details space-top space-extra-bottom">
        <div className="container">
          <div className="row">
            {/* Main content */}
            <div className="col-xxl-8 col-lg-7">
              <div className="ot-blog blog-single">
                <div className="blog-img">
                  <img src={getImageUrl(article.anh)} alt={article.ten} />
                  <a className="blog-cat">Khuyến mãi</a>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <a><i className="far fa-calendar-days"></i>{new Date(article.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</a>
                    <a><i className="far fa-user"></i>By Admin</a>
                  </div>
                  <h2 className="blog-title">{article.ten}</h2>
                  <div dangerouslySetInnerHTML={{ __html: article.mota || '' }} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-xxl-4 col-lg-5 sidebar-wrap">
              <aside className="sidebar-area">
                {related.length > 0 && (
                  <div className="related-news">
                    <h3 className="widget_title mb-3">Tin tức liên quan</h3>
                    <div className="row">
                      {related.map((item, i) => (
                        <div key={i} className="col-md-6 mb-4">
                          <Link href={`/tin-tuc-khuyen-mai/${item.slug}`} className="related-news-card">
                            <div className="related-news-img"><img src={getImageUrl(item.anh)} alt={item.ten} /></div>
                            <div className="related-news-body">
                              <div className="related-news-date">
                                <i className="fa-solid fa-calendar-days" style={{ color: 'rgb(255, 75, 140)', marginRight: 6 }}></i>
                                {new Date(item.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                              <h5 className="related-news-title">{item.ten}</h5>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="widget widget_products">
                  <h3 className="widget_title">Sản phẩm bán chạy</h3>
                  <div className="sidebar-product-list">
                    {featured.map((p, i) => (
                      <div key={i} className="sidebar-product-item">
                        <Link href={`/san-pham/${p.danhMucSlug}/${p.slug}`} className="sidebar-product-link">
                          <div className="sidebar-product-img">
                            <img src={getImageUrl(p.anh)} alt={p.ten} />
                            {(p.hasVariants ? p.phanTramGiamGiaBienThe : p.phanTramGiamGia) > 0 && (
                              <span className="product-badge">-{p.hasVariants ? p.phanTramGiamGiaBienThe : p.phanTramGiamGia}%</span>
                            )}
                          </div>
                          <div className="sidebar-product-info">
                            <h4 className="sidebar-product-name">{p.ten}</h4>
                            <div className="sidebar-product-price">
                              {p.hasVariants ? (
                                <>
                                  <span className="price-new">{(p.giaKhuyenMaiBienTheMin || p.giaBienTheMin)?.toLocaleString('vi-VN')} ₫</span>
                                  {p.giaKhuyenMaiBienTheMin && p.giaKhuyenMaiBienTheMin < p.giaBienTheMin && (
                                    <span className="price-old">{p.giaBienTheMin?.toLocaleString('vi-VN')} ₫</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="price-new">{(p.giaKhuyenMai > 0 ? p.giaKhuyenMai : p.gia)?.toLocaleString('vi-VN')} ₫</span>
                                  {p.giaKhuyenMai > 0 && <span className="price-old">{p.gia?.toLocaleString('vi-VN')} ₫</span>}
                                </>
                              )}
                            </div>
                            {p.luotMua > 0 && <div className="product-sold"><i className="fa-solid fa-fire" style={{ color: 'rgb(255, 75, 140)' }}></i> Đã bán {p.luotMua}</div>}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <Link href="/san-pham" className="view-all-btn">Xem tất cả sản phẩm →</Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
