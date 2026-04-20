'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, changePassword, getOrderByUserId, cancelOrder } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: 'Chờ xác nhận', cls: 'bg-secondary' },
  1: { label: 'Đang xử lý',   cls: 'bg-warning'   },
  2: { label: 'Đang giao',    cls: 'bg-info'       },
  3: { label: 'Hoàn thành',   cls: 'bg-success'    },
  4: { label: 'Đã hủy',       cls: 'bg-danger'     },
};

export default function TaiKhoanPage() {
  const { user, refreshUser, logout } = useAuth();
  const [tab, setTab] = useState<'account' | 'profile' | 'orders' | 'password'>('account');

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', phoneNumber: '' });
  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', phoneNumber: user.phoneNumber || '' });
  }, [user]);

  async function handleUpdateProfile() {
    try {
      await updateProfile({ name: profileForm.name, phoneNumber: profileForm.phoneNumber });
      toast.success('Cập nhật thành công');
      refreshUser();
    } catch { toast.error('Có lỗi xảy ra'); }
  }

  // Password form
  const [pw, setPw] = useState({ old: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

  async function handleChangePassword() {
    if (!pw.old) { toast.error('Nhập mật khẩu hiện tại'); return; }
    if (pw.new.length < 6) { toast.error('Mật khẩu phải tối thiểu 6 ký tự'); return; }
    if (pw.new !== pw.confirm) { toast.error('Mật khẩu xác nhận không đúng'); return; }
    try {
      await changePassword({ currentPassword: pw.old, newPassword: pw.new });
      toast.success('Đổi mật khẩu thành công');
      setPw({ old: '', new: '', confirm: '' });
    } catch { toast.error('Có lỗi xảy ra'); }
  }

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pages, setPages] = useState<number[]>([]);

  useEffect(() => {
    if (tab === 'orders') loadOrders();
  }, [tab, currentPage, statusFilter]);

  async function loadOrders() {
    try {
      const skip = (currentPage - 1) * pageSize;
      const res = await getOrderByUserId(skip, pageSize, statusFilter ?? undefined);
      setOrders(res.items);
      setTotalCount(res.totalCount);
      buildPages(res.totalCount);
    } catch { toast.error('Không thể tải đơn hàng'); }
  }

  function buildPages(total: number) {
    const totalPages = Math.ceil(total / pageSize);
    const start = Math.max(currentPage - 1, 1);
    const end = Math.min(start + 2, totalPages);
    const p: number[] = [];
    for (let i = start; i <= end; i++) p.push(i);
    setPages(p);
  }

  function changePage(p: number) {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  }

  async function handleCancelOrder(orderId: string) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Hủy đơn hàng thành công');
      loadOrders();
    } catch { toast.error('Không thể hủy đơn hàng'); }
  }

  const totalSpent = orders.filter(o => o.trangThai === 3).reduce((s, o) => s + o.tongTien, 0);

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Thông tin cá nhân</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Tài khoản của bạn</span>
            </nav>
          </div>
        </div>
      </div>

      <section className="account-section space-extra-bottom">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-3">
              <div className="account-sidebar">
                <div className="account-user text-center">
                  <img src="/assets/img/hero/anh-dai-dien-zalo-30.jpg" className="avatar" alt="avatar" />
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                </div>
                <ul className="account-menu">
                  {([
                    { key: 'account', icon: 'fa-user', label: 'Tài khoản' },
                    { key: 'profile', icon: 'fa-address-card', label: 'Thông tin tài khoản' },
                    { key: 'orders',  icon: 'fa-box',          label: 'Đơn hàng của tôi' },
                    { key: 'password',icon: 'fa-lock',         label: 'Đổi mật khẩu' },
                  ] as const).map(({ key, icon, label }) => (
                    <li key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
                      <i className={`far ${icon}`}></i> {label}
                    </li>
                  ))}
                  <li className="logout" onClick={logout}><i className="far fa-sign-out"></i> Đăng xuất</li>
                </ul>
              </div>
            </div>

            {/* Content */}
            <div className="col-lg-9">

              {/* TAB: account */}
              {tab === 'account' && (
                <div className="account-box">
                  <h3>Tài khoản của bạn</h3>
                  <p>Xin chào, <strong>{user?.name}</strong></p>
                  <p>Từ tài khoản của bạn, bạn có thể dễ dàng kiểm tra và xem các đơn đặt hàng gần đây, cũng như chỉnh sửa thông tin cá nhân và thay đổi mật khẩu.</p>
                  <h5 className="mt-3">Tổng tiền đơn hàng đã giao thành công: <b>{totalSpent.toLocaleString('vi-VN')} VND</b></h5>
                </div>
              )}

              {/* TAB: profile */}
              {tab === 'profile' && (
                <div className="account-box">
                  <h3>Thông tin tài khoản</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Họ tên <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={profileForm.name}
                        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label>Email <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={user?.email || ''} disabled />
                    </div>
                    <div className="col-md-12 mt-3">
                      <label>Số điện thoại <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={profileForm.phoneNumber}
                        onChange={e => setProfileForm(f => ({ ...f, phoneNumber: e.target.value }))} />
                    </div>
                  </div>
                  <button className="ot-btn mt-3" onClick={handleUpdateProfile}>Cập nhật</button>
                </div>
              )}

              {/* TAB: orders */}
              {tab === 'orders' && (
                <div className="account-box table-responsive">
                  <h3>Đơn hàng của tôi</h3>
                  <table className="table order-table">
                    <thead>
                      <tr>
                        <th>Đơn hàng</th>
                        <th>Ngày</th>
                        <th>Thanh toán</th>
                        <th>Voucher</th>
                        <th>Tổng tiền</th>
                        <th>
                          <select className="form-select w-auto" style={{ paddingRight: 21, height: 36 }}
                            onChange={e => { setStatusFilter(e.target.value === '' ? null : Number(e.target.value)); setCurrentPage(1); }}>
                            <option value="">Trạng thái</option>
                            <option value="0">Chờ xác nhận</option>
                            <option value="1">Đang xử lý</option>
                            <option value="2">Đang giao</option>
                            <option value="3">Hoàn thành</option>
                            <option value="4">Đã hủy</option>
                          </select>
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <>
                          <tr key={order.id}>
                            <td>
                              <div>SĐT: {order.soDienThoai}</div>
                              <div>Địa chỉ: {order.diaChi}</div>
                            </td>
                            <td>{order.ngayDat ? new Date(order.ngayDat).toLocaleDateString('vi-VN') : ''}</td>
                            <td>{order.phuongThucThanhToan}</td>
                            <td>{(order.giamGiaVoucher > 0 ? order.giamGiaVoucher : 0).toLocaleString('vi-VN')} ₫</td>
                            <td>{order.tongTien?.toLocaleString('vi-VN')} ₫</td>
                            <td>
                              {STATUS_MAP[order.trangThai] && (
                                <span className={`badge rounded-pill ${STATUS_MAP[order.trangThai].cls}`} style={{ position: 'unset' }}>
                                  {STATUS_MAP[order.trangThai].label}
                                </span>
                              )}
                            </td>
                            <td>
                              <button className={`btn btn-sm btn-outline-primary${selectedOrderId === order.id ? ' active' : ''}`}
                                style={{ marginRight: 10 }} onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}>
                                Xem
                              </button>
                              {(order.trangThai === 0 || (order.trangThai === 1 && order.phuongThucThanhToan !== 'VNPAY')) && (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelOrder(order.id)}>Hủy đơn</button>
                              )}
                            </td>
                          </tr>

                          {/* Chi tiết đơn hàng */}
                          {selectedOrderId === order.id && (
                            <tr key={`${order.id}-detail`}>
                              <td colSpan={7}>
                                <table className="table table-sm">
                                  <thead>
                                    <tr>
                                      <th>Sản phẩm</th>
                                      <th>Biến thể</th>
                                      <th>Quà tặng</th>
                                      <th>Số lượng</th>
                                      <th>Giá</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.chiTietDonHangDtos?.map((item: any, i: number) => (
                                      <tr key={i}>
                                        <td>{item.tenSanPham}</td>
                                        <td>{item.sanPhamBienThe}</td>
                                        <td>{item.quaTang}</td>
                                        <td>{item.soLuong}</td>
                                        <td>{item.gia?.toLocaleString('vi-VN')} ₫</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>

                  {/* Phân trang */}
                  <div className="pagination-wrapper mt-4 text-center">
                    <button className="btn btn-outline-secondary me-2" onClick={() => changePage(currentPage - 1)}>
                      <i className="fa-regular fa-angle-left"></i>
                    </button>
                    {pages.map(p => (
                      <button key={p} className={`btn me-1 ${p === currentPage ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => changePage(p)}>{p}</button>
                    ))}
                    {totalCount / pageSize > pages[pages.length - 1] && <span>...</span>}
                    <button className="btn btn-outline-secondary ms-2" onClick={() => changePage(currentPage + 1)}>
                      <i className="fa-regular fa-angle-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: password */}
              {tab === 'password' && (
                <div className="account-box">
                  <h3>Đổi mật khẩu</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Mật khẩu hiện tại <span className="text-danger">*</span></label>
                      <div className="password-input">
                        <input type={showPw.old ? 'text' : 'password'} className="form-control"
                          placeholder="Nhập mật khẩu hiện tại" value={pw.old}
                          onChange={e => setPw(p => ({ ...p, old: e.target.value }))} />
                        <button type="button" className="eye-btn" onClick={() => setShowPw(s => ({ ...s, old: !s.old }))}>
                          <i className={`fa ${showPw.old ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label>Mật khẩu mới <span className="text-danger">*</span></label>
                      <div className="password-input">
                        <input type={showPw.new ? 'text' : 'password'} className="form-control"
                          placeholder="Nhập mật khẩu mới" value={pw.new}
                          onChange={e => setPw(p => ({ ...p, new: e.target.value }))} />
                        <button type="button" className="eye-btn" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}>
                          <i className={`fa ${showPw.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                      <div className="password-input">
                        <input type={showPw.confirm ? 'text' : 'password'} className="form-control"
                          placeholder="Nhập lại mật khẩu" value={pw.confirm}
                          onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
                        <button type="button" className="eye-btn" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                          <i className={`fa ${showPw.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button className="ot-btn mt-3" onClick={handleChangePassword}>Cập nhật mật khẩu</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
