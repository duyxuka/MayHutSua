'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getMyVouchersWithStatus, validateVoucher, createDonHang, createPayment, getPendingVnpayOrder, cancelPendingOrder } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import toast from 'react-hot-toast';

function voucherScopeClass(p: number) { return p === 1 ? 'scope-shop' : p === 2 ? 'scope-product' : p === 3 ? 'scope-cat' : ''; }
function voucherIcon(l: number) { return l === 1 ? 'fa-regular fa-ticket-perforated' : l === 2 ? 'fa-regular fa-truck' : l === 3 ? 'fa-regular fa-rotate-left' : 'fa-regular fa-ticket'; }
function voucherScope(p: number) { return p === 1 ? 'Toàn shop' : p === 2 ? 'Sản phẩm' : p === 3 ? 'Danh mục' : ''; }

export default function ThanhToanPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({ ten: '', email: '', soDienThoai: '', diaChi: '', ghiChu: '', voucherCode: '', paymentMethod: 'VNPAY' });
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [pendingSecondsLeft, setPendingSecondsLeft] = useState(0);
  const countdownRef = useRef<any>(null);

  const finalTotal = totalPrice - discount;

  // Pre-fill form from user profile
  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, ten: user.name || '', email: user.email || '', soDienThoai: user.phoneNumber || '' }));
      // Check pending VNPAY order
      if (user.id) {
        getPendingVnpayOrder(user.id).then(order => {
          if (order) { setPendingOrder(order); startCountdown(order.secondsLeft); }
        }).catch(() => {});
      }
    }
  }, [user]);

  useEffect(() => {
    if (totalPrice > 0) {
      getMyVouchersWithStatus(totalPrice).then(v => setVouchers(v || [])).catch(() => {});
    }
  }, [totalPrice]);

  useEffect(() => () => clearInterval(countdownRef.current), []);

  function startCountdown(seconds: number) {
    setPendingSecondsLeft(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setPendingSecondsLeft(s => {
        if (s <= 1) { clearInterval(countdownRef.current); setPendingOrder(null); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  function countdownDisplay() {
    const m = Math.floor(pendingSecondsLeft / 60);
    const s = pendingSecondsLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function applyVoucher(v: any) {
    if (selectedVoucher) { toast.error('Chỉ được áp dụng 1 voucher cho mỗi đơn hàng'); return; }
    if (!v.duDieuKien) { toast.error(v.lyDoKhongDuDieuKien || 'Voucher không đủ điều kiện'); return; }
    let d = v.laPhanTram ? (totalPrice * v.giamGia / 100) : v.giamGia;
    if (v.laPhanTram && v.giamToiDa && d > v.giamToiDa) d = v.giamToiDa;
    if (d > totalPrice) d = totalPrice;
    setDiscount(d);
    setSelectedVoucher(v);
    setForm(f => ({ ...f, voucherCode: v.maVoucher }));
    toast.success('Áp dụng voucher thành công');
  }

  async function applyVoucherByCode() {
    if (selectedVoucher) { toast.error('Bạn đã áp dụng voucher rồi'); return; }
    if (!form.voucherCode) { toast.error('Nhập mã voucher'); return; }
    try {
      const v = await validateVoucher(form.voucherCode, totalPrice);
      applyVoucher(v);
    } catch { toast.error('Voucher không hợp lệ'); }
  }

  function removeVoucher() {
    setSelectedVoucher(null);
    setDiscount(0);
    setForm(f => ({ ...f, voucherCode: '' }));
  }

  async function handleContinuePayment() {
    if (!pendingOrder) return;
    try {
      const url = await createPayment(pendingOrder.id);
      window.location.href = url as string;
    } catch { toast.error('Có lỗi xảy ra khi tạo link thanh toán'); }
  }

  async function handleCancelPending() {
    if (!pendingOrder) return;
    try {
      await cancelPendingOrder(pendingOrder.id);
      clearInterval(countdownRef.current);
      setPendingOrder(null);
      toast.success('Đã hủy đơn hàng cũ');
    } catch { toast.error('Không thể hủy đơn hàng'); }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) { toast.error('Vui lòng đăng nhập để đặt hàng'); return; }
    if (isSubmitting) return;
    if (!form.ten || !form.email || !form.soDienThoai || !form.diaChi) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (cartItems.length === 0) { toast.error('Giỏ hàng trống'); return; }

    setIsSubmitting(true);
    const order = {
      taiKhoanKhachHangId: user.id,
      ten: form.ten,
      email: form.email,
      soDienThoai: form.soDienThoai,
      diaChi: form.diaChi,
      ghiChu: form.ghiChu,
      phuongThucThanhToan: form.paymentMethod,
      trangThai: 0,
      tongTien: finalTotal,
      giamGiaVoucher: discount,
      voucherId: selectedVoucher?.id,
      chiTietDonHangs: cartItems.map(item => ({
        sanPhamId: item.id,
        sanPhamBienThe: JSON.stringify(item.thuocTinhDaChon) || '',
        quaTang: item.quaTangTen || '',
        soLuong: item.quantity,
        gia: item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia,
        trangThai: true
      }))
    };

    try {
      const res = await createDonHang(order);
      const orderId = res.id;
      if (form.paymentMethod === 'VNPAY') {
        const paymentUrl = await createPayment(orderId);
        window.location.href = paymentUrl as string;
      } else {
        clearCart();
        window.location.href = `/dat-hang-thanh-cong?orderId=${orderId}`;
      }
    } catch {
      toast.error('Có lỗi xảy ra');
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || (!!pendingOrder && form.paymentMethod === 'VNPAY');

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Thanh toán</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Thanh toán</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="ot-checkout-wrapper space-top space-extra-bottom">
        <div className="container">
          {/* Pending order banner */}
          {pendingOrder && (
            <div className="pending-order-banner mt-3">
              <div className="pob-icon"><i className="fa-regular fa-clock"></i></div>
              <div className="pob-body">
                <div className="pob-title">Bạn có đơn hàng chưa thanh toán</div>
                <div className="pob-meta">
                  Mã đơn: <strong>{pendingOrder.ma}</strong> &nbsp;·&nbsp;
                  Tổng tiền: <strong>{pendingOrder.tongTien?.toLocaleString('vi-VN')}đ</strong> &nbsp;·&nbsp;
                  Hết hạn sau: <strong className="pob-countdown">{countdownDisplay()}</strong>
                </div>
              </div>
              <div className="pob-actions">
                <button type="button" className="pob-btn-continue" onClick={handleContinuePayment}>
                  <i className="fa-solid fa-arrow-right me-1"></i> Tiếp tục thanh toán
                </button>
                <button type="button" className="pob-btn-cancel" onClick={handleCancelPending}>Hủy đơn cũ</button>
              </div>
            </div>
          )}

          <form className="woocommerce-checkout mt-40" onSubmit={placeOrder}>
            <div className="row">
              {/* Left: thông tin giao hàng */}
              <div className="col-lg-6">
                <h2 className="h4">Chi tiết thanh toán</h2>
                <div className="row">
                  <div className="col-12 form-group">
                    <label style={{ padding: '0 23px' }}>Họ và tên <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" placeholder="Nhập họ và tên"
                      value={form.ten} onChange={e => setForm(f => ({ ...f, ten: e.target.value }))} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label style={{ padding: '0 23px' }}>Email <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" placeholder="Nhập Email"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label style={{ padding: '0 23px' }}>Số điện thoại <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" placeholder="Nhập số điện thoại"
                      value={form.soDienThoai} onChange={e => setForm(f => ({ ...f, soDienThoai: e.target.value }))} />
                  </div>
                  <div className="col-12 form-group">
                    <label style={{ padding: '0 23px' }}>Địa chỉ giao hàng <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" placeholder="Nhập địa chỉ giao hàng"
                      value={form.diaChi} onChange={e => setForm(f => ({ ...f, diaChi: e.target.value }))} />
                  </div>
                  <div className="col-12 form-group">
                    <label style={{ padding: '0 23px' }}>Ghi chú đơn hàng</label>
                    <textarea cols={20} rows={5} className="form-control" placeholder="Nhập ghi chú (nếu có)"
                      value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Right: đơn hàng + voucher + thanh toán */}
              <div className="col-lg-6">
                <h2 className="h4">Đơn hàng của bạn</h2>
                <table className="cart_table mb-20">
                  <thead>
                    <tr>
                      <th className="cart-col-image">Ảnh</th>
                      <th className="cart-col-productname">Tên sản phẩm</th>
                      <th className="cart-col-price">Giá</th>
                      <th className="cart-col-quantity">SL</th>
                      <th className="cart-col-total">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, i) => (
                      <tr key={i} className="cart_item">
                        <td data-title="Product">
                          <Link className="cart-productimage" href={`/san-pham/${item.danhMucSlug}/${item.slug}`}>
                            <img width={91} height={91} src={getImageUrl(item.anh)} alt="Image" />
                          </Link>
                        </td>
                        <td data-title="Name">
                          <Link className="cart-productname" href={`/san-pham/${item.danhMucSlug}/${item.slug}`}>{item.ten}</Link>
                          {item.thuocTinhDaChon && (
                            <div>{Object.entries(item.thuocTinhDaChon).map(([k, v]) => <small key={k}>{k}: {v as string}</small>)}</div>
                          )}
                        </td>
                        <td><span className="amount"><bdi>{(item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia).toLocaleString('vi-VN')}đ</bdi></span></td>
                        <td><strong>{item.quantity}</strong></td>
                        <td><span className="amount"><bdi>{((item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia) * item.quantity).toLocaleString('vi-VN')}đ</bdi></span></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="checkout-ordertable">
                    <tr className="cart-subtotal">
                      <th>Tổng tiền</th>
                      <td colSpan={4}><span className="woocommerce-Price-amount amount"><bdi>{(totalPrice - discount).toLocaleString('vi-VN')}đ</bdi></span></td>
                    </tr>
                    <tr className="woocommerce-shipping-totals">
                      <th>Phí vận chuyển</th>
                      <td colSpan={4}>0đ</td>
                    </tr>
                    <tr className="order-total">
                      <th>Tổng thanh toán</th>
                      <td colSpan={4}><strong><span className="woocommerce-Price-amount amount"><bdi>{finalTotal.toLocaleString('vi-VN')}đ</bdi></span></strong></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Voucher */}
                <div className="row">
                  <div className="col-12">
                    <div className="woocommerce-form-coupon">
                      {/* Input mã thủ công */}
                      <div className="voucher-input-wrap">
                        <i className="fa-regular fa-ticket" style={{ color: '#ee4d2d' }}></i>
                        <input type="text" className="voucher-input-field" placeholder="Nhập mã voucher..."
                          value={form.voucherCode} onChange={e => setForm(f => ({ ...f, voucherCode: e.target.value }))} />
                        <button type="button" className="voucher-apply-btn" onClick={applyVoucherByCode}>Áp dụng</button>
                      </div>

                      {/* Voucher đang dùng */}
                      {selectedVoucher && (
                        <div className="selected-voucher-tag">
                          <i className="fa-solid fa-tag me-1"></i>
                          <span>{selectedVoucher.maVoucher}</span>
                          <span className="sv-discount"> -{discount.toLocaleString('vi-VN')}đ</span>
                          <button type="button" className="sv-remove" onClick={removeVoucher} title="Bỏ voucher">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      )}

                      {/* Danh sách voucher */}
                      {vouchers.length > 0 ? (
                        <>
                          <div className="product-voucher-label mt-3">
                            <i className="fa-regular fa-wallet"></i> Voucher khả dụng bạn đã lưu
                          </div>
                          <div className="product-voucher-list">
                            {vouchers.map((v, i) => (
                              <div key={i} className={`pv-card${!v.duDieuKien ? ' pv-disabled' : ''}${selectedVoucher?.id === v.id ? ' pv-selected' : ''}`}>
                                <div className={`pv-left ${voucherScopeClass(v.phamVi)}`}>
                                  <div className="pv-notch-top"></div>
                                  <div className="pv-notch-bot"></div>
                                  <div className="pv-icon"><i className={voucherIcon(v.loaiVoucher)}></i></div>
                                  <span className="pv-scope-text">{voucherScope(v.phamVi)}</span>
                                </div>
                                <div className="pv-right">
                                  <div className="pv-top">
                                    <div className="pv-info">
                                      <span className="pv-title">
                                        {v.laPhanTram ? `Giảm ${v.giamGia}%` : `Giảm ${v.giamGia?.toLocaleString('vi-VN')}đ`}
                                      </span>
                                      <span className="pv-sub">
                                        {v.laPhanTram && v.giamToiDa && `Tối đa ${v.giamToiDa?.toLocaleString('vi-VN')}đ · `}
                                        Đơn từ {v.donHangToiThieu?.toLocaleString('vi-VN')}đ
                                      </span>
                                      <span className="pv-code" style={{ fontWeight: 600 }}>
                                        {v.maVoucher}
                                        {!v.duDieuKien && (
                                          <span className="cvo-warning">
                                            <i className="fa-regular fa-circle-exclamation me-1"></i>{v.lyDoKhongDuDieuKien}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <button type="button" className={`pv-save-btn${selectedVoucher?.id === v.id ? ' saved' : ''}`}
                                      disabled={!v.duDieuKien}
                                      onClick={() => selectedVoucher?.id === v.id ? removeVoucher() : applyVoucher(v)}>
                                      {selectedVoucher?.id === v.id
                                        ? <i className="fa-solid fa-check"></i>
                                        : v.duDieuKien ? 'Dùng' : <i className="fa-regular fa-lock"></i>}
                                    </button>
                                  </div>
                                  <div className="pv-bottom">
                                    <div className="pv-bar-bg">
                                      <div className="pv-bar-fill" style={{ width: `${v.phanTramDaDung ?? 0}%` }}></div>
                                    </div>
                                    <div className="pv-meta">
                                      <span>Đã dùng {v.phanTramDaDung}%</span>
                                      <span>{v.thoiHanKetThuc ? `HSD: ${new Date(v.thoiHanKetThuc).toLocaleDateString('vi-VN')}` : 'Không giới hạn'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="cvl-empty">
                          <i className="fa-regular fa-ticket me-1"></i> Không có voucher khả dụng
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="mt-lg-3 mb-30">
                  <div className="woocommerce-checkout-payment">
                    <ul className="wc_payment_methods payment_methods methods">
                      <li className="wc_payment_method payment_method_VNPAY">
                        <input id="payment_method_VNPAY" type="radio" className="input-radio"
                          name="paymentMethod" value="VNPAY"
                          checked={form.paymentMethod === 'VNPAY'}
                          onChange={() => setForm(f => ({ ...f, paymentMethod: 'VNPAY' }))} />
                        <label htmlFor="payment_method_VNPAY">Thanh toán VNPAY-QR <span className="khuyendung">Khuyên dùng</span></label>
                        {form.paymentMethod === 'VNPAY' && (
                          <div className="payment_box payment_method_VNPAY">
                            <p>Thanh toán qua Internet Banking, Visa, Master, JCB, VNPAY-QR</p>
                          </div>
                        )}
                      </li>
                      <li className="wc_payment_method payment_method_COD">
                        <input id="payment_method_COD" type="radio" className="input-radio"
                          name="paymentMethod" value="COD"
                          checked={form.paymentMethod === 'COD'}
                          onChange={() => setForm(f => ({ ...f, paymentMethod: 'COD' }))} />
                        <label htmlFor="payment_method_COD">Thanh toán khi nhận hàng (COD)</label>
                        {form.paymentMethod === 'COD' && (
                          <div className="payment_box payment_method_COD">
                            <p>Bạn chỉ phải thanh toán khi nhận được hàng.</p>
                          </div>
                        )}
                      </li>
                    </ul>
                    <div className="form-row place-order">
                      <button type="submit" className={`ot-btn${isDisabled ? ' ot-btn-disabled' : ''}`}
                        disabled={isDisabled} title={pendingOrder && form.paymentMethod === 'VNPAY' ? 'Bạn còn đơn VNPay chưa thanh toán' : ''}>
                        {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                      </button>
                      {pendingOrder && form.paymentMethod === 'VNPAY' && (
                        <p className="pending-hint">
                          <i className="fa-regular fa-circle-info me-1"></i>
                          Vui lòng <strong>tiếp tục thanh toán</strong> hoặc <strong>hủy đơn cũ</strong> trước khi đặt đơn VNPAY mới.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
