'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getListFilterCamNang, getDanhMucCamNangListAll } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import { Pagination } from '@/components/ProductGrid';
import styles from './danhmuckienthuc.module.css';

export default function DanhMucKienThucPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const pageSize = 5;
  const totalPages = Math.ceil(total / pageSize);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<any>(null);

  useEffect(() => {
    getDanhMucCamNangListAll().then(res => {
      setCategories(res || []);
      const found = (res || []).find((c: any) => c.slug === slug);
      setSelectedCat(found || null);
    }).catch(() => {});
    loadData(1, '');
  }, [slug]);

  function loadData(p: number, kw: string) {
    getListFilterCamNang({ keyword: kw || undefined, skipCount: (p - 1) * pageSize, maxResultCount: pageSize, danhMucSlug: slug })
      .then(res => { setItems(res.items || []); setTotal(res.totalCount); })
      .catch(() => {});
  }

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); loadData(1, keyword); }
  function handlePage(p: number) { setPage(p); loadData(p, keyword); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function changeCategory(catSlug: string) {
    if (catSlug === slug) router.push('/kien-thuc-me-be');
    else router.push(`/danh-muc-kien-thuc/${catSlug}`);
  }

  return (
  <>
    <div className={styles.breadcrumbWrapper}>
      <div className="container">
        <div className="breadcrumb-content">
          <h1 className="page-title">{selectedCat?.ten || 'Danh mục cẩm nang'}</h1>
          <nav className="breadcrumb-nav">
            <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
            <span className="separator">&gt;</span>
            <Link href="/kien-thuc-me-be">Cẩm nang</Link>
            {selectedCat && <><span className="separator">&gt;</span><span className={styles.current}>{selectedCat.ten}</span></>}
          </nav>
        </div>
      </div>
    </div>

    <section className="ot-blog-wrapper space-top space-extra-bottom">
      <div className="container">
        <div className="row">
          {/* Main list */}
          <div className={`col-xxl-9 col-lg-8 ${styles.danhmuccamnang}`}>
            {items.map((item, i) => (
              <div key={i} className={`ot-blog ${styles.blogSingle} has-post-thumbnail`}>
                <div className={styles.blogImg}>
                  <Link href={`/kien-thuc-me-be/${item.slugDanhMuc}/${item.slug}`}>
                    <img src={getImageUrl(item.anh)} alt="Blog Image" />
                  </Link>
                  <Link href={`/kien-thuc-me-be/${item.slugDanhMuc}/${item.slug}`} className="blog-cat">{item.tenDanhMuc}</Link>
                </div>
                <div className={styles.blogContent}>
                  <div className="blog-meta">
                    <Link href={`/kien-thuc-me-be/${item.slugDanhMuc}/${item.slug}`}>
                      <i className="far fa-calendar-days"></i>
                      {new Date(item.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Link>
                  </div>
                  <h2 className="blog-title">
                    <Link href={`/kien-thuc-me-be/${item.slugDanhMuc}/${item.slug}`}>{item.ten}</Link>
                  </h2>
                  <div className="blog-text" dangerouslySetInnerHTML={{ __html: (item.mota || '') + ' ...' }} />
                  <Link href={`/kien-thuc-me-be/${item.slugDanhMuc}/${item.slug}`} className="ot-btn">
                    Xem thêm<i className="fas fa-arrow-right ms-2"></i>
                  </Link>
                </div>
              </div>
            ))}
            <div className="ot-pagination text-center">
              {/* Truyền styles vào nếu component Pagination hỗ trợ class qua props */}
              <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-xxl-3 col-lg-4 sidebar-wrap">
            <aside className="sidebar-area">
              <div className={`widget ${styles.widget_search}`}>
                <form className="search-form" onSubmit={handleSearch}>
                  <input type="text" placeholder="Tìm kiếm..." value={keyword} onChange={e => setKeyword(e.target.value)} />
                  <button type="submit"><i className="far fa-search"></i></button>
                </form>
              </div>
              <div className="widget widget_categories">
                <h3 className="widget_title">Danh mục cẩm nang</h3>
                <ul>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <a 
                        href="#" 
                        className={slug === cat.slug ? styles.active : ''} 
                        onClick={e => { e.preventDefault(); changeCategory(cat.slug); }}
                      >
                        {cat.ten}
                      </a>
                      <span className={slug === cat.slug ? styles.active : ''}>({cat.soLuongCamNang})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  </>
 );
}
