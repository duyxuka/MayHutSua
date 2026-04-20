'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { register, login } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DangKyPage() {
  const router = useRouter();
  const { saveTokens } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', birthDay: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = /^[0-9]{9,11}$/.test(form.phoneNumber);
  const passwordsMatch = form.password === form.confirmPassword;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phoneNumber: true, password: true, confirmPassword: true, birthDay: true });
    if (!form.fullName || !emailValid || !phoneValid || form.password.length < 6 || !passwordsMatch || !form.birthDay) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      await register({
        userName: form.email,
        email: form.email,
        password: form.password,
        name: form.fullName,
        phoneNumber: form.phoneNumber,
        birthDay: form.birthDay
      });
      const res = await login(form.email, form.password);
      saveTokens(res.access_token, res.refresh_token);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đăng ký hoặc đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Đăng ký</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Đăng ký</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="ot-checkout-wrapper space-top space-extra-bottom">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <form className="woocommerce-form-login row" onSubmit={handleRegister}>

                <div className="form-group col-lg-6">
                  <label>Họ và tên <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Nhập họ và tên"
                    value={form.fullName} onChange={e => set('fullName', e.target.value)} onBlur={() => touch('fullName')} />
                  {touched.fullName && !form.fullName && <small className="text-danger">Họ tên không được để trống</small>}
                </div>

                <div className="form-group col-lg-6">
                  <label>Email <span className="text-danger">*</span></label>
                  <input type="email" className="form-control" placeholder="Nhập email"
                    value={form.email} onChange={e => set('email', e.target.value)} onBlur={() => touch('email')} />
                  {touched.email && !form.email && <small className="text-danger">Email không được để trống</small>}
                  {touched.email && form.email && !emailValid && <small className="text-danger">Email không hợp lệ</small>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Nhập số điện thoại"
                    value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} onBlur={() => touch('phoneNumber')} />
                  {touched.phoneNumber && !phoneValid && <small className="text-danger">Số điện thoại phải 10 số</small>}
                </div>

                <div className="form-group">
                  <label>Ngày sinh <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Nhập ngày sinh"
                    value={form.birthDay} onChange={e => set('birthDay', e.target.value)} onBlur={() => touch('birthDay')} />
                  {touched.birthDay && !form.birthDay && <small className="text-danger">Hãy điền ngày sinh của bạn</small>}
                </div>

                <div className="form-group col-lg-6">
                  <label>Mật khẩu <span className="text-danger">*</span></label>
                  <div className="password-input">
                    <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Nhập mật khẩu"
                      value={form.password} onChange={e => set('password', e.target.value)} onBlur={() => touch('password')} />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
                      <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {touched.password && form.password.length < 6 && <small className="text-danger">Mật khẩu tối thiểu 6 ký tự</small>}
                </div>

                <div className="form-group col-lg-6">
                  <label>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                  <div className="password-input">
                    <input type={showConfirm ? 'text' : 'password'} className="form-control" placeholder="Nhập lại mật khẩu"
                      value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} onBlur={() => touch('confirmPassword')} />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                      <i className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {touched.confirmPassword && !passwordsMatch && <small className="text-danger">Mật khẩu xác nhận không khớp</small>}
                </div>

                <div className="form-group">
                  <button type="submit" className="ot-btn" disabled={isLoading}>
                    {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </button>
                  <p className="mt-3 mb-0">
                    <Link className="text-reset" href="/dang-nhap">Đã có tài khoản? Đăng nhập</Link>
                  </p>
                </div>

                {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}