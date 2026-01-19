import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/api'

interface Mentor {
  id: number
  name: string
  imgpath: string
  univ: string
  department: string
  highschool: string
}

interface Notice {
  id: number
  title: string
  content: string
  createdAt: string
}

export const Route = createFileRoute('/members/my-group/_layout/')({
  component: MyClassHomePage,
})

function MyClassHomePage() {
  const { data: mentors } = useQuery<Mentor[]>({
    queryKey: ['myclass-mentors'],
    queryFn: async () => {
      try {
        const res = await authClient.get('/planner/planners')
        return res.data?.data || []
      } catch {
        return []
      }
    },
  })

  const { data: _notices } = useQuery<Notice[]>({
    queryKey: ['myclass-notices'],
    queryFn: async () => {
      try {
        const res = await authClient.get('/planner/notice')
        return res.data?.data || []
      } catch {
        return []
      }
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Group</h1>
        <p className="mt-1 text-gray-600">
          멘토와 함께하는 체계적인 학습 관리 서비스입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 멘토 정보 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">멘토</h2>
          {mentors && mentors.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div
                    className="w-24 h-24 rounded-full bg-gray-200 bg-cover bg-center mb-3"
                    style={{
                      backgroundImage: mentor.imgpath
                        ? `url(https://img.ingipsy.com/profile-img/${mentor.imgpath}.jpg)`
                        : undefined
                    }}
                  />
                  <p className="font-medium text-gray-900">{mentor.name || '멘토'}</p>
                  <p className="text-sm text-gray-500">{mentor.univ}</p>
                  <p className="text-sm text-gray-500">{mentor.department}</p>
                  <p className="text-xs text-gray-400">{mentor.highschool}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              배정된 멘토가 없습니다.
            </div>
          )}
        </div>

        {/* 운영 원칙 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">운영 원칙</h2>
          <p className="text-sm text-gray-600 mb-4">아래와 같은 상황일 때는 퇴소 조치합니다.</p>
          <div className="space-y-3">
            {[
              { num: 1, text: '플래너 미작성 3회' },
              { num: 2, text: '테스트 미시행 3회' },
              { num: 3, text: '지시사항 불응 3회' },
            ].map((rule) => (
              <div key={rule.num} className="flex items-center gap-3">
                <span className="w-10 h-10 bg-teal-500 text-white rounded-lg flex items-center justify-center font-bold">
                  {rule.num}
                </span>
                <span className="font-medium text-gray-900">{rule.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 멘토 공지사항 */}
      <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">멘토 공지사항</h2>
        <div className="space-y-6">
          <div className="border-l-4 border-orange-400 pl-4">
            <h3 className="font-bold text-gray-900 text-lg mb-2">플래너 작성은 아래 순서대로 진행</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="text-red-600 font-medium">1. 주간 일정 작성</p>
              <p className="ml-4">- 고정 일정 기록</p>
              <p className="ml-4">- 자기 공부 시간 파악 및 과목별 요일/시간 할당</p>
              <p className="text-red-600 font-medium mt-2">2. 장기 계획 수립</p>
              <p className="text-red-600 font-medium mt-2">3. 하루 계획 수립</p>
              <p className="ml-4">- 주간일정과 장기계획에 의해 할당된 하루 학습량을 참고로 구체적 시간 계획</p>
              <p className="text-red-600 font-medium mt-2">4. 일요일은 가급적 일정 무</p>
              <p className="ml-4">- 성취하지 못한 학습 계획을 일요일에 채울 수 있도록 일요일 일정은 비울 것을 권합니다.</p>
            </div>
          </div>

          <div className="border-l-4 border-orange-400 pl-4">
            <h3 className="font-bold text-gray-900 text-lg mb-2">테스트는 최소 주1회</h3>
            <p className="text-sm text-gray-600">
              시행하며 테스트 공지사항에 구체적인 과목, 내용, URL을 기재해두면 학생은 기간 안에 온라인으로 테스트를 시행해야 합니다.
            </p>
            <p className="text-sm text-red-600 mt-2">- 성적은 테스트 페이지에 등수 및 점수 공개</p>
          </div>

          <div className="border-l-4 border-orange-400 pl-4">
            <h3 className="font-bold text-gray-900 text-lg mb-2">상담은 학부모, 학생 상담 각각 최소 월 1회</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
