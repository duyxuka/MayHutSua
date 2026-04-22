'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getListFilterSanPham, getListAllVouchers, getMyVouchers, nhanVoucher } from '@/lib/api';
import ProductGrid, { Pagination } from '@/components/ProductGrid';
import VoucherList from '@/components/VoucherList';
import toast from 'react-hot-toast';

export default function SanPhamPage() {
  const { isLoggedIn } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(total / pageSize);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => { loadData(1, keyword, sort); }, []);
  useEffect(() => {
    getListAllVouchers(1).then(r => setVouchers(r || [])).catch(() => {});
    if (isLoggedIn) getMyVouchers().then(r => setSavedIds(new Set(r.map((v: any) => v.id)))).catch(() => {});
  }, [isLoggedIn]);

  function loadData(p: number, kw: string, s: string) {
    setIsLoading(true);
    getListFilterSanPham({ keyword: kw, sort: s, skipCount: (p - 1) * pageSize, maxResultCount: pageSize })
      .then(res => { setProducts(res.items || []); setTotal(res.totalCount); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadData(1, keyword, sort);
  }

  function handleSort(s: string) {
    setSort(s); setPage(1);
    loadData(1, keyword, s);
  }

  function handlePage(p: number) {
    setPage(p);
    loadData(p, keyword, sort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function saveVoucher(id: string) {
    if (!isLoggedIn) { toast.error('Bạn cần đăng nhập để lưu voucher'); return; }
    if (savedIds.has(id)) return;
    nhanVoucher(id).then(() => setSavedIds(prev => new Set([...prev, id]))).catch(() => {});
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Danh sách sản phẩm</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Danh sách sản phẩm</span>
            </nav>
          </div>
        </div>
      </div>

      <VoucherList vouchers={vouchers} savedIds={savedIds} onSave={saveVoucher} />

      <section className="space-extra-bottom" id="blog-sec">
        <div className="container">
          {/* Sort bar */}
          <div className="sortbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12, backgroundColor: 'white', padding: '15px', borderRadius: '20px' }}>
            <div>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                <input type="text" className="form-control" placeholder="Tìm kiếm sản phẩm..."
                  value={keyword} onChange={e => setKeyword(e.target.value)} style={{ maxWidth: 260 }} />
                <button type="submit" className="ot-btn"><i className="far fa-search"></i></button>
              </form>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!isLoading && <span className="text-muted" style={{ fontSize: 14 }}>Hiển thị {from}–{to} / {total} sản phẩm</span>}
              <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={e => handleSort(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="best_seller">Bán chạy nhất</option>
              </select>
            </div>
          </div>

          <ProductGrid products={products} isLoading={isLoading} />
          <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
        </div>
      </section>
    </>
  );
}
