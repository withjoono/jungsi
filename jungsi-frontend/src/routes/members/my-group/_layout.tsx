import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { USER_API } from '@/stores/server/features/me/apis'

const menuItems = [
  { title: 'Home', href: '/members/my-group' },
  { title: '학습랭킹', href: '/members/my-group/study-ranking' },
  { title: '퀴즈 랭킹', href: '/members/my-group/quiz-ranking' },
  { title: '내신 랭킹', href: '/members/my-group/grade-ranking' },
  { title: '모의고사 랭킹', href: '/members/my-group/mock-ranking' },
]

export const Route = createFileRoute('/members/my-group/_layout')({
  component: MyClassLayout,
})

function MyClassLayout() {
  const location = useLocation()

  // 로그인 상태 확인
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          로그인이 필요합니다
        </h2>
        <p className="text-gray-600">
          Please login to use My Group.
        </p>
        <Link
          to="/auth/login"
          className="mt-4 inline-block px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          로그인하기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="p-4 sticky top-20">
          <h2 className="text-lg font-bold text-orange-600 mb-4">My Group</h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
