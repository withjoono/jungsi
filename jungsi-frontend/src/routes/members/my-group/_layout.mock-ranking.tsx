import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/members/my-group/_layout/mock-ranking')({
  component: MockRankingPage,
})

function MockRankingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-600 text-lg">이 페이지는 원하는 학생들끼리만 공개합니다</p>
    </div>
  )
}
