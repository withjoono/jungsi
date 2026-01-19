import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useGetCurrentUser } from '@/stores/server/features/me/queries'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/mentor/')({
  component: MentorPage,
})

/**
 * 선생님 페이지 - Teacher Admin 대시보드로 리다이렉트
 * 
 * 선생님 전용 관리 기능은 별도의 Teacher Admin 애플리케이션에서 제공됩니다.
 * 이 페이지는 선생님 로그인 시 자동으로 Teacher Admin으로 리다이렉트합니다.
 */
function MentorPage() {
  const { data: currentUser, isLoading } = useGetCurrentUser()

  useEffect(() => {
    if (!isLoading && currentUser?.memberType === 'teacher') {
      // Teacher Admin 대시보드로 리다이렉트
      // 개발 환경: http://localhost:3001
      // 프로덕션 환경: 실제 Teacher Admin URL로 변경 필요
      const teacherAdminUrl = import.meta.env.DEV 
        ? 'http://localhost:3001' 
        : 'https://teacher.geobukschool.com' // TODO: 실제 프로덕션 URL로 변경
      
      window.location.href = teacherAdminUrl
    }
  }, [currentUser, isLoading])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">선생님 페이지로 이동 중...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
        <div className="py-20 text-center text-gray-500">
          로그인이 필요합니다.
        </div>
      </div>
    )
  }

  // 선생님이 아닌 경우 안내 메시지
  if (currentUser.memberType !== 'teacher') {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
        <div className="py-20 text-center text-gray-500">
          선생님 전용 페이지입니다.
        </div>
      </div>
    )
  }

  // 리다이렉트 중 표시
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">선생님 페이지로 이동 중...</span>
      </div>
    </div>
  )
}
