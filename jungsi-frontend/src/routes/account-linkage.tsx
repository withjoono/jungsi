import { createFileRoute } from '@tanstack/react-router'
import { LinkagePage } from '@/components/services/mentoring/index'

// 학년 코드 맵
const GRADE_CODE_MAP: Record<string, string> = {
  '10': '고1',
  '20': '고2',
  '30': '고3',
}

export const Route = createFileRoute('/account-linkage')({
  component: AccountLinkagePage,
})

function AccountLinkagePage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">계정연동</h1>
        <p className="mt-2 text-gray-600">멘토-멘티 계정을 연동하세요.</p>
      </div>

      <LinkagePage gradeCodeMap={GRADE_CODE_MAP} />
    </div>
  )
}
