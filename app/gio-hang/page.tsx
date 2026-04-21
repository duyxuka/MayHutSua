'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getListAllVouchers, getMyVouchers, nhanVoucher } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import toast from 'react-hot-toast';
import './giohang.css';

function voucherScopeClass(phamVi: number) {
  if (phamVi === 1) return 'scope-shop';
  if (phamVi === 2) return 'scope-product';
  if (phamVi === 3) return 'scope-cat';
  return '';
}
function voucherIcon(loai: number) {
  if (loai === 1) return 'fa-regular fa-ticket-perforated';
  if (loai === 2) return 'fa-regular fa-truck';
  if (loai === 3) return 'fa-regular fa-rotate-left';
  return 'fa-regular fa-ticket';
}
function voucherScope(phamVi: number) {
  if (phamVi === 1) return 'Toàn shop';
  if (phamVi === 2) return 'Sản phẩm này';
  if (phamVi === 3) return 'Danh mục này';
  return 'Khuyến mãi';
}
function voucherType(loai: number) {
  if (loai === 1) return 'Giảm đơn';
  if (loai === 2) return 'Miễn ship';
  if (loai === 3) return 'Hoàn tiền';
  return 'Khuyến mãi';
}

export default function GioHangPage() {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { isLoggedIn } = useAuth();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getListAllVouchers(1).then(r => setVouchers(r || [])).catch(() => {});
    if (isLoggedIn) {
      getMyVouchers().then(r => setSavedVoucherIds(new Set(r.map((v: any) => v.id)))).catch(() => {});
    }
  }, [isLoggedIn]);

  function saveVoucher(voucherId: string) {
    if (!isLoggedIn) { toast.error('Bạn cần đăng nhập để lưu voucher'); return; }
    if (savedVoucherIds.has(voucherId)) return;
    nhanVoucher(voucherId).then(() => {
      setSavedVoucherIds(prev => new Set([...prev, voucherId]));
    }).catch(() => {});
  }

  function increase(item: any) {
    updateQuantity(item.id, item.bienTheId, item.quantity + 1);
  }
  function decrease(item: any) {
    if (item.quantity > 1) updateQuantity(item.id, item.bienTheId, item.quantity - 1);
  }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Giỏ hàng</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Giỏ hàng</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="ot-cart-wrapper space-top space-extra-bottom">
        <div className="container addcart">
          <form className="woocommerce-cart-form" onSubmit={e => e.preventDefault()}>
            <table className="cart_table">
              <thead>
                <tr>
                  <th colSpan={3} className="cart-col-image">Sản phẩm</th>
                  <th className="cart-col-price">Giá</th>
                  <th className="cart-col-quantity">Số lượng</th>
                  <th className="cart-col-total">Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-4">Giỏ hàng trống</td></tr>
                )}
                {cartItems.map((item, idx) => (
                  <tr key={idx} className="cart_item">
                    <td data-title="Remove">
                      <a href="#" className="remove" onClick={e => { e.preventDefault(); removeFromCart(item.id, item.bienTheId ?? null); }}>
                        <i className="far fa-close"></i>
                      </a>
                    </td>
                    <td data-title="Product">
                      <Link className="cart-productimage" href={`/san-pham/${item.danhMucSlug}/${item.slug}`}>
                        <img width={91} height={91} src={getImageUrl(item.anh)} alt="Image" />
                      </Link>
                    </td>
                    <td data-title="Name">
                      <Link className="cart-productname" href={`/san-pham/${item.danhMucSlug}/${item.slug}`}>{item.ten}</Link>
                      {item.thuocTinhDaChon && (
                        <div>{Object.entries(item.thuocTinhDaChon).map(([k, v]) => (
                          <small key={k}>{k}: {v as string}</small>
                        ))}</div>
                      )}
                      {item.quaTangGia > 0 && (
                        <div><small><span style={{ color: 'rgb(255, 94, 182)' }}>Quà tặng:</span> {item.quaTangTen} trị giá {item.quaTangGia.toLocaleString('vi-VN')}đ</small></div>
                      )}
                    </td>
                    <td data-title="Price">
                      {item.giaKhuyenMai > 0 ? (
                        <span className="amount"><bdi><span>{item.giaKhuyenMai.toLocaleString('vi-VN')}đ </span><del>{item.gia.toLocaleString('vi-VN')}đ</del></bdi></span>
                      ) : (
                        <span className="amount"><bdi><span>{item.gia.toLocaleString('vi-VN')}đ</span></bdi></span>
                      )}
                    </td>
                    <td data-title="Quantity">
                      <div className="quantity">
                        <button type="button" className="quantity-minus qty-btn" onClick={() => decrease(item)}><i className="far fa-minus"></i></button>
                        <input type="number" className="qty-input" value={item.quantity} min={1} max={99}
                          onChange={e => updateQuantity(item.id, item.bienTheId ?? null, parseInt(e.target.value) || 1)} />
                        <button type="button" className="quantity-plus qty-btn" onClick={() => increase(item)}><i className="far fa-plus"></i></button>
                      </div>
                    </td>
                    <td data-title="Total">
                      <span className="amount"><bdi>{((item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia) * item.quantity).toLocaleString('vi-VN')} đ</bdi></span>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={6} className="actions">
                    {/* Voucher section */}
                    {vouchers.length > 0 && (
                      <div className="product-voucher-wrap">
                        <div className="product-voucher-label">
                          <i className="fa-regular fa-ticket" style={{ color: '#ee4d2d' }}></i> Mã giảm giá áp dụng
                        </div>
                        <div className="product-voucher-list">
                          {vouchers.map((v, i) => (
                            <div key={i} className="pv-card">
                              <div className={`pv-left ${voucherScopeClass(v.phamVi)}`}>
                                <div className="pv-notch-top"></div>
                                <div className="pv-notch-bot"></div>
                                <div className="pv-icon"><i className={voucherIcon(v.loaiVoucher)}></i></div>
                                <span className="pv-scope-text">{voucherScope(v.phamVi)}</span>
                                <span className="pv-badge-type">{voucherType(v.loaiVoucher)}</span>
                              </div>
                              <div className="pv-right">
                                <div className="pv-top">
                                  <div className="pv-info">
                                    <span className="pv-title">
                                      {v.laPhanTram ? `Giảm ${v.giamGia}%` : `Giảm ${v.giamGia.toLocaleString('vi-VN')}đ`}
                                    </span>
                                    <span className="pv-sub">
                                      {v.laPhanTram && v.giamToiDa && `Tối đa ${v.giamToiDa.toLocaleString('vi-VN')}đ · `}
                                      Đơn từ {v.donHangToiThieu?.toLocaleString('vi-VN')}đ
                                    </span>
                                  </div>
                                  <button type="button" className={`pv-save-btn${savedVoucherIds.has(v.id) ? ' saved' : ''}`}
                                    disabled={savedVoucherIds.has(v.id)} onClick={() => saveVoucher(v.id)}>
                                    {savedVoucherIds.has(v.id)
                                      ? <><i className="fa-solid fa-bookmark me-1"></i>Đã lưu</>
                                      : <><i className="fa-regular fa-bookmark me-1"></i>Lưu</>}
                                  </button>
                                </div>
                                <div className="pv-bottom">
                                  <div className="pv-bar-bg">
                                    <div className="pv-bar-fill" style={{ width: `${v.phanTramDaDung ?? 0}%` }}></div>
                                  </div>
                                  <div className="pv-meta">
                                    <span>Đã dùng {v.phanTramDaDung}%</span>
                                    <span>{v.thoiHanKetThuc
                                      ? `Thời hạn: ${new Date(v.thoiHanKetThuc).toLocaleDateString('vi-VN')}`
                                      : 'Không giới hạn'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="ot-cart-coupon">
                      <button className="ot-btn totalPrice" style={{ borderRadius: 0, backgroundColor: 'transparent', color: 'black', fontSize: 'larger' }}>
                        Tổng tiền: {totalPrice.toLocaleString('vi-VN')}đ
                      </button>
                    </div>
                    <Link href="/thanh-toan" className="ot-btn">Thanh toán</Link>
                    <Link href="/san-pham" className="ot-btn">Tiếp tục mua hàng</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
    </>
  );
}