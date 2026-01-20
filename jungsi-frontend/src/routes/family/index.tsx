import { createFileRoute } from '@tanstack/react-router'
import { Management } from '@/components/services/mentoring/index'
import {
  useGetLinkedChildren,
} from '@/stores/server/features/mentoring/queries'
import { useDeleteChild } from '@/stores/server/features/mentoring/mutations'
import { useGetCurrentUser } from '@/stores/server/features/me/queries'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/family/')({
  component: FamilyPage,
})

function FamilyPage() {
  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUser()

  // 학부모용 자녀 목록
  const {
    data: linkedChildren,
    isLoading: isChildrenLoading,
  } = useGetLinkedChildren()

  // Mutations
  const deleteChildMutation = useDeleteChild()

  // 로딩 상태
  const isLoading = isUserLoading || isChildrenLoading

  // 콜백 함수
  const handleDeleteChild = async (childId: number) => {
    await deleteChildMutation.mutateAsync(childId)
  }

  // 자녀 데이터를 Management 컴포넌트 형식으로 변환
  const children = (linkedChildren || []).map((child) => ({
    id: child.id,
    name: child.name || child.nickname,
    school: child.school,
    grade: child.grade,
  }))

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">로딩 중...</span>
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

  // 학부모가 아닌 경우 안내 메시지
  if (currentUser.memberType !== 'parent') {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
        <div className="py-20 text-center text-gray-500">
          학부모 전용 페이지입니다.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">자녀 관리</h1>
        <p className="mt-2 text-gray-600">
          연동된 자녀의 학습 현황을 확인하세요.
        </p>
      </div>

      <Management
        relationCode="20"
        students={[]}
        children={children}
        classes={[]}
        onDeleteChild={handleDeleteChild}
      />
    </div>
  )
}
