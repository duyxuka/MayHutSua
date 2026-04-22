'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCamNangBySlug, getByDanhMucCamNang, getDanhMucCamNangListAll, getCommentsByCamNang, createComment } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import { isLoggedIn, getUserNameFromToken } from '@/lib/auth';
import toast from 'react-hot-toast';
import './chitiet.css';

const AVATAR_COLORS = ['av-0', 'av-1', 'av-2', 'av-3', 'av-4'];
function getAvatarColor(name: string) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0; for (const c of name) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function getInitial(name: string) { return name ? name.trim().charAt(0).toUpperCase() : '?'; }
function initTree(nodes: any[]): any[] {
  if (!nodes?.length) return [];
  return nodes.map(n => ({ ...n, liked: n.liked ?? false, likeCount: n.likeCount ?? 0, replies: initTree(n.replies ?? []) }));
}
function countNodes(nodes: any[]): number {
  if (!nodes?.length) return 0;
  return nodes.reduce((s, n) => s + 1 + countNodes(n.replies ?? []), 0);
}

interface CommentNodeProps {
  comment: any; depth: number; parentId: string | null;
  replyTargetId: string | null; replyText: string; openReplies: Record<string, boolean>;
  onToggleLike: (c: any) => void; onToggleReply: (id: string, name: string, pid: string) => void;
  onToggleReplies: (id: string) => void; onReplyChange: (v: string) => void; onSubmitReply: () => void;
  onDelete: (id: string, pid: string | null) => void; openDropdownId: string | null;
  onToggleDropdown: (id: string, e: React.MouseEvent) => void; onCopy: (c: any) => void;
}
function CommentNode({ comment, depth, parentId, replyTargetId, replyText, openReplies, onToggleLike, onToggleReply, onToggleReplies, onReplyChange, onSubmitReply, onDelete, openDropdownId, onToggleDropdown, onCopy }: CommentNodeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className={`fb-comment-wrap${depth > 0 ? ' is-reply' : ''}`} data-depth={depth}>
      {depth > 0 && <div className="fb-thread-line"></div>}
      <div className="fb-comment-row">
        <div className="fb-avatar-wrap">
          <div className={`fb-avatar${depth > 0 ? ' av-sm' : ''} ${getAvatarColor(comment.tenNguoiDung)}`}>{getInitial(comment.tenNguoiDung)}</div>
          {comment.replies?.length > 0 && openReplies[comment.id] && <div className="fb-avatar-line"></div>}
        </div>
        <div className="fb-comment-body">
          <div className="fb-bubble">
            <button className="fb-more-btn" onClick={e => onToggleDropdown(comment.id, e)}>···</button>
            <div className="fb-name">{comment.tenNguoiDung}</div>
            <div className="fb-text">{comment.noiDung}</div>
            <div className="fb-date">{new Date(comment.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            {openDropdownId === comment.id && (
              <div className="fb-dropdown" onClick={e => e.stopPropagation()}>
                <div className="fb-dropdown-item" onClick={() => onCopy(comment)}>📋 Sao chép</div>
                <div className="fb-dropdown-item danger" onClick={() => onDelete(comment.id, parentId)}>🗑 Xóa</div>
              </div>
            )}
          </div>
          <div className="fb-actions">
            <button className={`fb-act${comment.liked ? ' liked' : ''}`} onClick={() => onToggleLike(comment)}>
              {comment.liked ? 'Đã thích' : 'Thích'}
            </button>
            {comment.likeCount > 0 && <span className="fb-like-count">👍 {comment.likeCount}</span>}
            <span className="fb-dot">·</span>
            <button className="fb-act" onClick={() => onToggleReply(comment.id, comment.tenNguoiDung, comment.id)}>Phản hồi</button>
          </div>
          {comment.replies?.length > 0 && (
            <button className="fb-reply-toggle" onClick={() => onToggleReplies(comment.id)}>
              <span className={`fb-chevron${openReplies[comment.id] ? ' open' : ''}`}>▾</span>
              {openReplies[comment.id] ? 'Ẩn' : 'Xem'} {comment.replies.length} phản hồi
            </button>
          )}
          {replyTargetId === comment.id && (
            <div className="fb-input-row fb-reply-input" style={{ marginTop: 8 }}>
              <div className="fb-avatar av-0 av-sm">B</div>
              <textarea ref={textareaRef} className="fb-textarea" value={replyText}
                onChange={e => { onReplyChange(e.target.value); if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmitReply(); } }}
                placeholder={`Phản hồi ${comment.tenNguoiDung}...`} rows={1} />
              <button className={`fb-send-btn${replyText.trim() ? ' active' : ''}`} onClick={onSubmitReply}>
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white" /></svg>
              </button>
            </div>
          )}
          {openReplies[comment.id] && comment.replies?.length > 0 && (
            <div className="fb-replies-wrap">
              {comment.replies.map((r: any) => (
                <CommentNode key={r.id} comment={r} depth={depth + 1} parentId={comment.id}
                  replyTargetId={replyTargetId} replyText={replyText} openReplies={openReplies}
                  onToggleLike={onToggleLike} onToggleReply={onToggleReply} onToggleReplies={onToggleReplies}
                  onReplyChange={onReplyChange} onSubmitReply={onSubmitReply} onDelete={onDelete}
                  openDropdownId={openDropdownId} onToggleDropdown={onToggleDropdown} onCopy={onCopy} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChiTietCamNangPage() {
  const { productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [mainText, setMainText] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyToName, setReplyToName] = useState('');
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const userName = getUserNameFromToken();
  const mainRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getDanhMucCamNangListAll().then(r => setCategories(r || [])).catch(() => {});
    if (!productSlug) return;
    setLoading(true);
    getCamNangBySlug(productSlug).then(res => {
      setArticle(res);
      setLoading(false);
      if (res.id) loadComments(res.id);
      if (res.slugDanhMuc) getByDanhMucCamNang(res.slugDanhMuc).then(r => setRelated((r || []).filter((x: any) => x.slug !== productSlug).slice(0, 5))).catch(() => {});
    }).catch(() => setLoading(false));

    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [productSlug]);

  function loadComments(id: string) {
    getCommentsByCamNang(id).then((res: any) => setComments(initTree(res || []))).catch(() => {});
  }

  function toggleLike(c: any) {
    setComments(prev => updateNode(prev, c.id, n => ({ ...n, liked: !n.liked, likeCount: (n.likeCount || 0) + (n.liked ? -1 : 1) })));
  }
  function updateNode(nodes: any[], id: string, fn: (n: any) => any): any[] {
    return nodes.map(n => n.id === id ? fn(n) : { ...n, replies: updateNode(n.replies || [], id, fn) });
  }
  function removeNode(nodes: any[], id: string): any[] {
    return nodes.filter(n => n.id !== id).map(n => ({ ...n, replies: removeNode(n.replies || [], id) }));
  }
  function toggleReplyInput(id: string, name: string, pid: string) {
    if (replyTargetId === id) { setReplyTargetId(null); setReplyToName(''); setReplyParentId(null); setReplyText(''); }
    else { setReplyTargetId(id); setReplyToName(name); setReplyParentId(pid); setReplyText(''); }
  }
  function submitMain() {
    if (!isLoggedIn()) { toast.error('Bạn cần đăng nhập để bình luận'); return; }
    if (!mainText.trim() || !article) return;
    createComment({ camNangId: article.id, noiDung: mainText.trim(), parentId: null })
      .then(() => { setMainText(''); loadComments(article.id); }).catch(() => {});
  }
  function submitReply() {
    if (!isLoggedIn()) { toast.error('Bạn cần đăng nhập để phản hồi'); return; }
    if (!replyText.trim() || !article || !replyParentId) return;
    createComment({ camNangId: article.id, noiDung: replyText.trim(), parentId: replyParentId })
      .then(() => {
        setOpenReplies(prev => ({ ...prev, [replyParentId]: true }));
        setReplyText(''); setReplyTargetId(null); setReplyToName(''); setReplyParentId(null);
        loadComments(article.id);
      }).catch(() => {});
  }

  if (loading) return <div className="container py-5 text-center"><i className="fas fa-spinner fa-spin fa-2x"></i></div>;
  if (!article) return <div className="container py-5 text-center">Không tìm thấy cẩm nang</div>;

  return (
    <>
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">{article.ten}</h1>
            <nav className="breadcrumb-nav">
              <Link href="/"><i className="fa-regular fa-house" style={{ color: 'rgb(255, 75, 140)', marginRight: 5 }}></i>Trang chủ</Link>
              <span className="separator">&gt;</span>
              <Link href="/kien-thuc-me-be">Cẩm nang</Link>
              <span className="separator">&gt;</span>
              <span className="current">{article.ten}</span>
            </nav>
          </div>
        </div>
      </div>

      <section className="ot-blog-wrapper blog-details space-top space-extra-bottom">
        <div className="container">
          <div className="row">
            {/* Main content */}
            <div className="col-xxl-8 col-lg-7">
              <div className="ot-blog blog-single">
                <div className="blog-img">
                  <img src={getImageUrl(article.anh)} alt={article.ten} />
                  <a className="blog-cat">{article.tenDanhMuc}</a>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <a><i className="far fa-calendar-days"></i>{new Date(article.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</a>
                    <a className="author"><i className="far fa-user"></i>By Adminmayhutsua.com.vn</a>
                  </div>
                  <h2 className="blog-title">{article.ten}</h2>
                  <div dangerouslySetInnerHTML={{ __html: article.mota || '' }} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-xxl-4 col-lg-5 sidebar-wrap">
              <aside className="sidebar-area">
                {/* Categories */}
                <div className="widget widget_categories">
                  <h3 className="widget_title">Danh mục cẩm nang</h3>
                  <ul>
                    {categories.map(cat => (
                      <li key={cat.id}>
                        <Link href={`/danh-muc-kien-thuc/${cat.slug}`}>{cat.ten}</Link>
                        <span>{cat.soLuong}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related */}
                {related.length > 0 && (
                  <div className="widget">
                    <h3 className="widget_title">Cẩm nang gần đây</h3>
                    <div className="recent-post-wrap">
                      {related.map((item, i) => (
                        <div key={i} className="recent-post">
                          <div className="media-img">
                            <Link href={`/kien-thuc-me-be/${item.slugDanhMuc}/${item.slug}`}>
                              <img src={getImageUrl(item.anh)} alt={item.ten} />
                            </Link>
                          </div>
                          <div className="media-body">
                            <h4 className="post-title">
                              <Link className="text-inherit" href={`/kien-thuc-me-be/${item.slugDanhMuc}/${item.slug}`}>{item.ten}</Link>
                            </h4>
                            <div className="recent-post-meta">
                              <i className="fa-solid fa-calendar-days" style={{ color: 'rgb(255, 75, 140)', marginRight: 10 }}></i>
                              <span>{new Date(item.creationTime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div className="fb-comment-section">
                  <div className="fb-section-title">Bình luận ({countNodes(comments)})</div>
                  {comments.length > 0 ? (
                    <div className="fb-comments">
                      {comments.map((c, i) => (
                        <CommentNode key={c.id} comment={c} depth={0} parentId={null}
                          replyTargetId={replyTargetId} replyText={replyText} openReplies={openReplies}
                          onToggleLike={toggleLike}
                          onToggleReply={toggleReplyInput}
                          onToggleReplies={id => setOpenReplies(p => ({ ...p, [id]: !p[id] }))}
                          onReplyChange={setReplyText}
                          onSubmitReply={submitReply}
                          onDelete={(id, pid) => setComments(prev => removeNode(prev, id))}
                          openDropdownId={openDropdownId}
                          onToggleDropdown={(id, e) => { e.stopPropagation(); setOpenDropdownId(p => p === id ? null : id); }}
                          onCopy={c => { navigator.clipboard?.writeText(c.noiDung); setOpenDropdownId(null); }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="fb-empty">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
                  )}

                  {/* Main input */}
                  <div className="fb-input-row" style={{ marginTop: 14 }}>
                    <div className="fb-avatar av-0">{getInitial(userName || 'B')}</div>
                    <textarea ref={mainRef} className="fb-textarea" value={mainText}
                      onChange={e => { setMainText(e.target.value); if (mainRef.current) { mainRef.current.style.height = 'auto'; mainRef.current.style.height = Math.min(mainRef.current.scrollHeight, 120) + 'px'; } }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMain(); } }}
                      placeholder="Viết bình luận..." rows={1} />
                    <button className={`fb-send-btn${mainText.trim() ? ' active' : ''}`} onClick={submitMain}>
                      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white" /></svg>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
