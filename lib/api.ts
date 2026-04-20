import { API_URL, BASE_URL } from './config';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── BANNER ───────────────────────────────────────────
export const getAllBanner = () =>
  apiFetch<any[]>(`${API_URL}banners/all`);

// ─── DANH MỤC ─────────────────────────────────────────
export const getDanhMucSPListAll = () =>
  apiFetch<any[]>(`${API_URL}danh-muc-san-phams/all`);

export const getDanhMucCamNangListAll = () =>
  apiFetch<any[]>(`${API_URL}danh-muc-cam-nangs/all`);

// ─── SẢN PHẨM ─────────────────────────────────────────
export const getSanPhamBySlug = (slug: string) =>
  apiFetch<any>(`${API_URL}san-phams/by-slug?slug=${slug}`);

export const getSanPhamBanChay = (top = 6) =>
  apiFetch<any[]>(`${API_URL}san-phams/top-ban-chay?top=${top}`);

export const getSanPhamTopBanChay = (top = 4) =>
  apiFetch<any[]>(`${API_URL}san-phams/top-ban-chay?top=${top}`);

export const getByDanhMucSP = (slug: string) =>
  apiFetch<any[]>(`${API_URL}san-phams/by-danh-muc?slug=${slug}`);

export interface FilterParams {
  keyword?: string;
  sort?: string;
  danhMucSlug?: string;
  skipCount: number;
  maxResultCount: number;
}

export const getListFilterSanPham = (filter: FilterParams) => {
  const params = new URLSearchParams();
  params.set('skipCount', String(filter.skipCount));
  params.set('maxResultCount', String(filter.maxResultCount));
  if (filter.danhMucSlug) params.set('danhMucSlug', filter.danhMucSlug);
  if (filter.keyword) params.set('keyword', filter.keyword);
  if (filter.sort) params.set('sort', filter.sort);
  return apiFetch<{ items: any[]; totalCount: number }>(
    `${API_URL}san-phams/filter?${params}`
  );
};

export const tangLuotXem = (productId: string) =>
  apiFetch(`${API_URL}san-phams/tang-luot-xem/${productId}`, { method: 'POST' });

// ─── CẨM NANG ─────────────────────────────────────────
export const getCamNangHomeMoiNhat = () =>
  apiFetch<any[]>(`${API_URL}cam-nangs/latest-cam-nang-home?take=4`);

export const getCamNangBySlug = (slug: string) =>
  apiFetch<any>(`${API_URL}cam-nangs/by-slug?slug=${slug}`);

export const getByDanhMucCamNang = (slug: string) =>
  apiFetch<any[]>(`${API_URL}cam-nangs/by-danh-muc?slug=${slug}`);

export const getListFilterCamNang = (filter: Omit<FilterParams, 'sort'>) => {
  const params = new URLSearchParams();
  params.set('skipCount', String(filter.skipCount));
  params.set('maxResultCount', String(filter.maxResultCount));
  if (filter.danhMucSlug) params.set('danhMucSlug', filter.danhMucSlug);
  if (filter.keyword) params.set('keyword', filter.keyword);
  return apiFetch<{ items: any[]; totalCount: number }>(
    `${API_URL}cam-nangs/filter?${params}`
  );
};

// ─── BÌNH LUẬN CẨM NANG ───────────────────────────────
export const getCommentsByCamNang = (id: string) =>
  apiFetch<any[]>(`${API_URL}cam-nang-comment/by-cam-nang/${id}`);

export const createComment = (data: any) =>
  apiFetch(`${API_URL}cam-nang-comment`, { method: 'POST', body: JSON.stringify(data) });

// ─── ĐÁNH GIÁ SẢN PHẨM ───────────────────────────────
export const getReviewsByProduct = (productId: string) =>
  apiFetch<any>(`${API_URL}san-pham-reviews/by-san-pham/${productId}`);

export const createReview = (data: any) =>
  apiFetch(`${API_URL}san-pham-reviews`, { method: 'POST', body: JSON.stringify(data) });

// ─── LIÊN HỆ ──────────────────────────────────────────
export const createLienHe = (data: any) =>
  apiFetch(`${API_URL}lien-hes`, { method: 'POST', body: JSON.stringify(data) });

// ─── CHÍNH SÁCH ───────────────────────────────────────
export const getDanhMucChinhSachAll = () =>
  apiFetch<any[]>(`${API_URL}danh-muc-chinh-sachs/all`);

export const getChinhSachByDanhMuc = (danhMucId: string) =>
  apiFetch<any[]>(`${API_URL}chinh-sachs/by-danh-muc-id/${danhMucId}`);

// ─── TIKTOK / VIDEO ───────────────────────────────────
export const getTikTokVideos = (section = 'HomePage') =>
  apiFetch<any[]>(`${API_URL}social-videos/by-section?section=${section}`);

// ─── ĐƠN HÀNG ─────────────────────────────────────────
export const createDonHang = (data: any) =>
  apiFetch<any>(`${API_URL}don-hangs`, { method: 'POST', body: JSON.stringify(data) });

export const cancelOrder = (id: string) =>
  apiFetch(`${API_URL}don-hangs/${id}/cancel-order`, { method: 'POST' });

