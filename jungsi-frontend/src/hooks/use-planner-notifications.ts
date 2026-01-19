/**
 * 플래너 알림 스케줄러 훅
 * 
 * 미션 알림, 멘토 피드백 알림 등을 자동으로 스케줄링합니다.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useGetPlannerItems, useGetNotices } from '@/stores/server/features/planner'
import { 
  useNotificationStore, 
  requestNotificationPermission,
} from '@/stores/client/use-notification-store'

// ============================================
// 상수
// ============================================

const REMINDER_BEFORE_MINUTES = 10  // 시작 10분 전
const DEADLINE_BEFORE_MINUTES = 30 // 마감 30분 전
const CHECK_INTERVAL = 60 * 1000   // 1분마다 체크

// ============================================
// 훅 구현
// ============================================

export function usePlannerNotifications() {
  const { data: items } = useGetPlannerItems()
  const { data: notices } = useGetNotices()
  
  const { settings, addNotification } = useNotificationStore()
  
  // 이미 알림을 보낸 항목 추적
  const notifiedReminders = useRef<Set<string>>(new Set())
  const notifiedDeadlines = useRef<Set<string>>(new Set())
  const notifiedNotices = useRef<Set<number>>(new Set())

  // 알림 권한 요청
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // 미션 알림 체크
  const checkMissionNotifications = useCallback(() => {
    if (!items) return

    const now = new Date()
    const nowTime = now.getTime()

    items.forEach((item) => {
      const startTime = new Date(item.startDate).getTime()
      const endTime = new Date(item.endDate).getTime()
      
      // 이미 완료된 미션은 스킵
      if (item.progress >= 100) return

      // 시작 알림 (10분 전)
      if (settings.missionReminder) {
        const reminderTime = startTime - REMINDER_BEFORE_MINUTES * 60 * 1000
        const reminderKey = `reminder-${item.id}`
        
        if (
          nowTime >= reminderTime &&
          nowTime < startTime &&
          !notifiedReminders.current.has(reminderKey)
        ) {
          addNotification({
            type: 'mission_reminder',
            title: '미션 시작 알림',
            message: `"${item.title}"이(가) ${REMINDER_BEFORE_MINUTES}분 후에 시작됩니다.`,
            data: {
              itemId: item.id,
              missionTitle: item.title,
              link: '/planner/today',
            },
          })
          notifiedReminders.current.add(reminderKey)
        }
      }

      // 마감 알림 (30분 전)
      if (settings.missionDeadline) {
        const deadlineTime = endTime - DEADLINE_BEFORE_MINUTES * 60 * 1000
        const deadlineKey = `deadline-${item.id}`
        
        if (
          nowTime >= deadlineTime &&
          nowTime < endTime &&
          !notifiedDeadlines.current.has(deadlineKey)
        ) {
          addNotification({
            type: 'mission_deadline',
            title: '미션 마감 임박',
            message: `"${item.title}"의 마감이 ${DEADLINE_BEFORE_MINUTES}분 남았습니다.`,
            data: {
              itemId: item.id,
              missionTitle: item.title,
              link: '/planner/today',
            },
          })
          notifiedDeadlines.current.add(deadlineKey)
        }
      }
    })
  }, [items, settings.missionReminder, settings.missionDeadline, addNotification])

  // 공지사항 알림 체크
  const checkNoticeNotifications = useCallback(() => {
    if (!notices || !settings.notice) return

    notices.forEach((notice) => {
      if (notice.isImportant && !notifiedNotices.current.has(notice.id)) {
        addNotification({
          type: 'notice',
          title: '새 공지사항',
          message: notice.title,
          data: {
            link: '/planner',
          },
        })
        notifiedNotices.current.add(notice.id)
      }
    })
  }, [notices, settings.notice, addNotification])

  // 멘토 피드백 알림 체크
  const checkFeedbackNotifications = useCallback(() => {
    if (!items || !settings.mentorFeedback) return

    items.forEach((item) => {
      // 새로운 멘토 피드백이 있고 아직 읽지 않은 경우
      if (item.mentorRank && item.mentorDesc) {
        const feedbackKey = `feedback-${item.id}-${item.mentorRank}`
        if (!notifiedReminders.current.has(feedbackKey)) {
          addNotification({
            type: 'mentor_feedback',
            title: '멘토 피드백 도착',
            message: `"${item.title}"에 대한 멘토 피드백이 도착했습니다.`,
            data: {
              itemId: item.id,
              missionTitle: item.title,
              link: '/planner/today',
            },
          })
          notifiedReminders.current.add(feedbackKey)
        }
      }
    })
  }, [items, settings.mentorFeedback, addNotification])

  // 주기적 체크
  useEffect(() => {
    // 초기 체크
    checkMissionNotifications()
    checkNoticeNotifications()
    checkFeedbackNotifications()

    // 1분마다 체크
    const interval = setInterval(() => {
      checkMissionNotifications()
    }, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [checkMissionNotifications, checkNoticeNotifications, checkFeedbackNotifications])

  // 아이템 변경 시 피드백 체크
  useEffect(() => {
    checkFeedbackNotifications()
  }, [items, checkFeedbackNotifications])

  // 공지사항 변경 시 체크
  useEffect(() => {
    checkNoticeNotifications()
  }, [notices, checkNoticeNotifications])
}

// ============================================
// 성취 알림 유틸리티
// ============================================

/**
 * 성취 알림 발송 (미션 완료 시 호출)
 */
export function useAchievementNotification() {
  const { settings, addNotification } = useNotificationStore()

  const notifyAchievement = useCallback((title: string, message: string) => {
    if (!settings.achievement) return

    addNotification({
      type: 'achievement',
      title,
      message,
    })
  }, [settings.achievement, addNotification])

  return {
    notifyMissionComplete: (missionTitle: string) => {
      notifyAchievement(
        '미션 완료! 🎉',
        `"${missionTitle}"을(를) 완료했습니다!`
      )
    },
    notifyDailyComplete: () => {
      notifyAchievement(
        '오늘 미션 올클리어! 🏆',
        '오늘의 모든 미션을 완료했습니다!'
      )
    },
    notifyWeeklyGoal: (percentage: number) => {
      notifyAchievement(
        '주간 목표 달성! 🌟',
        `이번 주 학습 목표의 ${percentage}%를 달성했습니다!`
      )
    },
    notifyStreak: (days: number) => {
      notifyAchievement(
        '연속 달성! 🔥',
        `${days}일 연속으로 미션을 완료했습니다!`
      )
    },
  }
}

export default usePlannerNotifications




