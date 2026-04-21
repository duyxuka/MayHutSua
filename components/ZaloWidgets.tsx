'use client';

import { useState, useEffect } from 'react';

export default function ZaloWidgets() {
  const [openPopup, setOpenPopup] = useState<string | null>(null);

  const togglePopup = (id: string) => {
    setOpenPopup(openPopup === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.zalo-item')) {
        setOpenPopup(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <div className="zalo-group">
        {/* Zalo Hà Nội */}
        <div className="zalo-item">
          <div className={`zalo-popup ${openPopup === 'popup-hn' ? 'open' : ''}`} id="popup-hn">
            <div className="zalo-popup-header">
              <div className="zalo-header-left">
                <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo" />
                <div>
                  <div className="zalo-header-name">Zalo Hà Nội</div>
                  <div className="zalo-header-status">● Đang hoạt động</div>
                </div>
              </div>
              <button className="zalo-close" onClick={() => setOpenPopup(null)}>✕</button>
            </div>
            <div className="zalo-popup-body">
              <div className="zalo-message">
                <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="" className="zalo-avatar" />
                <div className="zalo-bubble">Xin chào! Bạn cần tư vấn gì không? Nhắn tin Zalo để được hỗ trợ nhé 😊</div>
              </div>
            </div>
            <a className="zalo-popup-footer" href="https://zalo.me/4398350715712959001" target="_blank" rel="noreferrer">
              <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo" />
              Nhắn tin qua Zalo
            </a>
          </div>
          <div className="zalo-btn-wrap">
            <span className="zalo-label">Hà Nội</span>
            <button className="zalo-btn" onClick={(e) => { e.stopPropagation(); togglePopup('popup-hn'); }}>
              <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo HN" />
              <span className="zalo-dot"></span>
            </button>
          </div>
        </div>

        {/* Zalo Hồ Chí Minh */}
        <div className="zalo-item">
          <div className={`zalo-popup ${openPopup === 'popup-hcm' ? 'open' : ''}`} id="popup-hcm">
            <div className="zalo-popup-header">
              <div className="zalo-header-left">
                <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo" />
                <div>
                  <div className="zalo-header-name">Zalo Hồ Chí Minh</div>
                  <div className="zalo-header-status">● Đang hoạt động</div>
                </div>
              </div>
              <button className="zalo-close" onClick={() => setOpenPopup(null)}>✕</button>
            </div>
            <div className="zalo-popup-body">
              <div className="zalo-message">
                <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="" className="zalo-avatar" />
                <div className="zalo-bubble">Xin chào! Bạn cần tư vấn gì không? Nhắn tin Zalo để được hỗ trợ nhé 😊</div>
              </div>
            </div>
            <a className="zalo-popup-footer" href="https://zalo.me/1318934895301180062" target="_blank" rel="noreferrer">
              <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo" />
              Nhắn tin qua Zalo
            </a>
          </div>
          <div className="zalo-btn-wrap">
            <span className="zalo-label">Hồ Chí Minh</span>
            <button className="zalo-btn" onClick={(e) => { e.stopPropagation(); togglePopup('popup-hcm'); }}>
              <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo HCM" />
              <span className="zalo-dot"></span>
            </button>
          </div>
        </div>
      </div>
      <div className="slider-drag-cursor"></div>
    </>
  );
}