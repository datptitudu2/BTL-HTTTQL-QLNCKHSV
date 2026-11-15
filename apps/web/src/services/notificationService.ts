import api from './api';

export interface AppNotification {
  id: number;
  userId?: number;
  title: string;
  content: string;
  time: string;
  urgent: boolean;
  type: 'DEADLINE' | 'SEMINAR' | 'ACCEPTANCE' | 'BONUS' | 'GENERAL';
  targetUrl: string;
  isRead: boolean;
  channel: string;
}

const STORAGE_KEY = 'srms_notifications_db_v2';

function getCacheKey(roleCode: string, userId?: number): string {
  return userId ? `user_${userId}` : `role_${roleCode}`;
}

function getStoredNotifications(): Record<string, AppNotification[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return {};
  } catch (e) {
    return {};
  }
}

function saveStoredNotifications(data: Record<string, AppNotification[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Lỗi khi lưu thông báo:', e);
  }
}

export const notificationService = {
  // Lấy danh sách thông báo theo đúng tài khoản đang đăng nhập
  async getNotifications(roleCode: string, userId?: number): Promise<AppNotification[]> {
    const cacheKey = getCacheKey(roleCode, userId);
    const allStored = getStoredNotifications();

    try {
      const res = await api.get('/notifications');
      if (res.data && Array.isArray(res.data)) {
        allStored[cacheKey] = res.data;
        saveStoredNotifications(allStored);
        return res.data;
      }
    } catch (e) {
      // Backend offline: chỉ trả về cache của đúng tài khoản hiện tại nếu có
      return allStored[cacheKey] || [];
    }

    return [];
  },

  // Đánh dấu 1 thông báo đã đọc
  async markAsRead(id: number, roleCode: string, userId?: number): Promise<void> {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (e) {
      // Offline fallback
    }

    const cacheKey = getCacheKey(roleCode, userId);
    const allStored = getStoredNotifications();
    const list = allStored[cacheKey] || [];
    allStored[cacheKey] = list.map((item) => (item.id === id ? { ...item, isRead: true } : item));
    saveStoredNotifications(allStored);
  },

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(roleCode: string, userId?: number): Promise<void> {
    try {
      await api.post('/notifications/read-all', { role: roleCode });
    } catch (e) {
      // Offline fallback
    }

    const cacheKey = getCacheKey(roleCode, userId);
    const allStored = getStoredNotifications();
    const list = allStored[cacheKey] || [];
    allStored[cacheKey] = list.map((item) => ({ ...item, isRead: true }));
    saveStoredNotifications(allStored);
  },

  // Tạo thông báo nhắc việc cho chính tài khoản đang đăng nhập (từ Lịch & Sự kiện)
  async createSelfReminder(dto: {
    scheduleRef?: string;
    title: string;
    content: string;
    type?: AppNotification['type'];
    urgent?: boolean;
    targetUrl?: string;
  }): Promise<void> {
    await api.post('/notifications', {
      scheduleRef: dto.scheduleRef || '',
      title: dto.title,
      content: dto.content,
      channel: 'IN_APP',
      type: dto.type || 'GENERAL',
      urgent: dto.urgent ?? true,
      targetUrl: dto.targetUrl || '/calendar',
    });
    window.dispatchEvent(new CustomEvent('srms:notifications-refresh'));
  },
};
