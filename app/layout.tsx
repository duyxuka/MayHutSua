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
import '../public/assets/css/app.min.css';
import '../public/assets/css/all.css';
import '../public/assets/css/style.css';
import { Quicksand, Source_Sans_3, Baloo_2, Nunito } from 'next/font/google';

const quicksand = Quicksand({
  subsets: ['vietnamese'],
  display: 'swap',
  variable: '--font-quicksand',
});

const sourceSans = Source_Sans_3({
  subsets: ['vietnamese'],
  display: 'swap',
  variable: '--font-source-sans',
});

const baloo2 = Baloo_2({
  subsets: ['vietnamese'],
  display: 'swap',
  weight: ['400', '600'],
  variable: '--font-baloo-2',
});

const nunito = Nunito({
  subsets: ['vietnamese'],
  display: 'swap',
  weight: ['400', '600'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'VietLifeStore - Máy hút sữa & Sản phẩm mẹ bé',
  description: 'Cửa hàng trực tuyến chuyên cung cấp sản phẩm dành cho trẻ em và mẹ bầu',
  authors: [{ name: 'VietLife' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${quicksand.variable} ${sourceSans.variable} ${baloo2.variable} ${nunito.variable}`}>
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