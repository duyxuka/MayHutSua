import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'VietLifeStore - Máy hút sữa & Sản phẩm mẹ bé',
  description: 'Cửa hàng trực tuyến chuyên cung cấp sản phẩm dành cho trẻ em và mẹ bầu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/slick.min.css" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <ChatWidget />
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
        <script src="/assets/js/jquery-3.7.1.min.js" defer></script>
        <script src="/assets/js/bootstrap.bundle.min.js" defer></script>
        <script src="/assets/js/slick.min.js" defer></script>
        <script src="/assets/js/main.js" defer></script>
      </body>
    </html>
  );
}