'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { postPayment } from '@/lib/api';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TxnRef = searchParams.get('vnp_TxnRef');
  const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
  const vnp_Amount = searchParams.get('vnp_Amount');
  const vnp_BankCode = searchParams.get('vnp_BankCode');
  const vnp_TmnCode = searchParams.get('vnp_TmnCode');
  const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');

  const isSuccess = vnp_ResponseCode === '00';
  const statusMessage = vnp_ResponseCode === '00'
    ? 'Thanh toán thành công'
    : vnp_ResponseCode === '24'
    ? 'Bạn đã hủy giao dịch'
    : 'Thanh toán thất bại';

  useEffect(() => {
    postPayment({
      amount: vnp_Amount,
      transactionId: vnp_TransactionNo,
      paymentCode: vnp_TxnRef,
      paymentInfor: vnp_OrderInfo,
      status: vnp_ResponseCode
    }).then(() => clearCart()).catch(console.error);
  }, []);

  return (
    <div className="ot-checkout-wrapper space-top space-extra-bottom">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow p-4 rounded-4 text-center">
              <h3 className="mb-4">Kết quả thanh toán</h3>
              <div className="mb-3">
                <img src={isSuccess ? '/assets/img/Success.gif' : '/assets/img/Error.gif'} width={80} alt="status" />
              </div>
              <h5 className={isSuccess ? 'text-success' : 'text-danger'}>{statusMessage}</h5>
              <hr />
              <p><b>Mã website:</b> {vnp_TmnCode}</p>
              <p><b>Mã đơn hàng:</b> {vnp_TxnRef}</p>
              <p><b>Mã giao dịch VNPAY:</b> {vnp_TransactionNo}</p>
              <p><b>Số tiền thanh toán:</b> {(+(vnp_Amount ?? 0) / 100).toLocaleString('vi-VN')} VNĐ</p>
              <p><b>Ngân hàng:</b> {vnp_BankCode}</p>
              <button className="ot-btn w-100 mt-3" onClick={() => router.push('/san-pham')}>
                Tiếp tục mua hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Đang xử lý...</div>}>
      <PaymentContent />
    </Suspense>
  );
}