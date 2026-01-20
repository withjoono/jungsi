import { createFileRoute } from '@tanstack/react-router'
import { StudentDetail } from '@/components/services/mentoring/index'

interface SearchParams {
  name?: string
  school?: string
}

export const Route = createFileRoute('/family/$id')({
  component: ChildDetailPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      name: search.name as string | undefined,
      school: search.school as string | undefined,
    }
  },
})

function ChildDetailPage() {
  const { id } = Route.useParams()
  const { name = '', school = '' } = Route.useSearch()

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">자녀 학습 현황</h1>
        <p className="mt-2 text-gray-600">자녀의 학습 현황을 확인하세요.</p>
      </div>

      <StudentDetail
        id={id}
        name={name}
        school={school}
      />
    </div>
  )
}
