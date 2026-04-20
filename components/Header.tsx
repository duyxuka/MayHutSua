'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getDanhMucSPListAll, getDanhMucCamNangListAll, getListFilterSanPham } from '@/lib/api';
import { getImageUrl } from '@/lib/config';

export default function Header() {
  const { cartItems, totalPrice, totalQuantity, removeFromCart } = useCart();
  const { user, logout } = useAuth();

  const [danhMucsSP, setDanhMucsSP] = useState<any[]>([]);
  const [danhMucsCN, setDanhMucsCN] = useState<any[]>([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [isCamNangMenuOpen, setIsCamNangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeout = useRef<any>(null);

  useEffect(() => {
    getDanhMucSPListAll().then(r => setDanhMucsSP(r || [])).catch(() => {});
    getDanhMucCamNangListAll().then(r => setDanhMucsCN(r || [])).catch(() => {});
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = () => setIsUserMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const onSearchChange = useCallback((val: string) => {
    setSearchKeyword(val);
    clearTimeout(searchTimeout.current);
    if (!val || val.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(() => {
      getListFilterSanPham({ keyword: val, skipCount: 0, maxResultCount: 5 })
        .then(res => setSearchResults(res.items || []))
        .catch(() => setSearchResults([]));
    }, 400);
  }, []);

  return (
    <>
      {/* ── Mobile Menu ── */}
      <div className={`ot-menu-wrapper${isMobileMenuOpen ? ' show ot-body-visible' : ''}`}>
        <div className="ot-menu-area text-center">
          <button className="ot-menu-toggle" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fal fa-times"></i>
          </button>
          <div className="mobile-logo">
            <Link href="/"><img src="/assets/img/logo/logo_black_1x.png" alt="Babymart" /></Link>
          </div>
          <div className="ot-mobile-menu">
            <ul>
              <li><Link href="/">Trang chủ</Link></li>
              <li className={`menu-item-has-children ot-item-has-children${isProductMenuOpen ? ' ot-active' : ''}`}>
                <a href="/san-pham">
                  Sản Phẩm
                  <span className="ot-mean-expand" onClick={e => { e.preventDefault(); e.stopPropagation(); setIsProductMenuOpen(v => !v); }}></span>
                </a>
                <ul className={`sub-menu ot-submenu${isProductMenuOpen ? ' ot-open' : ''}`}>
                  {danhMucsSP.map(dm => (
                    <li key={dm.id}><Link href={`/danh-muc-san-pham/${dm.slug}`}>{dm.ten}</Link></li>
                  ))}
                </ul>
              </li>
              <li className={`menu-item-has-children ot-item-has-children${isCamNangMenuOpen ? ' ot-active' : ''}`}>
                <a href="/kien-thuc-me-be">
                  Cẩm nang
                  <span className="ot-mean-expand" onClick={e => { e.preventDefault(); e.stopPropagation(); setIsCamNangMenuOpen(v => !v); }}></span>
                </a>
                <ul className={`sub-menu ot-submenu${isCamNangMenuOpen ? ' ot-open' : ''}`}>
                  {danhMucsCN.map(dm => (
                    <li key={dm.id}><Link href={`/danh-muc-kien-thuc/${dm.slug}`}>{dm.ten}</Link></li>
                  ))}
                </ul>
              </li>
              <li><Link href="/tin-tuc-khuyen-mai">Tin tức - Khuyến mãi</Link></li>
              <li><Link href="/lien-he">Liên hệ</Link></li>
              <li><Link href="/chinh-sach">Chính sách</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Cart Sidemenu ── */}
      <div className={`sidemenu-wrapper sidemenu-cart${isCartOpen ? ' show' : ''}`}>
        <div className="sidemenu-content">
          <button className="closeButton sideMenuCls" onClick={() => setIsCartOpen(false)}>
            <i className="far fa-times"></i>
          </button>
          <div className="widget woocommerce widget_shopping_cart">
            <h3 className="widget_title">Giỏ hàng</h3>
            <div className="widget_shopping_cart_content">
              <ul className="woocommerce-mini-cart cart_list product_list_widget">
                {cartItems.length === 0 && (
                  <li className="text-center p-3">Giỏ hàng trống</li>
                )}
                {cartItems.map((item, idx) => (
                  <li key={idx} className="woocommerce-mini-cart-item mini_cart_item">
                    <a href="#" className="remove remove_from_cart_button"
                      onClick={e => { e.preventDefault(); removeFromCart(item.id, item.bienTheId ?? null); }}>
                      <i className="far fa-times"></i>
                    </a>
                    <Link href={`/san-pham/${item.danhMucSlug}/${item.slug}`}>
                      <img src={getImageUrl(item.anh)} alt="Cart Image" />
                      {item.ten}
                    </Link>
                    <span className="quantity">
                      {item.quantity} ×{' '}
                      <span className="woocommerce-Price-amount amount">
                        {(item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia).toLocaleString('vi-VN')}
                      </span>
                    </span>
                    {item.thuocTinhDaChon && (
                      <div>
                        {Object.entries(item.thuocTinhDaChon).map(([k, v]) => (
                          <small key={k}>{k}: {v as string}</small>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <p className="woocommerce-mini-cart__total total">
                <strong>Tổng tiền:</strong>{' '}
                <span className="woocommerce-Price-amount amount">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </p>
              <p className="woocommerce-mini-cart__buttons buttons">
                <Link href="/gio-hang" className="ot-btn wc-forward">Xem giỏ hàng</Link>{' '}
                <Link href="/thanh-toan" className="ot-btn checkout wc-forward">Thanh toán</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Sidemenu ── */}
      <div className={`sidemenu-wrapper sidemenu-info${isInfoOpen ? ' show' : ''}`}>
        <div className="sidemenu-content">
          <button className="closeButton sideMenuCls" onClick={() => setIsInfoOpen(false)}>
            <i className="far fa-times"></i>
          </button>
          <div className="widget">
            <div className="ot-widget-about">
              <div className="about-logo">
                <Link href="/"><img src="/assets/img/logo/logo_black_1x.png" alt="Babymart" /></Link>
              </div>
              <p className="about-text">mayhutsua.com.vn là một cửa hàng trực tuyến chuyên cung cấp các sản phẩm dành cho trẻ em và mẹ bầu.</p>
              <div className="ot-social">
                <a href="https://www.facebook.com/"><i className="fab fa-facebook-f"></i></a>
                <a href="https://www.twitter.com/"><i className="fab fa-twitter"></i></a>
                <a href="https://www.linkedin.com/"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://www.whatsapp.com/"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
          </div>
          <div className="widget">
            <h3 className="widget_title">Liên hệ với chúng tôi</h3>
            <div className="ot-widget-contact">
              <div className="info-box">
                <div className="info-box_icon"><i className="fas fa-location-dot"></i></div>
                <div>
                  <p className="info-box_text">Hà Nội: 433 Nguyễn Khang - Yên Hòa - Hà Nội</p>
                  <p className="info-box_text">Hồ Chí Minh: 193 Nguyễn Văn Thương - TP. HCM</p>
                </div>
              </div>
              <div className="info-box">
                <div className="info-box_icon"><i className="fas fa-phone"></i></div>
                <div>
                  <p className="info-box_text"><a href="tel:+84916001923" className="info-box_link">HN: 0916.001.923</a></p>
                  <p className="info-box_text"><a href="tel:+84936268085" className="info-box_link">HCM: 0936.268.085</a></p>
                </div>
              </div>
              <div className="info-box">
                <div className="info-box_icon"><i className="fas fa-envelope"></i></div>
                <p className="info-box_text"><a href="mailto:mayhutsuaspectra@gmail.com" className="info-box_link">mayhutsuaspectra@gmail.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="ot-header header-layout1">
        <div className="header-top">
          <div className="container">
            <div className="row justify-content-center justify-content-lg-between align-items-center gy-2">
              <div className="col-auto d-none d-lg-block">
                <div className="header-links">
                  <ul>
                    <li><span>🔥 Ưu đãi hôm nay: Giảm đến 30%</span></li>
                    <li><i className="fas fa-envelope"></i> <a href="mailto:mayhutsuaspectra@gmail.com">mayhutsuaspectra@gmail.com</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-auto d-none d-xl-block">
                <div className="header-links">
                  <ul>
                    <li><Link href="/chinh-sach"><p className="header-notice">Cam kết <span style={{ color: 'rgb(238, 255, 0)' }}>"vàng"</span> khi mua tại mayhutsua.com.vn</p></Link></li>
                    <li><i className="fal fa-comments-question"></i> <Link href="/lien-he">Liên hệ</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky-wrapper">
          <div className="menu-area">
            <div className="container-fluid">
              <div className="row align-items-center justify-content-between">
                {/* Logo */}
                <div className="col-auto">
                  <div className="header-logo">
                    <Link href="/"><img src="/assets/img/logo/logo_black_1x.png" alt="mayhutsua.com.vn" /></Link>
                  </div>
                </div>

                {/* Desktop Nav */}
                <div className="col-auto">
                  <nav className="main-menu d-none d-lg-inline-block">
                    <ul>
                      <li><Link href="/">Trang chủ</Link></li>
                      <li className="menu-item-has-children">
                        <Link href="/san-pham">Sản phẩm</Link>
                        <ul className="sub-menu">
                          {danhMucsSP.map(dm => (
                            <li key={dm.id}><Link href={`/danh-muc-san-pham/${dm.slug}`}>{dm.ten}</Link></li>
                          ))}
                        </ul>
                      </li>
                      <li className="menu-item-has-children">
                        <Link href="/kien-thuc-me-be">Cẩm nang</Link>
                        <ul className="sub-menu">
                          {danhMucsCN.map(dm => (
                            <li key={dm.id}><Link href={`/danh-muc-kien-thuc/${dm.slug}`}>{dm.ten}</Link></li>
                          ))}
                        </ul>
                      </li>
                      <li><Link href="/tin-tuc-khuyen-mai">Tin tức - Khuyến mãi</Link></li>
                      <li><Link href="/lien-he">Liên hệ</Link></li>
                      <li><Link href="/chinh-sach">Chính sách</Link></li>
                    </ul>
                  </nav>
                </div>

                {/* Actions */}
                <div className="col-auto">
                  <div className="header-button">
                    {/* Search */}
                    <div className="search-wrapper d-none d-lg-block">
                      <form className="header-form" onSubmit={e => e.preventDefault()}>
                        <div className="form-group position-relative">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập sản phẩm..."
                            value={searchKeyword}
                            onChange={e => onSearchChange(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            style={{ borderLeft: 0, borderRadius: 30 }}
                          />
                          {showDropdown && searchResults.length > 0 && (
                            <div className="search-dropdown">
                              {searchResults.map((item, i) => (
                                <Link key={i} href={`/san-pham/${item.danhMucSlug}/${item.slug}`}>
                                  <div className="search-item" onClick={() => { setShowDropdown(false); setSearchKeyword(''); setSearchResults([]); }}>
                                    <img src={getImageUrl(item.anh)} alt={item.ten} />
                                    <span>{item.ten}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                        <button type="submit" className="submit-btn simple-icon"><i className="far fa-search"></i></button>
                      </form>
                    </div>

                    {/* User menu */}
                    <div className="user-menu">
                      <button className="icon-btn user-btn" onClick={e => { e.stopPropagation(); setIsUserMenuOpen(v => !v); }}>
                        <i className="far fa-user"></i>
                      </button>
                      {isUserMenuOpen && (
                        <div className="user-dropdown-menu">
                          {!user ? (
                            <>
                              <Link href="/dang-nhap"><i className="far fa-sign-in me-2"></i> Đăng nhập</Link>
                              <Link href="/dang-ky"><i className="fa-solid fa-user-plus me-2"></i> Đăng ký</Link>
                            </>
                          ) : (
                            <>
                              <Link href="/tai-khoan-cua-ban"><i className="far fa-user-circle me-2"></i> {user.name}</Link>
                              <Link href="/tai-khoan-cua-ban"><i className="far fa-box me-2"></i> Đơn hàng</Link>
                              <a onClick={logout} style={{ cursor: 'pointer' }}><i className="far fa-sign-out me-2"></i> Đăng xuất</a>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cart */}
                    <button type="button" className="icon-btn sideMenuCart" onClick={() => setIsCartOpen(true)}>
                      <span className="badge">{totalQuantity}</span>
                      <i className="far fa-basket-shopping"></i>
                    </button>

                    {/* Info */}
                    <button type="button" className="icon-btn sideMenuInfo d-none d-lg-block" onClick={() => setIsInfoOpen(true)}>
                      <i className="far fa-bars-sort"></i>
                    </button>

                    {/* Mobile menu toggle */}
                    <button type="button" className="ot-menu-toggle d-block d-lg-none" onClick={() => setIsMobileMenuOpen(true)}>
                      <i className="far fa-bars"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}