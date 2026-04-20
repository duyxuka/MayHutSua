'use client';
import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/context/AuthContext';
import { createConversation, getMessages } from '@/lib/api';
import { BASE_URL } from '@/lib/config';
import { getAccessToken, getUserIdFromToken } from '@/lib/auth';

interface Msg { role: 'user' | 'assistant'; content: string; isStreaming?: boolean; }

export default function ChatWidget() {
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const hubRef = useRef<signalR.HubConnection | null>(null);
  const msgBoxRef = useRef<HTMLDivElement>(null);
  const storageKeyRef = useRef('chat_widget_conv');

  const scrollToBottom = () => {
    if (msgBoxRef.current) msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const userId = getUserIdFromToken();
    storageKeyRef.current = userId ? `chat_widget_conv_${userId}` : 'chat_widget_conv';

    // Setup SignalR
    const hub = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}hubs/chat`, { accessTokenFactory: () => getAccessToken() ?? '' })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hub.on('ReceiveChunk', (delta: string) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.isStreaming) {
          return [...prev.slice(0, -1), { ...last, content: last.content + delta }];
        }
        return prev;
      });
      setTimeout(scrollToBottom, 20);
    });

    hub.on('ReceiveFinished', () => {
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, isStreaming: false } : m));
      setIsStreaming(false);
    });

    hub.on('ReceiveError', () => {
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, isStreaming: false, content: m.content + '\n[Có lỗi xảy ra]' } : m));
      setIsStreaming(false);
    });

    hub.start().catch(err => console.error('[ChatHub]', err));
    hubRef.current = hub;

    // Load history or create new
    const savedId = localStorage.getItem(storageKeyRef.current);
    if (savedId) {
      setIsLoadingHistory(true);
      getMessages(savedId)
        .then(msgs => {
          setConversationId(savedId);
          setMessages(msgs.map((m: any) => ({ role: m.role === 1 ? 'user' : 'assistant', content: m.content })));
          setIsReady(true);
          setIsLoadingHistory(false);
          setTimeout(scrollToBottom, 100);
        })
        .catch(() => {
          localStorage.removeItem(storageKeyRef.current);
          setIsLoadingHistory(false);
          startNewConv();
        });
    } else {
      startNewConv();
    }

    return () => { hub.stop(); };
  }, [isLoggedIn]);

  function startNewConv() {
    createConversation('gemini-2.5-flash')
      .then(conv => {
        setConversationId(conv.id);
        localStorage.setItem(storageKeyRef.current, conv.id);
        setIsReady(true);
        setMessages([{ role: 'assistant', content: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?' }]);
      })
      .catch(() => console.error('[ChatWidget] Không thể tạo conversation'));
  }

  function newConversation() {
    localStorage.removeItem(storageKeyRef.current);
    setMessages([]);
    setIsReady(false);
    setConversationId(null);
    startNewConv();
  }

  async function send() {
    const content = inputText.trim();
    if (!content || isStreaming || !conversationId || !isReady) return;
    setInputText('');
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'user', content }, { role: 'assistant', content: '', isStreaming: true }]);
    setTimeout(scrollToBottom, 50);
    try {
      await hubRef.current?.invoke('SendMessage', conversationId, content);
    } catch {
      setIsStreaming(false);
      setMessages(prev => prev.slice(0, -1));
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* FAB */}
      <button className={`cw-fab${isOpen ? ' cw-fab--open' : ''}`}
        onClick={() => { setIsOpen(v => !v); if (!isOpen) setTimeout(scrollToBottom, 100); }}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}>
        {!isOpen ? (
          <div className="cw-fab__icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 5.58 2 10c0 2.4 1.18 4.56 3.07 6.09L4 21l5.3-2.65C10.17 18.77 11.07 19 12 19c5.52 0 10-3.58 10-8s-4.48-9-10-8z" fill="white" opacity=".95" />
              <circle cx="8.5" cy="10" r="1.2" fill="#f472b6" />
              <circle cx="12" cy="10" r="1.2" fill="#f472b6" />
              <circle cx="15.5" cy="10" r="1.2" fill="#f472b6" />
            </svg>
            <span className="cw-fab__ai-badge">✦</span>
          </div>
        ) : (
          <i className="far fa-times" style={{ color: 'white', fontSize: 18 }}></i>
        )}
        <span className="cw-fab__label">Chat với AI</span>
      </button>

      {/* Chat Window */}
      <div className={`cw-window${isOpen ? ' cw-window--open' : ''}`}>
        {/* Header */}
        <div className="cw-header">
          <div className="cw-header__info">
            <span className="cw-avatar">🤖</span>
            <div>
              <p className="cw-header__name">AI Assistant</p>
              <p className="cw-header__sub">VietLifeBaby · Hỗ trợ 24/7</p>
            </div>
          </div>
          <div className="cw-header__actions">
            {isLoggedIn && (
              <button className="cw-icon-btn" onClick={newConversation} title="Cuộc trò chuyện mới">
                <i className="far fa-plus"></i>
              </button>
            )}
            <button className="cw-icon-btn" onClick={() => setIsOpen(false)}>
              <i className="far fa-times"></i>
            </button>
          </div>
        </div>

        {/* Chưa đăng nhập */}
        {!isLoggedIn && (
          <div className="cw-login-area">
            <div className="cw-login-icon">🔒</div>
            <p className="cw-login-title">Đăng nhập để chat</p>
            <p className="cw-login-desc">Hãy đăng nhập để trò chuyện với AI Assistant và nhận tư vấn sản phẩm dành riêng cho bạn.</p>
            <a href="/dang-nhap" className="cw-login-btn"><i className="far fa-sign-in"></i> Đăng nhập ngay</a>
            <p className="cw-register-link">Chưa có tài khoản? <a href="/dang-ky">Đăng ký miễn phí</a></p>
          </div>
        )}

        {/* Đã đăng nhập */}
        {isLoggedIn && (
          <>
            {isLoadingHistory && (
              <div className="cw-loading">
                <div className="cw-skeleton cw-skeleton--ai"></div>
                <div className="cw-skeleton cw-skeleton--user"></div>
                <div className="cw-skeleton cw-skeleton--ai"></div>
              </div>
            )}
            {!isLoadingHistory && (
              <div className="cw-messages" ref={msgBoxRef}>
                {messages.length === 0 && <div className="cw-empty">Chưa có tin nhắn nào</div>}
                {messages.map((msg, i) => (
                  <div key={i} className={`cw-bubble-wrap cw-bubble-wrap--${msg.role === 'user' ? 'user' : 'ai'}`}>
                    <div className={`cw-bubble cw-bubble--${msg.role === 'user' ? 'user' : 'ai'}`}>
                      {msg.content}
                      {msg.isStreaming && <span className="cw-cursor">▍</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="cw-input-area">
              <textarea
                className="cw-textarea"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={onKey}
                disabled={isStreaming || !isReady || isLoadingHistory}
                placeholder={isLoadingHistory ? 'Đang tải...' : isReady ? 'Nhập tin nhắn... (Enter để gửi)' : 'Đang kết nối...'}
                rows={1}
              />
              <button className="cw-send" onClick={send} disabled={isStreaming || !inputText.trim() || !isReady || isLoadingHistory}>
                <i className={`far ${isStreaming ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}