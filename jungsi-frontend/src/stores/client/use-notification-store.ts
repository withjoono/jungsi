/**
 * 알림 Zustand Store
 * 
 * 플래너 알림 관리 (미션 알림, 멘토 피드백 알림 등)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================
// 타입 정의
// ============================================

export type NotificationType = 
  | 'mission_reminder'    // 미션 시작 알림
  | 'mission_deadline'    // 미션 마감 임박
  | 'mentor_feedback'     // 멘토 피드백 도착
  | 'achievement'         // 성취 달성
  | 'notice'              // 공지사항
  | 'system';             // 시스템 알림

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: {
    itemId?: number;
    missionTitle?: string;
    mentorName?: string;
    link?: string;
  };
}

interface NotificationSettings {
  missionReminder: boolean;      // 미션 시작 10분 전 알림
  missionDeadline: boolean;      // 미션 마감 30분 전 알림
  mentorFeedback: boolean;       // 멘토 피드백 알림
  achievement: boolean;          // 성취 달성 알림
  notice: boolean;               // 공지사항 알림
  sound: boolean;                // 알림음
  vibrate: boolean;              // 진동
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isNotificationPanelOpen: boolean;
}

interface NotificationActions {
  // 알림 관리
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  
  // 패널 제어
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  toggleNotificationPanel: () => void;
  
  // 설정
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // 유틸리티
  getUnreadByType: (type: NotificationType) => Notification[];
}

type NotificationStore = NotificationState & NotificationActions;

// ============================================
// 초기 상태
// ============================================

const initialSettings: NotificationSettings = {
  missionReminder: true,
  missionDeadline: true,
  mentorFeedback: true,
  achievement: true,
  notice: true,
  sound: true,
  vibrate: true,
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: initialSettings,
  isNotificationPanelOpen: false,
};

// ============================================
// Store 생성
// ============================================

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─────────────────────────────────────────
      // 알림 관리
      // ─────────────────────────────────────────

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // 최대 100개
          unreadCount: state.unreadCount + 1,
        }));

        // 알림음/진동
        const { settings } = get();
        if (settings.sound) {
          playNotificationSound();
        }
        if (settings.vibrate && navigator.vibrate) {
          navigator.vibrate(200);
        }

        // 브라우저 알림 (권한이 있을 경우)
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icon-192.png',
            tag: newNotification.id,
          });
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.read) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      // ─────────────────────────────────────────
      // 패널 제어
      // ─────────────────────────────────────────

      openNotificationPanel: () => set({ isNotificationPanelOpen: true }),
      closeNotificationPanel: () => set({ isNotificationPanelOpen: false }),
      toggleNotificationPanel: () => set((state) => ({ 
        isNotificationPanelOpen: !state.isNotificationPanelOpen 
      })),

      // ─────────────────────────────────────────
      // 설정
      // ─────────────────────────────────────────

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // ─────────────────────────────────────────
      // 유틸리티
      // ─────────────────────────────────────────

      getUnreadByType: (type) => {
        return get().notifications.filter((n) => n.type === type && !n.read);
      },
    }),
    {
      name: 'planner-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // 최근 50개만 저장
        settings: state.settings,
      }),
    }
  )
);

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 알림음 재생
 */
function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // 자동 재생이 차단된 경우 무시
    });
  } catch {
    // 오디오 재생 실패 무시
  }
}

/**
 * 브라우저 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * 알림 타입별 아이콘 및 색상
 */
export const NOTIFICATION_CONFIG: Record<NotificationType, { 
  icon: string; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  mission_reminder: { 
    icon: '⏰', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    label: '미션 알림'
  },
  mission_deadline: { 
    icon: '⚠️', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100',
    label: '마감 임박'
  },
  mentor_feedback: { 
    icon: '💬', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    label: '멘토 피드백'
  },
  achievement: { 
    icon: '🎉', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    label: '성취 달성'
  },
  notice: { 
    icon: '📢', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    label: '공지사항'
  },
  system: { 
    icon: '🔔', 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    label: '시스템'
  },
};

// ============================================
// 편의 훅
// ============================================

/**
 * 읽지 않은 알림 개수
 */
export const useUnreadCount = () => {
  return useNotificationStore((state) => state.unreadCount);
};

/**
 * 알림 설정
 */
export const useNotificationSettings = () => {
  const settings = useNotificationStore((state) => state.settings);
  const updateSettings = useNotificationStore((state) => state.updateSettings);
  return { settings, updateSettings };
};




