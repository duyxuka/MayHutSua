'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  getAllBanner, getDanhMucSPListAll, getListFilterSanPham,
  getSanPhamBanChay, getCamNangHomeMoiNhat, getTikTokVideos,
  getListAllVouchers, getMyVouchers, nhanVoucher
} from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import toast from 'react-hot-toast';

// ── helpers ─────────────────────────────────────────────────────────
function numberShort(n: number) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return String(n);
}
function priceDisplay(sp: any) {
  if (!sp.hasVariants) {
    return sp.giaKhuyenMai > 0
      ? <><span className="price">{sp.giaKhuyenMai.toLocaleString('vi-VN')} đ</span> <del>{sp.gia.toLocaleString('vi-VN')} đ</del></>
      : <span className="price">{sp.gia.toLocaleString('vi-VN')} đ</span>;
  }
  const km = sp.giaKhuyenMaiBienTheMin;
  const min = sp.giaBienTheMin; const max = sp.giaBienTheMax;
  const kmMax = sp.giaKhuyenMaiBienTheMax;
  const origStr = min === max ? `${min?.toLocaleString('vi-VN')} đ` : `${min?.toLocaleString('vi-VN')} - ${max?.toLocaleString('vi-VN')} đ`;
  if (!km || km === 0) return <span className="price">{origStr}</span>;
  const kmStr = km === kmMax ? `${km?.toLocaleString('vi-VN')} đ` : `${km?.toLocaleString('vi-VN')} - ${kmMax?.toLocaleString('vi-VN')} đ`;
  return <><span className="price">{kmStr}</span> <del>{origStr}</del></>;
}
function voucherScopeClass(p: number) { return p === 1 ? 'scope-shop' : p === 2 ? 'scope-product' : p === 3 ? 'scope-cat' : ''; }
function voucherIcon(l: number) { return l === 1 ? 'fa-regular fa-ticket-perforated' : l === 2 ? 'fa-regular fa-truck' : l === 3 ? 'fa-regular fa-rotate-left' : 'fa-regular fa-ticket'; }
function voucherScope(p: number) { return p === 1 ? 'Toàn shop' : p === 2 ? 'Sản phẩm này' : p === 3 ? 'Danh mục này' : 'Khuyến mãi'; }
function voucherType(l: number) { return l === 1 ? 'Giảm đơn' : l === 2 ? 'Miễn ship' : l === 3 ? 'Hoàn tiền' : 'Khuyến mãi'; }

