'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/lib/config';

function numberShort(n: number) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return String(n);
}

export function PriceDisplay({ sp }: { sp: any }) {
  if (!sp.hasVariants) {
    return sp.giaKhuyenMai > 0 ? (
      <span className="price">{sp.giaKhuyenMai.toLocaleString('vi-VN')} đ <del>{sp.gia.toLocaleString('vi-VN')} đ</del></span>
    ) : (
      <span className="price">{sp.gia.toLocaleString('vi-VN')} đ</span>
    );
  }
  const min = sp.giaBienTheMin; const max = sp.giaBienTheMax;
  const km = sp.giaKhuyenMaiBienTheMin; const kmMax = sp.giaKhuyenMaiBienTheMax;
  const origStr = min === max ? `${min?.toLocaleString('vi-VN')} đ` : `${min?.toLocaleString('vi-VN')} - ${max?.toLocaleString('vi-VN')} đ`;
  if (!km || km === 0) return <span className="price">{origStr}</span>;
  const kmStr = km === kmMax ? `${km?.toLocaleString('vi-VN')} đ` : `${km?.toLocaleString('vi-VN')} - ${kmMax?.toLocaleString('vi-VN')} đ`;
  return <span className="price">{kmStr} <del>{origStr}</del></span>;
}

interface Props {
  products: any[];
  isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading }: Props) {
  const { addToCart } = useCart();

  function handleAddToCart(sp: any) {
    addToCart({
      id: sp.id, ten: sp.ten, anh: sp.anh, gia: sp.gia, giaKhuyenMai: sp.giaKhuyenMai,
      slug: sp.slug, danhMucSlug: sp.danhMucSlug, phanTramGiamGia: sp.phanTramGiamGia,
      tenQuaTang: sp.quaTangGia > 0 ? sp.quaTangTen : null, giaQuaTang: sp.quaTangGia > 0 ? sp.quaTangGia : 0
    });
  }

  if (isLoading) {
    return (
      <div className="sk-grid">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="sk-card">
            <div className="sk sk-card-img"></div>
            <div className="sk-card-body">
              <div className="sk sk-line sk-name"></div>
              <div className="sk sk-line sk-name2"></div>
              <div className="sk sk-line sk-meta"></div>
              <div className="sk sk-line sk-price"></div>
              <div className="sk sk-line sk-btn"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <div className="text-center p-5">Không có sản phẩm nào</div>;
  }

  return (
    <div className="product-grid">
      {products.map((sp, i) => (
        <div key={i} className="ot-product pcard">
          <div className="product-img">
            <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}>
              <img src={getImageUrl(sp.anh)} alt={sp.ten} />
            </Link>
            {!sp.hasVariants && sp.phanTramGiamGia ? <span className="product-tag">-{sp.phanTramGiamGia}%</span> : null}
            {sp.hasVariants && sp.phanTramGiamGiaBienThe ? <span className="product-tag">-{sp.phanTramGiamGiaBienThe}%</span> : null}
            <div className="actions">
              <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`} className="icon-btn popup-content">
                <i className="far fa-eye"></i>
              </Link>
            </div>
          </div>
          <div className="product-content">
            <h3 className="box-title">
              <Link href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`} title={sp.ten}>{sp.ten}</Link>
            </h3>
            <div className="pcard-meta">
              <div className="pcard-stars">★★★★★</div>
              <span className="pcard-sold">Đã bán: {numberShort(sp.luotMua)}</span>
            </div>
            <PriceDisplay sp={sp} />
            <div className="gift-wrapper mt-2">
              {sp.quaTangGia > 0 ? (
                <div>
                  <i className="fa-duotone fa-solid fa-gifts fa-bounce fa-xl"
                    style={{ '--fa-primary-color': 'rgb(234,68,142)', '--fa-secondary-color': 'rgb(234,68,142)' } as any}></i>
                  <span className="gift-product"> Tặng: {sp.quaTangTen}</span>
                </div>
              ) : (
                <div className="gift-alt">
                  <i className="fa-regular fa-truck-bolt" style={{ marginRight: 7 }}></i>
                  <span>Miễn phí vận chuyển</span>
                </div>
              )}
            </div>
            <div className="product-desc" dangerouslySetInnerHTML={{ __html: sp.moTaNgan || '' }} />
            {!sp.hasVariants
              ? <a className="ot-btn style7 w-100 mt-auto" href="#"
                  onClick={e => { e.preventDefault(); handleAddToCart(sp); }}>
                  <i className="fa-light fa-basket-shopping me-1"></i> Thêm vào giỏ hàng
                </a>
              : <Link className="ot-btn style7 w-100 mt-auto" href={`/san-pham/${sp.danhMucSlug}/${sp.slug}`}>
                  <i className="fa-regular fa-magnifying-glass me-1"></i> Xem chi tiết
                </Link>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Reusable Pagination ────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  function getPages(): (number | string)[] {
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
  if (totalPages <= 1) return null;
  return (
    <div className="pagination-wrap">
      <ul>
        <li><a href="#" className={page === 1 ? 'disabled' : ''} onClick={e => { e.preventDefault(); if (page > 1) onChange(page - 1); }}><i className="fa-regular fa-angle-left"></i></a></li>
        {getPages().map((p, i) => (
          <li key={i}>
            {p !== '...'
              ? <a href="#" className={p === page ? 'active' : ''} onClick={e => { e.preventDefault(); onChange(p as number); }}>{p}</a>
              : <a>...</a>}
          </li>
        ))}
        <li><a href="#" className={page === totalPages ? 'disabled' : ''} onClick={e => { e.preventDefault(); if (page < totalPages) onChange(page + 1); }}><i className="fa-regular fa-angle-right"></i></a></li>
      </ul>
    </div>
  );
}
