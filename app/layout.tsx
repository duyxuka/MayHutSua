import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import ZaloWidgets from '@/components/ZaloWidgets';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'VietLifeStore - Máy hút sữa & Sản phẩm mẹ bé',
  description: 'Cửa hàng trực tuyến chuyên cung cấp sản phẩm dành cho trẻ em và mẹ bầu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com/"/>
        <link rel="preconnect" href="https://fonts.gstatic.com/"/>
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&amp;family=Source+Sans+3:ital,wght@0,200..900;1,200..900&amp;display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600&family=Nunito:wght@400;600&display=swap" rel="stylesheet"/>
        <link rel="stylesheet" href="/assets/css/app.min.css" />
        <link rel="stylesheet" href="/assets/css/all.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <ChatWidget />
            <ZaloWidgets />
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
        <Script src="/assets/js/vendor/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/app.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}