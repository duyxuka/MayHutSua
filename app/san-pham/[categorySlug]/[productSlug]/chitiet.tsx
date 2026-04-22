'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  getSanPhamBySlug, getByDanhMucSP, getReviewsByProduct,
  createReview, getVouchersBySanPham, getMyVouchers, nhanVoucher, tangLuotXem
} from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import { isLoggedIn as checkLogin, getUserIdFromToken } from '@/lib/auth';
import VoucherList from '@/components/VoucherList';
import toast from 'react-hot-toast';
import './chitiet.css';

const VIEW_COOLDOWN_MS = 10 * 60 * 1000;
const VIEW_KEY = 'sp_viewed';

const AVATAR_PALETTE = [
  { bg: '#fde8f0', color: '#9d174d' }, { bg: '#e0f2fe', color: '#0c4a6e' },
  { bg: '#dcfce7', color: '#14532d' }, { bg: '#fef3c7', color: '#78350f' },
  { bg: '#ede9fe', color: '#4c1d95' }, { bg: '#fee2e2', color: '#7f1d1d' },
];

function getAvatarStyle(name: string) {
  if (!name) return AVATAR_PALETTE[0];
  let h = 0; for (const c of name) h += c.charCodeAt(0);
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export default function ChiTietSanPhamPage() {
  const { productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const PAGE_SIZE = 5;
  const [reviewForm, setReviewForm] = useState({ soSao: 0, tenNguoiDung: '', email: '', noiDung: '' });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  useEffect(() => {
    if (!productSlug) return;
    setLoading(true);
    getSanPhamBySlug(productSlug).then((res: any) => {
      setProduct(res);
      const imgs = res.anh ? [res.anh, ...(res.anhPhu || [])] : (res.anhPhu || []);
      setImages(imgs);
      setMainImage(res.anh || '');
      setSelectedOptions({});
      setSelectedVariant(null);
      setLoading(false);
      if (res.danhMucSlug) getByDanhMucSP(res.danhMucSlug).then(setRelated).catch(() => {});
      loadReviews(res.id);
      if (res.id) {
        getVouchersBySanPham(res.id).then(v => setVouchers(v || [])).catch(() => {});
        tryTangLuotXem(res.id);
      }
    }).catch(() => setLoading(false));

    if (isLoggedIn) getMyVouchers().then(r => setSavedIds(new Set(r.map((v: any) => v.id)))).catch(() => {});
  }, [productSlug, isLoggedIn]);

  function loadReviews(productId: string) {
    getReviewsByProduct(productId).then((res: any) => {
      setReviews(res || []);
      setReviewPage(1);
      const total = (res || []).reduce((a: number, b: any) => a + b.soSao, 0);
      setAvgRating(res?.length ? total / res.length : 0);
      const uid = getUserIdFromToken();
      setHasReviewed(uid ? (res || []).some((r: any) => r.userId === uid) : false);
    }).catch(() => {});
  }

  function tryTangLuotXem(id: string) {
    const raw = localStorage.getItem(VIEW_KEY);
    let viewed: Record<string, number> = {};
    try { if (raw) viewed = JSON.parse(raw); } catch {}
    const last = viewed[id];
    if (last && Date.now() - last < VIEW_COOLDOWN_MS) return;
    tangLuotXem(id).catch(() => {}).finally(() => {
      viewed[id] = Date.now();
      // Clean entries older than 24h
      const cutoff = Date.now() - 86400000;
      Object.keys(viewed).forEach(k => { if (viewed[k] < cutoff) delete viewed[k]; });
      localStorage.setItem(VIEW_KEY, JSON.stringify(viewed));
    });
  }

  function selectOption(name: string, val: string) {
    const opts = { ...selectedOptions, [name]: val };
    setSelectedOptions(opts);
    if (!product?.bienThes?.length || !product?.thuocTinhs?.length) { setSelectedVariant(null); return; }
    if (Object.keys(opts).length !== product.thuocTinhs.length) { setSelectedVariant(null); return; }
    const vals = Object.values(opts);
    const found = product.bienThes.find((b: any) => vals.every((v: any) => b.ten.includes(v))) || null;
    setSelectedVariant(found);
  }

  const displayPrice = selectedVariant
    ? (selectedVariant.giaKhuyenMai > 0 ? selectedVariant.giaKhuyenMai : selectedVariant.gia)
    : (product?.giaKhuyenMai > 0 ? product?.giaKhuyenMai : product?.gia) ?? 0;
  const originalPrice = selectedVariant
    ? (selectedVariant.giaKhuyenMai > 0 ? selectedVariant.gia : null)
    : (product?.giaKhuyenMai > 0 ? product?.gia : null);
  const canAdd = product ? (product.thuocTinhs?.length > 0 ? !!selectedVariant : true) : false;

  function handleAddToCart() {
    if (!product) return;
    if (product.thuocTinhs?.length > 0 && !selectedVariant) { toast.error('Vui lòng chọn đầy đủ thuộc tính sản phẩm'); return; }
    const gia = selectedVariant ? selectedVariant.gia : product.gia;
    const giaKhuyenMai = selectedVariant ? selectedVariant.giaKhuyenMai : product.giaKhuyenMai;
    addToCart({ id: product.id, bienTheId: selectedVariant?.id || null, ten: product.ten, slug: product.slug, danhMucSlug: product.danhMucSlug, anh: mainImage, gia, giaKhuyenMai, quantity, thuocTinhDaChon: { ...selectedOptions }, quaTangTen: product.quaTangTen, quaTangGia: product.quaTangGia });
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!checkLogin()) { toast.error('Bạn cần đăng nhập để đánh giá'); return; }
    if (!product) return;
    if (reviewForm.soSao < 1) { toast.error('Vui lòng chọn số sao đánh giá'); return; }
    if (!reviewForm.noiDung || reviewForm.noiDung.trim().length < 10) { toast.error('Nội dung đánh giá phải từ 10 ký tự trở lên'); return; }
    try {
      await createReview({ sanPhamId: product.id, ...reviewForm });
      toast.success('Đánh giá thành công');
      setReviewForm({ soSao: 0, tenNguoiDung: '', email: '', noiDung: '' });
      loadReviews(product.id);
    } catch (err: any) {
      toast.error(err?.message || 'Gửi đánh giá thất bại');
    }
  }

  function saveVoucher(id: string) {
    if (!isLoggedIn) { toast.error('Bạn cần đăng nhập để lưu voucher'); return; }
    if (savedIds.has(id)) return;
    nhanVoucher(id).then(() => setSavedIds(prev => new Set([...prev, id]))).catch(() => {});
  }

  const pagedReviews = reviews.slice((reviewPage - 1) * PAGE_SIZE, reviewPage * PAGE_SIZE);
  const totalReviewPages = Math.ceil(reviews.length / PAGE_SIZE);

  if (loading) return <div className="container py-5 text-center"><i className="fas fa-spinner fa-spin fa-2x"></i></div>;
  if (!product) return <div className="container py-5 text-center">Không tìm thấy sản phẩm</div>;

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">{product.ten}</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <Link href="/san-pham">Sản phẩm</Link>
              <span className="separator">&gt;</span>
              <span className="current">{product.ten}</span>
            </nav>
          </div>
        </div>
      </div>

      <VoucherList vouchers={vouchers} savedIds={savedIds} onSave={saveVoucher} />

      <div className="product-details space-top space-extra-bottom">
        <div className="container">
          <div className="row gy-4">
            {/* Images */}
            <div className="col-lg-6">
              <div className="product-big-img">
                <img src={getImageUrl(mainImage)} alt={product.ten} style={{ width: '100%', borderRadius: 12 }} />
              </div>
              {images.length > 1 && (
                <div className="product-thumb-list" style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <img key={i} src={getImageUrl(img)} alt="" onClick={() => setMainImage(img)}
                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: mainImage === img ? '2px solid #FE5A86' : '2px solid transparent' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="col-lg-6">
              <div className="product-about">
                <h2 className="product-title">{product.ten}</h2>
                <div className="product-rating" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                  <span style={{ fontSize: 14, color: '#666' }}>({reviews.length} đánh giá) · Đã bán: {product.luotMua?.toLocaleString('vi-VN')}</span>
                </div>

                <div className="price" style={{ fontSize: 26, fontWeight: 700, color: '#FE5A86', marginBottom: 8 }}>
                  {displayPrice.toLocaleString('vi-VN')} đ
                  {originalPrice && <del style={{ fontSize: 16, color: '#999', marginLeft: 12, fontWeight: 400 }}>{originalPrice.toLocaleString('vi-VN')} đ</del>}
                </div>

                {product.quaTangGia > 0 && (
                  <div style={{ background: '#fff0f7', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 14 }}>
                    <i className="fas fa-gift" style={{ color: '#FE5A86', marginRight: 8 }}></i>
                    Quà tặng: <strong>{product.quaTangTen}</strong>
                  </div>
                )}

                {/* Variant selection */}
                {product.thuocTinhs?.map((attr: any) => (
                  <div key={attr.ten} style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>{attr.ten}:</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {attr.giaTris.map((val: string) => (
                        <button key={val} onClick={() => selectOption(attr.ten, val)}
                          style={{ padding: '6px 16px', borderRadius: 20, border: selectedOptions[attr.ten] === val ? '2px solid #FE5A86' : '1px solid #ddd', background: selectedOptions[attr.ten] === val ? '#fff0f7' : '#fff', cursor: 'pointer', fontWeight: selectedOptions[attr.ten] === val ? 600 : 400 }}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div className="quantity" style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="quantity-minus qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}><i className="far fa-minus"></i></button>
                    <input type="number" className="qty-input" value={quantity} min={1} max={99} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                    <button className="quantity-plus qty-btn" onClick={() => setQuantity(q => q + 1)}><i className="far fa-plus"></i></button>
                  </div>
                  <button className="ot-btn" onClick={handleAddToCart} disabled={!canAdd} style={{ flex: 1 }}>
                    <i className="fa-light fa-basket-shopping me-2"></i>
                    {canAdd ? 'Thêm vào giỏ hàng' : 'Chọn thuộc tính trước'}
                  </button>
                </div>

                <Link href="/thanh-toan" className="ot-btn style2 w-100" style={{ display: 'block', textAlign: 'center' }}>
                  <i className="fas fa-bolt me-2"></i> Mua ngay
                </Link>

                <div style={{ marginTop: 20, fontSize: 14, color: '#555' }} dangerouslySetInnerHTML={{ __html: product.moTaNgan || '' }} />
              </div>
            </div>
          </div>

          {/* Description tabs */}
          <div className="mt-5">
            <ul className="nav nav-tabs" id="productTab">
              <li className="nav-item"><button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-desc">Mô tả</button></li>
              {product.huongDanSuDung && <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-guide">Hướng dẫn</button></li>}
              {product.thongSoKyThuat && <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-spec">Thông số</button></li>}
            </ul>
            <div className="tab-content border border-top-0 p-4 rounded-bottom">
              <div className="tab-pane fade show active" id="tab-desc">
                <div style={{ maxHeight: isDescExpanded ? 'none' : 1000, overflow: 'hidden', position: 'relative' }}
                  dangerouslySetInnerHTML={{ __html: product.moTa || '' }} />
                <button className="ot-btn mt-3" onClick={() => setIsDescExpanded(v => !v)}>
                  {isDescExpanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                </button>
              </div>
              <div className="tab-pane fade" id="tab-guide">
                <div dangerouslySetInnerHTML={{ __html: product.huongDanSuDung || '' }} />
              </div>
              <div className="tab-pane fade" id="tab-spec">
                <div dangerouslySetInnerHTML={{ __html: product.thongSoKyThuat || '' }} />
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="rv-wrap mt-5">
            <h3>Đánh giá sản phẩm ({reviews.length})</h3>
            {/* Star summary */}
            {reviews.length > 0 && (
              <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: '#f59e0b' }}>{avgRating.toFixed(1)}</div>
                  <div style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{reviews.length} đánh giá</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5,4,3,2,1].map(s => {
                    const cnt = reviews.filter(r => r.soSao === s).length;
                    const pct = reviews.length ? (cnt / reviews.length) * 100 : 0;
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ width: 16, fontSize: 13 }}>{s}★</span>
                        <div style={{ flex: 1, height: 8, background: '#eee', borderRadius: 4 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4 }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: '#888', width: 32 }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review list */}
            {pagedReviews.map((r, i) => {
              const av = getAvatarStyle(r.tenNguoiDung);
              return (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #eee' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {r.tenNguoiDung?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.tenNguoiDung}</div>
                    <div style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(r.soSao)}{'☆'.repeat(5 - r.soSao)}</div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{new Date(r.creationTime).toLocaleDateString('vi-VN')}</div>
                    <p style={{ margin: 0 }}>{r.noiDung}</p>
                  </div>
                </div>
              );
            })}

            {/* Review pagination */}
            {totalReviewPages > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setReviewPage(p)}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #ddd', background: p === reviewPage ? '#FE5A86' : '#fff', color: p === reviewPage ? '#fff' : '#333', cursor: 'pointer' }}>{p}</button>
                ))}
              </div>
            )}

            {/* Review form */}
            {isLoggedIn && !hasReviewed && (
              <form onSubmit={submitReview} style={{ background: '#f9f9f9', padding: 20, borderRadius: 12 }}>
                <h4 style={{ marginBottom: 16 }}>Viết đánh giá của bạn</h4>
                <div style={{ marginBottom: 12 }}>
                  <label>Chọn số sao</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, soSao: s }))}
                        style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: s <= reviewForm.soSao ? '#f59e0b' : '#ddd' }}>★</button>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input type="text" className="form-control" placeholder="Họ tên *"
                      value={reviewForm.tenNguoiDung} onChange={e => setReviewForm(f => ({ ...f, tenNguoiDung: e.target.value }))} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <input type="email" className="form-control" placeholder="Email"
                      value={reviewForm.email} onChange={e => setReviewForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <textarea className="form-control mb-3" rows={4} placeholder="Nội dung đánh giá (tối thiểu 10 ký tự) *"
                  value={reviewForm.noiDung} onChange={e => setReviewForm(f => ({ ...f, noiDung: e.target.value }))} required />
                <button type="submit" className="ot-btn">Gửi đánh giá</button>
              </form>
            )}
            {isLoggedIn && hasReviewed && <p className="text-muted">Bạn đã đánh giá sản phẩm này.</p>}
            {!isLoggedIn && <p><Link href="/dang-nhap" className="text-primary">Đăng nhập</Link> để viết đánh giá.</p>}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-4">Sản phẩm liên quan</h3>
              <div className="product-grid">
                {related.slice(0, 5).map((sp, i) => (
                  <div key={i} className="ot-product pcard">
                    <div className="product-img">
                      <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}>
                        <img src={getImageUrl(sp.anh)} alt={sp.ten} />
                      </Link>
                    </div>
                    <div className="product-content">
                      <h3 className="box-title"><Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}>{sp.ten}</Link></h3>
                      <div className="price">
                        {sp.giaKhuyenMai > 0
                          ? <>{sp.giaKhuyenMai.toLocaleString('vi-VN')} đ <del>{sp.gia.toLocaleString('vi-VN')} đ</del></>
                          : <>{sp.gia.toLocaleString('vi-VN')} đ</>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
