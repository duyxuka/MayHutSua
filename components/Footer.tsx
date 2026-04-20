'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDanhMucSPListAll, getDanhMucCamNangListAll } from '@/lib/api';

export default function Footer() {
  const [danhMucsSP, setDanhMucsSP] = useState<any[]>([]);
  const [danhMucsCN, setDanhMucsCN] = useState<any[]>([]);

  useEffect(() => {
    getDanhMucSPListAll().then(r => setDanhMucsSP(r || [])).catch(() => {});
    getDanhMucCamNangListAll().then(r => setDanhMucsCN(r || [])).catch(() => {});
  }, []);

  return (
    <footer className="footer-wrapper footer-layout1" style={{ backgroundImage: 'url(/assets/img/bg/footer_bg_1.png)' }}>
      <div className="footer-shape1 pulse">
        <img src="/assets/img/shape/footer-shape1.png" alt="img" />
      </div>

      {/* Footer top — contact info */}
      <div className="container">
        <div className="footer-top">
          <div className="footer-contact-wrap row">
            <div className="footer-contact col-lg-3">
              <div className="box-icon"><img src="/assets/img/icon/phone.svg" alt="icon" /></div>
              <div className="media-body">
                <p className="box-label">Tư vấn 24/7</p>
                <div className="box-title" style={{ marginBottom: 10 }}>
                  <span className="region">Hà Nội: </span>
                  <a href="tel:+84916001923" className="phone" style={{ color: '#FE5A86' }}>0916.001.923</a>
                </div>
                <div className="box-title">
                  <span className="region">Hồ Chí Minh: </span>
                  <a href="tel:+84936268085" className="phone" style={{ color: '#FE5A86' }}>0936.268.085</a>
                </div>
              </div>
            </div>

            <div className="footer-contact col-lg-3">
              <div className="box-icon" style={{ '--theme-color': '#FE5A86' } as any}>
                <img src="/assets/img/icon/email.svg" alt="icon" />
              </div>
              <div className="media-body">
                <p className="box-label">Hòm thư gửi về</p>
                <h4 className="box-title" style={{ fontSize: 17 }}>
                  <a href="mailto:mayhutsuaspectra@gmail.com">mayhutsuaspectra@gmail.com</a>
                </h4>
              </div>
            </div>

            <div className="footer-contact col-lg-3">
              <div className="box-icon" style={{ '--theme-color': '#FC800A' } as any}>
                <img src="/assets/img/icon/time.svg" alt="icon" />
              </div>
              <div className="media-body">
                <p className="box-label">Thời gian hoạt động</p>
                <h4 className="box-title">Từ Thứ 2 đến Thứ 7: 8:30 - 17:30</h4>
              </div>
            </div>

            <div className="footer-contact col-lg-3">
              <div className="box-icon" style={{ '--theme-color': '#16C4E3' } as any}>
                <img src="/assets/img/icon/location.svg" alt="icon" />
              </div>
              <div className="media-body">
                <p className="box-label">Địa chỉ</p>
                <div className="box-title" style={{ marginBottom: 10, fontSize: 18 }}>
                  <span className="region">Hà Nội: </span>
                  <a href="https://maps.app.goo.gl/AAMCUkhrKeWGus1V8" target="_blank" className="address-link">
                    433 Nguyễn Khang - Yên Hòa - Hà Nội
                  </a>
                </div>
                <div className="box-title" style={{ fontSize: 18 }}>
                  <span className="region">Hồ Chí Minh: </span>
                  <a href="https://maps.app.goo.gl/m1G7FGPg6pssACVy6" target="_blank" className="address-link">
                    193 Nguyễn Văn Thương - TP. Hồ Chí Minh
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget area */}
      <div className="widget-area">
        <div className="container">
          <div className="row justify-content-between">
            {/* About */}
            <div className="col-md-6 col-xl-auto">
              <div className="widget footer-widget">
                <div className="ot-widget-about">
                  <div className="about-logo">
                    <Link href="/"><img src="/assets/img/logo/logo_white_2x.png" alt="Babymart" /></Link>
                  </div>
                  <div>
                    <p className="thongtin">Công Ty Cổ Phần Dịch Vụ VietLife</p>
                    <p className="thongtin">GCNĐKKD số: 0103747587</p>
                    <p className="thongtin">Do sở KH&ĐT TP. Hà Nội cấp ngày 20/4/2009</p>
                    <p className="thongtin">Di động: 0916.001.923</p>
                    <p className="thongtin">Email: info@vietlife.com.vn</p>
                    <p className="thongtin">Địa chỉ: 1A Lô C, Khu tập thể ĐHTH, Tổ 26, Cụm 5, P.Hạ Đình, Q.Thanh Xuân, HN</p>
                    <img src="/assets/img/logo/logoxacnhan.png" alt="Xác nhận" style={{ width: 120, marginTop: 10, marginBottom: 10 }} />
                  </div>
                  <div className="ot-social">
                    <a href="https://www.facebook.com/"><i className="fab fa-facebook-f"></i></a>
                    <a href="https://www.twitter.com/"><i className="fab fa-twitter"></i></a>
                    <a href="https://www.linkedin.com/"><i className="fab fa-linkedin-in"></i></a>
                    <a href="https://www.youtube.com/"><i className="fab fa-youtube"></i></a>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh mục sản phẩm */}
            <div className="col-md-6 col-xl-auto">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Sản phẩm</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    {danhMucsSP.map(dm => (
                      <li key={dm.id}><Link href={`/danh-muc-san-pham/${dm.slug}`}>{dm.ten}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Danh mục cẩm nang */}
            <div className="col-md-6 col-xl-auto">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Cẩm nang</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    {danhMucsCN.map(dm => (
                      <li key={dm.id}><Link href={`/danh-muc-kien-thuc/${dm.slug}`}>{dm.ten}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Chính sách */}
            <div className="col-md-6 col-xl-auto">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Chính sách</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    <li><Link href="/chinh-sach">Chính sách bảo mật</Link></li>
                    <li><Link href="/chinh-sach">Chính sách bán hàng</Link></li>
                    <li><Link href="/chinh-sach">Chính sách đổi trả hàng</Link></li>
                    <li><Link href="/chinh-sach">Chính sách bảo hành</Link></li>
                    <li><Link href="/chinh-sach">Phương thức thanh toán</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-md-6 col-xl-auto">
              <div className="widget footer-widget">
                <h3 className="widget_title">Liên hệ</h3>
                <div className="newsletter-widget">
                  <p className="footer-text">Đăng ký để nhận thông tin mới nhất từ mayhutsua.com.vn.</p>
                  <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
                    <div className="form-group">
                      <input className="form-control" type="email" placeholder="Địa chỉ Email" required />
                    </div>
                    <button type="submit" className="icon-btn"><i className="fal fa-paper-plane"></i></button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright-wrap bg-theme">
        <div className="container text-center">
          <div className="row gy-3 justify-content-between align-items-center">
            <div className="col-md-auto">
              <p className="copyright-text">
                <i className="fal fa-copyright"></i> Copyright 2026 <Link href="/">mayhutsua.com.vn</Link>. All Rights Reserved.
              </p>
            </div>
            <div className="col-md-auto">
              <div className="payment-methods">
                <img src="/assets/img/normal/payments.png" alt="Icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}