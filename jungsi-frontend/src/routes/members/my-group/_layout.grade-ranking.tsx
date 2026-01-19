import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/members/my-group/_layout/grade-ranking')(
  {
    component: GradeRankingPage,
  },
)

function GradeRankingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-700">비공개 페이지</h2>
      <p className="text-gray-500 text-center max-w-md">
        이 페이지는 원하는 학생들끼리만 공개합니다.
      </p>
    </div>
  )
}
