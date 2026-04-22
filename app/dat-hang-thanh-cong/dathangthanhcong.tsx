'use client';
import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function DatHangThanhCongContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Đặt hàng thành công</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Đặt hàng thành công</span>
            </nav>
          </div>
        </div>
      </div>
      <div className="space-top space-extra-bottom">
        <div className="container text-center">
          <div className="py-5">
            <i className="fas fa-check-circle" style={{ fontSize: 80, color: '#28a745', marginBottom: 20 }}></i>
            <h2>Cảm ơn bạn đã đặt hàng!</h2>
            {orderId && <p className="text-muted">Mã đơn hàng: <strong>{orderId}</strong></p>}
            <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
            <div className="mt-4">
              <Link href="/" className="ot-btn me-3">Về trang chủ</Link>
              <Link href="/tai-khoan-cua-ban" className="ot-btn">Xem đơn hàng</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DatHangThanhCongPage() {
  return (
    <Suspense fallback={<div className="container py-5">Đang tải...</div>}>
      <DatHangThanhCongContent />
    </Suspense>
  );
}