// ── Simple Banner Slider ──────────────────────────────────────────────
function BannerSlider({ banners, isMobile }: { banners: any[]; isMobile: boolean }) {
  const [cur, setCur] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => setCur(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  if (!banners.length) return null;
  const banner = banners[cur];
  const img = isMobile && banner.anhMobile ? banner.anhMobile : banner.anh;

  return (
    <div className="ot-hero-wrapper hero-1" style={{ position: 'relative' }}>
      <div className="hero-inner">
        <div className="container-fluid">
          <div className="hero-wrap1"
            style={{ backgroundImage: `url(${getImageUrl(img)})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
            <div className="hero-style1">
              <div className="btn-group">
                <a href={banner.lienKet} className="ot-btn style-white">Vào gian hàng <i className="fas fa-arrow-right ms-2"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Dots */}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {banners.map((_, i) => (
            <span key={i} onClick={() => setCur(i)}
              style={{ width: 10, height: 10, borderRadius: '50%', background: i === cur ? '#fff' : 'rgba(255,255,255,.5)', cursor: 'pointer' }} />
          ))}
        </div>
      )}
      {/* Prev / Next */}
      {banners.length > 1 && <>
        <button onClick={() => setCur(c => (c - 1 + banners.length) % banners.length)}
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.35)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', cursor: 'pointer' }}>‹</button>
        <button onClick={() => setCur(c => (c + 1) % banners.length)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.35)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', cursor: 'pointer' }}>›</button>
      </>}
    </div>
  );
}

// ── Video carousel ────────────────────────────────────────────────────
function VideoCarousel({ videos, onOpen }: { videos: any[]; onOpen: (id: string) => void }) {
  const [start, setStart] = useState(0);
  const visible = 4;
  if (!videos.length) return null;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(visible, videos.length)}, 1fr)`, gap: 12 }}>
        {videos.slice(start, start + visible).map((v, i) => (
          <div key={i} className="video-item" onClick={() => onOpen(v.videoId)} style={{ cursor: 'pointer' }}>
            <img src={`https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`} alt={v.title} style={{ width: '100%', borderRadius: 8 }} />
            <div className="overlay"></div>
            <div className="play-btn">▶</div>
            <div className="caption">{v.title}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
        {start > 0 && <button className="ot-btn" onClick={() => setStart(s => s - visible)}>‹ Trước</button>}
        {start + visible < videos.length && <button className="ot-btn" onClick={() => setStart(s => s + visible)}>Tiếp ›</button>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function TrangChuPage() {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [danhMucs, setDanhMucs] = useState<any[]>([]);
  const [sanPhams, setSanPhams] = useState<any[]>([]);
  const [sanPhamsBanChay, setSanPhamsBanChay] = useState<any[]>([]);
  const [camNangMoiNhat, setCamNangMoiNhat] = useState<any[]>([]);
  const [tiktokVideos, setTiktokVideos] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<Set<string>>(new Set());
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<any>(null);
  const [thumbnailLeft, setThumbnailLeft] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 4;
  const [isMobile, setIsMobile] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    Promise.all([
      getAllBanner(),
      getDanhMucSPListAll(),
      getSanPhamBanChay(),
      getCamNangHomeMoiNhat(),
      getTikTokVideos('HomePage'),
      getListAllVouchers(1),
    ]).then(([b, dm, bc, cn, tv, vc]) => {
      setBanners(b || []);
      const dms = dm || [];
      setDanhMucs(dms);
      setSanPhamsBanChay(bc || []);
      setCamNangMoiNhat(cn || []);
      setTiktokVideos(tv || []);
      setVouchers(vc || []);
      setIsLoading(false);
      if (dms.length > 0) handleSelectDanhMuc(dms[0], 1);
    }).catch(() => setIsLoading(false));

    if (isLoggedIn) {
      getMyVouchers().then(r => setSavedVoucherIds(new Set(r.map((v: any) => v.id)))).catch(() => {});
    }
  }, [isLoggedIn]);

  function handleSelectDanhMuc(dm: any, p = 1) {
    setSelectedDanhMuc(dm);
    setPage(p);
    setThumbnailLeft(dm.anhThumbnail ? getImageUrl(dm.anhThumbnail) : null);
    getListFilterSanPham({ danhMucSlug: dm.slug, skipCount: (p - 1) * pageSize, maxResultCount: pageSize })
      .then(res => { setSanPhams(res.items || []); setTotalPages(Math.ceil(res.totalCount / pageSize)); })
      .catch(() => {});
  }

  function changePage(p: number) {
    if (!selectedDanhMuc || p === page) return;
    setPage(p);
    getListFilterSanPham({ danhMucSlug: selectedDanhMuc.slug, skipCount: (p - 1) * pageSize, maxResultCount: pageSize })
      .then(res => { setSanPhams(res.items || []); })
      .catch(() => {});
  }

  function getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxV = 3, half = Math.floor(maxV / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxV - 1);
    if (end - start + 1 < maxV) start = Math.max(1, end - maxV + 1);
    if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  }

  function saveVoucher(id: string) {
    if (!isLoggedIn) { toast.error('Bạn cần đăng nhập để lưu voucher'); return; }
    if (savedVoucherIds.has(id)) return;
    nhanVoucher(id).then(() => setSavedVoucherIds(prev => new Set([...prev, id]))).catch(() => {});
  }

  function handleAddToCart(sp: any) {
    addToCart({
      id: sp.id, ten: sp.ten, anh: sp.anh, gia: sp.gia, giaKhuyenMai: sp.giaKhuyenMai,
      slug: sp.slug, danhMucSlug: sp.danhMucSlug, phanTramGiamGia: sp.phanTramGiamGia,
      tenQuaTang: sp.quaTangGia > 0 ? sp.quaTangTen : null, giaQuaTang: sp.quaTangGia > 0 ? sp.quaTangGia : 0
    });
  }

  return (
    <>
      {/* ── Loading skeleton ── */}
      {isLoading && (
        <>
          <div style={{ padding: '0 50px' }}><div className="sk sk-banner"></div></div>
          <section className="mt-30 mb-30">
            <div className="container">
              <div className="sk-feature-row">
                {[1,2,3,4].map(i => (
                  <div key={i} className="sk-feature-card">
                    <div className="sk sk-icon"></div>
                    <div className="sk-text"><div className="sk sk-line sk-line-title"></div><div className="sk sk-line sk-line-sub"></div></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Banner + Features ── */}
      {!isLoading && (
        <>
          <BannerSlider banners={banners} isMobile={isMobile} />
          <section className="mt-30 mb-30">
            <div className="container">
              <div className="row gy-4">
                {[
                  { color: '#00BBAE', icon: 'feature-icon1-1.svg', title: 'Đổi trả & hoàn tiền', text: 'Chính sách 1 đổi 1 rõ ràng' },
                  { color: '#C062D0', icon: 'feature-icon1-2.svg', title: 'Cam kết chất lượng', text: 'Sản phẩm chính hãng 100%' },
                  { color: '#71D863', icon: 'feature-icon1-3.svg', title: 'Hỗ trợ chất lượng', text: 'Luôn trực tuyến 24/7' },
                  { color: '#16C4E3', icon: 'feature-icon1-4.svg', title: 'Khuyến mãi hàng ngày', text: 'Giảm 5% đơn hàng đầu tiên' },
                ].map((f, i) => (
                  <div key={i} className="col-lg-3 col-6">
                    <div className="feature-list" style={{ '--theme-color': f.color } as any}>
                      <div className="box-icon"><img src={`/assets/img/icon/${f.icon}`} alt="icon" /></div>
                      <div className="media-body">
                        <h3 className="box-title">{f.title}</h3>
                        <p className="box-text">{f.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Vouchers ── */}
      {vouchers.length > 0 && (
        <section className="mt-30 mb-30" style={{ padding: 13 }}>
          <div className="container" style={{ padding: 25, borderRadius: 20, boxShadow: 'rgba(0,0,0,0.24) 0px 3px 8px' }}>
            <div className="product-voucher-wrap">
              <div className="product-voucher-label">
                <i className="fa-regular fa-ticket" style={{ color: '#ee4d2d' }}></i> Mã giảm giá áp dụng
              </div>
              <div className="product-voucher-list">
                {vouchers.map((v, i) => (
                  <div key={i} className="pv-card">
                    <div className={`pv-left ${voucherScopeClass(v.phamVi)}`}>
                      <div className="pv-notch-top"></div><div className="pv-notch-bot"></div>
                      <div className="pv-icon"><i className={voucherIcon(v.loaiVoucher)}></i></div>
                      <span className="pv-scope-text">{voucherScope(v.phamVi)}</span>
                      <span className="pv-badge-type">{voucherType(v.loaiVoucher)}</span>
                    </div>
                    <div className="pv-right">
                      <div className="pv-top">
                        <div className="pv-info">
                          <span className="pv-title">{v.laPhanTram ? `Giảm ${v.giamGia}%` : `Giảm ${v.giamGia?.toLocaleString('vi-VN')}đ`}</span>
                          <span className="pv-sub">{v.laPhanTram && v.giamToiDa && `Tối đa ${v.giamToiDa?.toLocaleString('vi-VN')}đ · `}Đơn từ {v.donHangToiThieu?.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <button className={`pv-save-btn${savedVoucherIds.has(v.id) ? ' saved' : ''}`}
                          disabled={savedVoucherIds.has(v.id)} onClick={() => saveVoucher(v.id)}
                          title={savedVoucherIds.has(v.id) ? 'Đã lưu trong ví' : 'Lưu vào ví'}>
                          {savedVoucherIds.has(v.id)
                            ? <><i className="fa-solid fa-bookmark me-1"></i>Đã lưu</>
                            : <><i className="fa-regular fa-bookmark me-1"></i>Lưu</>}
                        </button>
                      </div>
                      <div className="pv-bottom">
                        <div className="pv-bar-bg"><div className="pv-bar-fill" style={{ width: `${v.phanTramDaDung ?? 0}%` }}></div></div>
                        <div className="pv-meta">
                          <span>Đã dùng {v.phanTramDaDung}%</span>
                          <span>{v.thoiHanKetThuc ? `Thời hạn: ${new Date(v.thoiHanKetThuc).toLocaleDateString('vi-VN')}` : 'Không giới hạn'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Product section by category ── */}
      <section className="position-relative space overflow-hidden bg-smoke3">
        <div className="cloud-bg-top-shape1" style={{ backgroundImage: 'url(/assets/img/shape/cloud.png)' }}></div>
        <div className="cloud-bg-bottom-shape1" style={{ backgroundImage: 'url(/assets/img/shape/cloud.png)' }}></div>
        <div className="products-section">
          <div className="container">
            <div className="sec-head">
              <div className="sec-head-left">
                <div className="eyebrow"><span className="eyebrow-bar"></span> Danh mục sản phẩm</div>
                <h4 className="sec-title">Sản phẩm của chúng tôi</h4>
              </div>
              <Link href="/san-pham" className="btn-viewall">Xem tất cả <i className="fas fa-arrow-right"></i></Link>
            </div>

            {/* Category tabs */}
            <div className="cat-tabs">
              {danhMucs.map(dm => (
                <button key={dm.id} className={`cat-tab${dm.slug === selectedDanhMuc?.slug ? ' active' : ''}`}
                  onClick={() => handleSelectDanhMuc(dm, 1)}>{dm.ten}</button>
              ))}
            </div>

            {/* Category banner */}
            <div className="cat-banner">
              <img src={thumbnailLeft || '/assets/img/normal/ad1-1.png'} alt={selectedDanhMuc?.ten} />
              <div className="cat-banner-overlay"></div>
              <div className="cat-banner-content">
                <div className="cat-banner-label"><i className="fas fa-star" style={{ fontSize: 10 }}></i> Danh mục nổi bật</div>
                <div className="cat-banner-title">{selectedDanhMuc?.ten}<br />Chính hãng 100%</div>
                <div className="cat-banner-sub">Bảo hành toàn quốc · Đổi trả 1-1 · Miễn phí ship</div>
                <Link href="/san-pham" className="cat-banner-btn">Khám phá ngay <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Product grid */}
            <div className="product-grid">
              {sanPhams.map((sp, i) => (
                <div key={i} className="ot-product pcard">
                  <div className="product-img">
                    <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}><img src={getImageUrl(sp.anh)} alt="Product" /></Link>
                    {!sp.hasVariants && sp.phanTramGiamGia ? <span className="product-tag">-{sp.phanTramGiamGia}%</span> : null}
                    {sp.hasVariants && sp.phanTramGiamGiaBienThe ? <span className="product-tag">-{sp.phanTramGiamGiaBienThe}%</span> : null}
                    <div className="actions">
                      <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`} className="icon-btn"><i className="far fa-eye"></i></Link>
                    </div>
                  </div>
                  <div className="product-content">
                    <h3 className="box-title"><Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`} title={sp.ten}>{sp.ten}</Link></h3>
                    <div className="pcard-meta">
                      <div className="pcard-stars">★★★★★</div>
                      <span className="pcard-sold">Đã bán: {numberShort(sp.luotMua)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>{priceDisplay(sp)}</div>
                    <div className="gift-wrapper">
                      {sp.quaTangGia > 0 ? (
                        <div>
                          <i className="fa-duotone fa-solid fa-gifts fa-bounce fa-xl" style={{ '--fa-primary-color': 'rgb(234,68,142)', '--fa-secondary-color': 'rgb(234,68,142)' } as any}></i>
                          <span className="gift-product"> Tặng: {sp.quaTangTen}</span>
                        </div>
                      ) : (
                        <div className="gift-alt"><i className="fa-regular fa-truck-bolt" style={{ marginRight: 7 }}></i><span>Miễn phí vận chuyển</span></div>
                      )}
                    </div>
                    <div className="product-desc" dangerouslySetInnerHTML={{ __html: sp.moTaNgan || '' }} />
                    {!sp.hasVariants
                      ? <a className="ot-btn style7 w-100" href="#" onClick={e => { e.preventDefault(); handleAddToCart(sp); }}><i className="fa-light fa-basket-shopping me-1"></i> Thêm vào giỏ hàng</a>
                      : <Link className="ot-btn style7 w-100" href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}><i className="fa-regular fa-magnifying-glass me-1"></i> Xem chi tiết</Link>}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination-wrap">
              <ul>
                <li><a href="#" className={page === 1 ? 'disabled' : ''} onClick={e => { e.preventDefault(); if (page > 1) changePage(page - 1); }}><i className="fa-regular fa-angle-left"></i></a></li>
                {getVisiblePages().map((p, i) => (
                  <li key={i}>
                    {p !== '...'
                      ? <a href="#" className={p === page ? 'active' : ''} onClick={e => { e.preventDefault(); changePage(p as number); }}>{p}</a>
                      : <a>...</a>}
                  </li>
                ))}
                <li><a href="#" className={page === totalPages ? 'disabled' : ''} onClick={e => { e.preventDefault(); if (page < totalPages) changePage(page + 1); }}><i className="fa-regular fa-angle-right"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Best sellers ── */}
      <section className="bestsellers-section">
        <div className="container">
          <div className="sec-head">
            <div className="sec-head-left">
              <div className="eyebrow"><span className="eyebrow-bar"></span> Hot nhất</div>
              <h3 className="sec-title">Sản phẩm bán chạy nhất</h3>
            </div>
            <Link href="/san-pham" className="btn-viewall">Xem thêm <i className="fas fa-arrow-right"></i></Link>
          </div>
          <div className="bs-grid">
            {sanPhamsBanChay.map((sp, i) => (
              <div key={i} className="bs-card">
                <div className="bs-thumb">
                  <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}><img src={getImageUrl(sp.anh)} alt={sp.ten} /></Link>
                </div>
                <div className="bs-body">
                  <h3 className="bs-name"><Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}>{sp.ten}</Link></h3>
                  <div className="bs-meta">
                    <div className="pcard-stars">★★★★★</div>
                    <span className="pcard-sold">Đã bán: {numberShort(sp.luotMua)}</span>
                  </div>
                  <div className="pcard-price">{priceDisplay(sp)}</div>
                  {sp.quaTangGia > 0 && (
                    <div className="pcard-tag tag-gift"><i className="fa-duotone fa-solid fa-gifts" style={{ fontSize: 13 }}></i> Tặng: {sp.quaTangTen}</div>
                  )}
                  <div className="bs-actions">
                    <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`} className="bs-btn-view"><i className="far fa-eye"></i></Link>
                    {!sp.hasVariants
                      ? <a className="bs-btn-cart" href="#" onClick={e => { e.preventDefault(); handleAddToCart(sp); }}><i className="fa-light fa-basket-shopping"></i> Thêm vào giỏ hàng</a>
                      : <Link className="bs-btn-cart" href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}><i className="fa-regular fa-magnifying-glass"></i> Xem chi tiết</Link>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TikTok / YouTube videos ── */}
      {tiktokVideos.length > 0 && (
        <section className="coolmom-tv mt-5" id="coolmom-tv">
          <div className="container">
            <div className="header">
              <div className="title"><span className="line"></span><h2>MayHutSua TV</h2></div>
              <p className="sub">Tổng hợp các video ngắn thú vị chia sẻ kĩ năng làm mẹ</p>
            </div>
            <VideoCarousel videos={tiktokVideos} onOpen={id => setSelectedVideo(id)} />
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-left">
              <div className="cta-pill">✨ Ưu đãi đặc biệt hôm nay</div>
              <h2 className="cta-title">Nhận ngay ưu đãi<br />Máy hút sữa siêu hấp dẫn</h2>
              <Link href="/san-pham" className="cta-btn">Đến cửa hàng ngay <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="cta-right"><img src="/assets/img/normal/spectramultis.png" alt="Spectra" /></div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="review-modern">
        <div className="container">
          <div className="review-header text-center">
            <h2>Cảm nhận khách hàng</h2>
            <p>Những chia sẻ chân thực từ các mẹ đã sử dụng sản phẩm</p>
          </div>
          <div className="review-grid">
            {[1,2,3,4].map(n => (
              <div key={n} className="review-item">
                <div className="review-bg" style={{ backgroundImage: `url('/assets/img/review${n}.jpg')` }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cam nang moi nhat ── */}
      <section className="space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-lg-6">
              <div className="title-area text-center">
                <h2 className="sec-title">Tin tức &amp; Bài viết mới nhất</h2>
                <p className="sec-text">Nơi chia sẻ những cẩm nang hữu ích cho mẹ bầu từ khi mang thai đến sau sinh.</p>
              </div>
            </div>
          </div>
          <div className="row gy-4 justify-content-center">
            {camNangMoiNhat.map((cn, i) => (
              <div key={i} className="col-xxl-3 col-xl-4 col-md-6">
                <div className="blog-card style2">
                  <div className="blog-img">
                    <Link href={`/kien-thuc-me-be/${cn.slugDanhMuc}/${cn.slug}`}><img src={getImageUrl(cn.anh)} alt="Blog Image" /></Link>
                    <span className="blog-tag">{cn.tenDanhMuc}</span>
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <Link href={`/kien-thuc-me-be/${cn.slugDanhMuc}/${cn.slug}`}>
                        <i className="far fa-calendar-days"></i>{new Date(cn.creationTime).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </Link>
                      <Link href={`/kien-thuc-me-be/${cn.slugDanhMuc}/${cn.slug}`}><i className="far fa-user"></i>mayhutsua.com.vn</Link>
                    </div>
                    <h3 className="box-title"><Link href={`/kien-thuc-me-be/${cn.slugDanhMuc}/${cn.slug}`}>{cn.ten}</Link></h3>
                    <Link href={`/kien-thuc-me-be/${cn.slugDanhMuc}/${cn.slug}`} className="link-btn">Xem thêm<i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video modal ── */}
      {selectedVideo && (
        <div className="video-modal">
          <div className="overlay" onClick={() => setSelectedVideo(null)}></div>
          <div className="modal-box">
            <iframe src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&mute=1`}
              frameBorder={0} allow="autoplay; encrypted-media" allowFullScreen></iframe>
            <button className="close" onClick={() => setSelectedVideo(null)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}
