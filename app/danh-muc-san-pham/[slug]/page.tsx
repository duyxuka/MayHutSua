'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getListFilterSanPham, getVouchersByDanhMuc, getMyVouchers, nhanVoucher, getDanhMucSPListAll } from '@/lib/api';
import ProductGrid, { Pagination } from '@/components/ProductGrid';
import VoucherList from '@/components/VoucherList';
import toast from 'react-hot-toast';

export default function DanhMucSanPhamPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isLoggedIn } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(total / pageSize);
  const [sort, setSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [danhMucTen, setDanhMucTen] = useState('');
  const [danhMucId, setDanhMucId] = useState('');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!slug) return;
    // Get category name
    getDanhMucSPListAll().then(dms => {
      const dm = dms.find((d: any) => d.slug === slug);
      if (dm) { setDanhMucTen(dm.ten); setDanhMucId(dm.id); }
    }).catch(() => {});
    loadData(1, sort);
  }, [slug]);

  useEffect(() => {
    if (!danhMucId) return;
    getVouchersByDanhMuc(danhMucId).then(r => setVouchers(r || [])).catch(() => {});
  }, [danhMucId]);

  useEffect(() => {
    if (isLoggedIn) getMyVouchers().then(r => setSavedIds(new Set(r.map((v: any) => v.id)))).catch(() => {});
  }, [isLoggedIn]);

  function loadData(p: number, s: string) {
    setIsLoading(true);
    getListFilterSanPham({ danhMucSlug: slug, sort: s, skipCount: (p - 1) * pageSize, maxResultCount: pageSize })
      .then(res => { setProducts(res.items || []); setTotal(res.totalCount); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }

  function handleSort(s: string) { setSort(s); setPage(1); loadData(1, s); }
  function handlePage(p: number) { setPage(p); loadData(p, sort); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function saveVoucher(id: string) {
    if (!isLoggedIn) { toast.error('Bạn cần đăng nhập để lưu voucher'); return; }
    if (savedIds.has(id)) return;
    nhanVoucher(id).then(() => setSavedIds(prev => new Set([...prev, id]))).catch(() => {});
  }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">{danhMucTen || 'Danh mục sản phẩm'}</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <Link href="/san-pham">Sản phẩm</Link>
              <span className="separator">&gt;</span>
              <span className="current">{danhMucTen}</span>
            </nav>
          </div>
        </div>
      </div>

      <VoucherList vouchers={vouchers} savedIds={savedIds} onSave={saveVoucher} />

      <section className="space-extra-bottom">
        <div className="container">
          <div className="sortbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12, backgroundColor: 'white', padding: '15px', borderRadius: '20px', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}>
            <span className="text-muted" style={{ fontSize: 14 }}>{!isLoading && `${total} sản phẩm`}</span>
            <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={e => handleSort(e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="best_seller">Bán chạy nhất</option>
            </select>
          </div>
          <ProductGrid products={products} isLoading={isLoading} />
          <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
        </div>
      </section>
    </>
  );
}
