'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createLienHe } from '@/lib/api';
import toast from 'react-hot-toast';
import './lienhe.css';

export default function LienHePage() {
  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', noiDung: '', daXuLy: false });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const phoneValid = /^(0[3|5|7|8|9])[0-9]{8}$/.test(form.soDienThoai);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ hoTen: true, email: true, soDienThoai: true, noiDung: true });
    if (!form.hoTen || !emailValid || !phoneValid || !form.noiDung) return;
    setIsSubmitting(true);
    try {
      await createLienHe(form);
      toast.success('Gửi liên hệ thành công!');
      setForm({ hoTen: '', email: '', soDienThoai: '', noiDung: '', daXuLy: false });
      setTouched({});
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Liên hệ</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Liên hệ</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="space" id="contact-sec">
        <div className="container">
          <div className="contact-wrap1">
            <div className="row gy-40 gx-60 justify-content-center">

              {/* Contact info */}
              <div className="col-lg-4">
                <div className="contact-feature-wrap">
                  <div className="contact-feature-wrap-details">
                    {[
                      {
                        icon: 'fas fa-home', label: 'Địa chỉ',
                        content: (
                          <>
                            <div className="box-title">
                              <span>Hà Nội:</span><br />
                              <a href="https://maps.app.goo.gl/AAMCUkhrKeWGus1V8" target="_blank">433 Nguyễn Khang - Yên Hòa - Hà Nội</a>
                            </div>
                            <div className="box-title mt-2">
                              <span>Hồ Chí Minh:</span><br />
                              <a href="https://maps.app.goo.gl/m1G7FGPg6pssACVy6" target="_blank">193 Nguyễn Văn Thương - Thạnh Mỹ Tây - TP.HCM</a>
                            </div>
                          </>
                        )
                      },
                      {
                        icon: 'fas fa-phone', label: 'Số điện thoại',
                        content: (
                          <>
                            <div className="box-title">Hà Nội: <a href="tel:+84916001923">0916.001.923</a></div>
                            <div className="box-title">Hồ Chí Minh: <a href="tel:+84936268085">0936.268.085</a></div>
                          </>
                        )
                      },
                      {
                        icon: 'fas fa-envelope', label: 'Email',
                        content: <h4 className="box-title"><a href="mailto:mayhutsuaspectra@gmail.com">mayhutsuaspectra@gmail.com</a></h4>
                      },
                      {
                        icon: 'fa-duotone fa-regular fa-headset', label: 'Hỗ trợ',
                        content: <h4 className="box-title">Từ Thứ 2 đến Thứ 7: 8:30 - 17:30</h4>
                      },
                    ].map((item, i) => (
                      <div key={i} className="footer-contact">
                        <div className="box-icon"><i className={item.icon}></i></div>
                        <div className="media-body">
                          <p className="box-label">{item.label}</p>
                          {item.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact form */}
              <div className="col-lg-8">
                <div className="contact-form1">
                  <h4 className="contact-form-title">Liên hệ với chúng tôi</h4>
                  <form onSubmit={submit} className="input-label">
                    <div className="row">
                      <div className="form-group col-sm-6">
                        <input type="text" className="form-control bg-white" placeholder="Tên của bạn"
                          value={form.hoTen} onChange={e => set('hoTen', e.target.value)} onBlur={() => touch('hoTen')} />
                        {touched.hoTen && !form.hoTen && <small className="text-danger">Vui lòng nhập tên</small>}
                      </div>
                      <div className="form-group col-sm-6">
                        <input type="email" className="form-control bg-white" placeholder="Email của bạn"
                          value={form.email} onChange={e => set('email', e.target.value)} onBlur={() => touch('email')} />
                        {touched.email && !emailValid && <small className="text-danger">Email không hợp lệ</small>}
                      </div>
                      <div className="form-group col-sm-6">
                        <input type="text" className="form-control bg-white" placeholder="Số điện thoại"
                          value={form.soDienThoai} onChange={e => set('soDienThoai', e.target.value)} onBlur={() => touch('soDienThoai')} />
                        {touched.soDienThoai && !phoneValid && <small className="text-danger">Số điện thoại không hợp lệ</small>}
                      </div>
                      <div className="form-group col-12">
                        <textarea cols={30} rows={3} className="form-control bg-white" placeholder="Viết liên hệ của bạn"
                          value={form.noiDung} onChange={e => set('noiDung', e.target.value)} onBlur={() => touch('noiDung')} />
                        {touched.noiDung && !form.noiDung && <small className="text-danger">Vui lòng nhập nội dung</small>}
                      </div>
                      <div className="form-btn col-12 mt-10">
                        <button className="ot-btn" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin'}
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0920864278974!2d105.79723561156705!3d21.02900108768803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab43f83756ad%3A0x5c84a885f965e0e3!2zNDMzIMSQLiBOZ3V54buFbiBLaGFuZywgWcOqbiBIb8OgLCBD4bqndSBHaeG6pXksIEjDoCBO4buZaSAxMDAwMDAsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1771924265619!5m2!1svi!2s"
          style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </>
  );
}
