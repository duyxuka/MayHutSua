'use client';

function voucherScopeClass(p: number) { return p === 1 ? 'scope-shop' : p === 2 ? 'scope-product' : p === 3 ? 'scope-cat' : ''; }
function voucherIcon(l: number) { return l === 1 ? 'fa-regular fa-ticket-perforated' : l === 2 ? 'fa-regular fa-truck' : l === 3 ? 'fa-regular fa-rotate-left' : 'fa-regular fa-ticket'; }
function voucherScope(p: number) { return p === 1 ? 'Toàn shop' : p === 2 ? 'Sản phẩm này' : p === 3 ? 'Danh mục này' : 'Khuyến mãi'; }
function voucherType(l: number) { return l === 1 ? 'Giảm đơn' : l === 2 ? 'Miễn ship' : l === 3 ? 'Hoàn tiền' : 'Khuyến mãi'; }

interface Props {
  vouchers: any[];
  savedIds: Set<string>;
  onSave: (id: string) => void;
}

export default function VoucherList({ vouchers, savedIds, onSave }: Props) {
  if (!vouchers.length) return null;
  return (
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
                  <div className="pv-notch-top"></div>
                  <div className="pv-notch-bot"></div>
                  <div className="pv-icon"><i className={voucherIcon(v.loaiVoucher)}></i></div>
                  <span className="pv-scope-text">{voucherScope(v.phamVi)}</span>
                  <span className="pv-badge-type">{voucherType(v.loaiVoucher)}</span>
                </div>
                <div className="pv-right">
                  <div className="pv-top">
                    <div className="pv-info">
                      <span className="pv-title">{v.laPhanTram ? `Giảm ${v.giamGia}%` : `Giảm ${v.giamGia?.toLocaleString('vi-VN')}đ`}</span>
                      <span className="pv-sub">
                        {v.laPhanTram && v.giamToiDa && `Tối đa ${v.giamToiDa?.toLocaleString('vi-VN')}đ · `}
                        Đơn từ {v.donHangToiThieu?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <button className={`pv-save-btn${savedIds.has(v.id) ? ' saved' : ''}`}
                      disabled={savedIds.has(v.id)} onClick={() => onSave(v.id)}
                      title={savedIds.has(v.id) ? 'Đã lưu trong ví' : 'Lưu vào ví'}>
                      {savedIds.has(v.id)
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
  );
}
