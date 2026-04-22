'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDanhMucChinhSachAll, getChinhSachByDanhMuc } from '@/lib/api';
import styles from './chinhsach.module.css';

export default function ChinhSachPage() {
  const [danhMucList, setDanhMucList] = useState<any[]>([]);
  const [chinhSachList, setChinhSachList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTen, setSelectedTen] = useState('');
  const [openedIndex, setOpenedIndex] = useState<number | null>(0);

  useEffect(() => {
    getDanhMucChinhSachAll().then(res => {
      setDanhMucList(res || []);
      if (res?.length > 0) selectDanhMuc(res[0].id, res[0].ten);
    }).catch(() => {});
  }, []);

  function selectDanhMuc(id: string, ten: string) {
    setSelectedId(id);
    setSelectedTen(ten);
    setOpenedIndex(0);
    getChinhSachByDanhMuc(id).then(res => setChinhSachList(res || [])).catch(() => {});
  }

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">{selectedTen || 'Chính sách'}</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span>Chính sách</span>
              {selectedTen && <><span className="separator">&gt;</span><span className="current">{selectedTen}</span></>}
            </nav>
          </div>
        </div>
      </div>

      <div className="space overflow-hidden">
        <div className="container">
          <div className="row gy-40 justify-content-center">
            {/* Content */}
            <div className="col-xxl-9 col-lg-8 align-self-center">
              <div className={styles['faq-tab-wrap']}>
                <h3 className="faq-title text-center">{selectedTen}</h3>
                <div className="accordion" id="faqAccordion">
                  {chinhSachList.map((item, i) => (
                    <div key={i} className="accordion-card">
                      <div className="accordion-header">
                        <button
                          className={`accordion-button${openedIndex !== i ? ' collapsed' : ''}`}
                          type="button"
                          onClick={() => setOpenedIndex(openedIndex === i ? null : i)}>
                          {i + 1}. {item.tieuDe}
                        </button>
                      </div>
                      <div className={`accordion-collapse collapse${openedIndex === i ? ' show' : ''}`}>
                        <div className="accordion-body">
                          <div dangerouslySetInnerHTML={{ __html: item.noiDung }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-xxl-3 col-lg-4 sidebar-wrap">
              <aside className="sidebar-area">
                <div className="widget widget_categories">
                  <h3 className="widget_title">Chính sách</h3>
                  <ul>
                    {danhMucList.map(item => (
                      <li key={item.id}>
                        <a href="#" className={item.id === selectedId ? styles.active : ''}
                          onClick={e => { e.preventDefault(); selectDanhMuc(item.id, item.ten); }}>
                          {item.ten}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