// ─── THANH TOÁN ───────────────────────────────────────
export const createPayment = (orderId: string) =>
  apiFetch<string>(`${BASE_URL}api/payment/create-url?orderId=${orderId}`, { method: 'POST' });

export const postPayment = (data: any) =>
  apiFetch(`${API_URL}payment-information-models`, { method: 'POST', body: JSON.stringify(data) });

export const getPendingVnpayOrder = (userId: string) =>
  apiFetch<any>(`${BASE_URL}api/payment/pending?userId=${userId}`);

export const cancelPendingOrder = (orderId: string) =>
  apiFetch(`${BASE_URL}api/payment/cancel-pending?orderId=${orderId}`, { method: 'POST' });

// ─── VOUCHER ──────────────────────────────────────────
export const validateVoucher = (code: string, orderTotal: number) =>
  apiFetch<any>(`${API_URL}vouchers/validate-voucher?code=${code}&orderTotal=${orderTotal}`, { method: 'POST' });

export const getMyVouchersWithStatus = (orderTotal: number) =>
  apiFetch<any[]>(`${API_URL}vouchers/my-vouchers-with-status?orderTotal=${orderTotal}`);

export const getListAllVouchers = (phamVi?: number) =>
  apiFetch<any[]>(`${API_URL}vouchers/all${phamVi ? `?phamVi=${phamVi}` : ''}`);

export const getVouchersByDanhMuc = (danhMucId: string) =>
  apiFetch<any[]>(`${API_URL}vouchers/all?danhMucId=${danhMucId}`);

export const getVouchersBySanPham = (sanPhamId: string) =>
  apiFetch<any[]>(`${API_URL}vouchers/all?sanPhamId=${sanPhamId}`);

export const nhanVoucher = (voucherId: string) =>
  apiFetch(`${API_URL}vouchers/nhan-voucher/${voucherId}`, { method: 'POST' });

export const getMyVouchers = () =>
  apiFetch<any[]>(`${API_URL}vouchers/my-vouchers`);

// ─── SEO ──────────────────────────────────────────────
export const getSeoByPageKey = (pageKey: string) =>
  apiFetch<any>(`${API_URL}seo-config/by-page-key?pageKey=${pageKey}`);

// ─── TIN TỨC ──────────────────────────────────────────
export const getListFilterTinTuc = (filter: { keyword?: string; skipCount: number; maxResultCount: number }) => {
  const params = new URLSearchParams();
  params.set('skipCount', String(filter.skipCount));
  params.set('maxResultCount', String(filter.maxResultCount));
  if (filter.keyword) params.set('keyword', filter.keyword);
  return apiFetch<{ items: any[]; totalCount: number }>(`${API_URL}tin-tucs/filter?${params}`);
};

export const getTinTucBySlug = (slug: string) =>
  apiFetch<any>(`${API_URL}tin-tucs/by-slug/?slug=${slug}`);

// ─── CHAT ─────────────────────────────────────────────
export const createConversation = (model: string) =>
  apiFetch<{ id: string }>(`${BASE_URL}api/chat/conversations`, {
    method: 'POST',
    body: JSON.stringify({ model }),
  });

export const getMessages = (conversationId: string) =>
  apiFetch<any[]>(`${BASE_URL}api/chat/conversations/${conversationId}/messages`);

// ─── AUTH ─────────────────────────────────────────────
async function resolveUserName(emailOrPhone: string): Promise<string> {
  const res = await fetch(`${API_URL}account/resolve-user-name?emailOrPhone=${emailOrPhone}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export async function login(emailOrPhone: string, password: string) {
  const username = await resolveUserName(emailOrPhone);
  const body = new URLSearchParams({
    username,
    password,
    grant_type: 'password',
    client_id: 'VietlifeStore_App',
    client_secret: '1q2w3e*',
    scope: 'VietlifeStore offline_access',
  });
  const res = await fetch(`${BASE_URL}connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const register = (data: any) =>
  apiFetch(`${API_URL}account/register`, { method: 'POST', body: JSON.stringify(data) });

export const getProfile = () =>
  apiFetch<any>(`${API_URL}account/profile`);

export const updateProfile = (data: any) =>
  apiFetch(`${API_URL}account/update-profile`, { method: 'POST', body: JSON.stringify(data) });

export const changePassword = (data: any) =>
  apiFetch(`${API_URL}account/change-password`, { method: 'POST', body: JSON.stringify(data) });

export const forgotPassword = (email: string) =>
  apiFetch(`${API_URL}account/forgot-password?email=${email}`, { method: 'POST' });

export const resetPassword = (data: { userId: string; token: string; newPassword: string }) =>
  apiFetch(
    `${API_URL}account/reset-password/${data.userId}?token=${encodeURIComponent(data.token)}&newPassword=${encodeURIComponent(data.newPassword)}`,
    { method: 'POST' }
  );

export async function refreshToken(refreshTokenStr: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: 'VietlifeStore_App',
    client_secret: '1q2w3e*',
    refresh_token: refreshTokenStr,
  });
  const res = await fetch(`${BASE_URL}connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const getOrderByUserId = (skip: number, take: number, status?: number) => {
  let url = `${API_URL}don-hangs/my-orders-paged?skipCount=${skip}&maxResultCount=${take}`;
  if (status !== null && status !== undefined) url += `&trangThai=${status}`;
  return apiFetch<{ items: any[]; totalCount: number }>(url);
};