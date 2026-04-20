'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { login, forgotPassword } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DangNhapPage() {
  const { saveTokens } = useAuth();
  const [form, setForm] = useState({ emailorphone: '', password: '', forgotEmail: '' });
  const [touched, setTouched] = useState({ emailorphone: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ emailorphone: true, password: true });
    if (!form.emailorphone || form.emailorphone.length < 3) return;
    if (!form.password || form.password.length < 6) return;
    setIsSubmitting(true);
    try {
      const res = await login(form.emailorphone, form.password);
      saveTokens(res.access_token, res.refresh_token);
      window.location.href = '/';
    } catch {
      toast.error('Sai tài khoản hoặc mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgot() {
    if (!form.forgotEmail) { toast.error('Vui lòng nhập email'); return; }
    try {
      await forgotPassword(form.forgotEmail.trim());
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu');
      setShowForgot(false);
      set('forgotEmail', '');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Đăng nhập</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Đăng nhập</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="ot-checkout-wrapper space-top space-extra-bottom">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <form className="woocommerce-form-login" onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email hoặc SĐT <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Nhập Email hoặc SĐT"
                    value={form.emailorphone} onChange={e => set('emailorphone', e.target.value)} onBlur={() => touch('emailorphone')} />
                  {touched.emailorphone && form.emailorphone.length < 3 && (
                    <small className="text-danger">Email hoặc SĐT phải tối thiểu 3 ký tự</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Mật khẩu <span className="text-danger">*</span></label>
                  <div className="password-input">
                    <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Nhập mật khẩu"
                      value={form.password} onChange={e => set('password', e.target.value)} onBlur={() => touch('password')} />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
                      <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {touched.password && form.password.length < 6 && (
                    <small className="text-danger">Mật khẩu phải tối thiểu 6 ký tự</small>
                  )}
                </div>

                <div className="form-group">
                  <button type="submit" className="ot-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                  <p className="mt-3 mb-0">
                    <a className="text-reset" href="#" onClick={e => { e.preventDefault(); setShowForgot(v => !v); }}>
                      Quên mật khẩu?
                    </a>
                  </p>

                  {showForgot && (
                    <div className="mt-3">
                      <input type="email" className="form-control" placeholder="Nhập email của bạn"
                        value={form.forgotEmail} onChange={e => set('forgotEmail', e.target.value)} />
                      <button type="button" className="ot-btn mt-2 w-100" onClick={handleForgot}>
                        Gửi yêu cầu đặt lại mật khẩu
                      </button>
                    </div>
                  )}

                  <p className="mt-3 mb-0">
                    <Link className="text-reset" href="/dang-ky">Chưa có tài khoản? Đăng ký ngay</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}