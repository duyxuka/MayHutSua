import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-top space-extra-bottom">
      <div className="container text-center py-5">
        <h1 style={{ fontSize: 120, fontWeight: 700, color: '#FE5A86', lineHeight: 1 }}>404</h1>
        <h2 className="mb-3">Trang không tồn tại</h2>
        <p className="text-muted mb-4">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="ot-btn">Về trang chủ</Link>
      </div>
    </div>
  );
}