'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';
import toast from 'react-hot-toast';
import './resetpassword.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return; }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    setIsSubmitting(true);
    try {
      await resetPassword({ userId, token, newPassword });
      toast.success('Đặt lại mật khẩu thành công');
      window.location.href = '/dang-nhap';
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Đặt lại mật khẩu</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Đặt lại mật khẩu</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="ot-checkout-wrapper space-top space-extra-bottom">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <form className="woocommerce-form-login" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Mật khẩu mới <span className="text-danger">*</span></label>
                  <input type="password" className="form-control" placeholder="Nhập mật khẩu mới"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                  <input type="password" className="form-control" placeholder="Nhập lại mật khẩu"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <button type="submit" className="ot-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container py-5">Đang tải...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}