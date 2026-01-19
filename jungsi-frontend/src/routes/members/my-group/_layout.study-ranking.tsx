import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/api'

interface RankItem {
  rrank: number
  user_name: string
  totalscore: number
  acdmcscore: number
}

interface ClassInfo {
  clsnm: string
}

type PeriodType = 'D' | 'W' | 'M'

export const Route = createFileRoute('/members/my-group/_layout/study-ranking')({
  component: MyClassPlannerPage,
})

function MyClassPlannerPage() {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('D')

  // 반 정보 조회
  const { data: classInfo } = useQuery<ClassInfo[]>({
    queryKey: ['myclass-class-info'],
    queryFn: async () => {
      try {
        const res = await authClient.get('/planner/planners')
        return res.data?.data || []
      } catch {
        return []
      }
    },
  })

  // 일간 데이터
  const { data: dailyData } = useQuery<RankItem[]>({
    queryKey: ['myclass-planner-rank', 'D'],
    queryFn: async () => {
      try {
        const res = await authClient.get('/planner/rank?str_dwm=D')
        return res.data?.data || []
      } catch {
        return []
      }
    },
  })

  // 주간 데이터
  const { data: weeklyData } = useQuery<RankItem[]>({
    queryKey: ['myclass-planner-rank', 'W'],
    queryFn: async () => {
      try {
        const res = await authClient.get('/planner/rank?str_dwm=W')
        return res.data?.data || []
      } catch {
        return []
      }
    },
  })

  // 월간 데이터
  const { data: monthlyData } = useQuery<RankItem[]>({
    queryKey: ['myclass-planner-rank', 'M'],
    queryFn: async () => {
      try {
        const res = await authClient.get('/planner/rank?str_dwm=M')
        return res.data?.data || []
      } catch {
        return []
      }
    },
  })

  const getActiveData = () => {
    switch (activePeriod) {
      case 'D': return dailyData || []
      case 'W': return weeklyData || []
      case 'M': return monthlyData || []
      default: return []
    }
  }

  const getMaxScore = () => {
    switch (activePeriod) {
      case 'D': return 5
      case 'W': return 35
      case 'M': return 150
      default: return 100
    }
  }

  const getPeriodLabel = () => {
    switch (activePeriod) {
      case 'D': return '일간'
      case 'W': return '주간'
      case 'M': return '월간'
      default: return ''
    }
  }

  const activeData = getActiveData()
  const maxScore = getMaxScore()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">플래너 검사</h1>
        <p className="mt-1 text-gray-600">
          일간/주간/월간 학업성취도를 확인합니다.
        </p>
      </div>

      {/* 반 정보 */}
      {classInfo && classInfo.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {classInfo[0]?.clsnm}
          </h2>
        </div>
      )}

      {/* 기간 선택 탭 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'D' as PeriodType, label: '일간' },
          { key: 'W' as PeriodType, label: '주간' },
          { key: 'M' as PeriodType, label: '월간' },
        ].map((period) => (
          <button
            key={period.key}
            onClick={() => setActivePeriod(period.key)}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activePeriod === period.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period.label} 학업성취도
          </button>
        ))}
      </div>

      {/* 차트 및 순위 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 대체 (간단한 바 형태) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {getPeriodLabel()} 학업성취도
          </h3>
          <div className="space-y-3">
            {activeData.length > 0 ? (
              activeData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-600 truncate">{item.user_name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min((Number(item.totalscore) / maxScore) * 100, 100)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{item.totalscore}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 순위 테이블 */}
        <div className="bg-orange-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">{getPeriodLabel()} 순위</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-orange-400 text-sm font-medium">
              <span>순위</span>
              <span>학생</span>
              <span>성취도</span>
            </div>
            {activeData.length > 0 ? (
              activeData.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 py-3 border-b border-orange-400/50 text-sm"
                >
                  <span className="font-bold">{item.rrank}</span>
                  <span>{item.user_name}</span>
                  <span>{item.acdmcscore}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-orange-200">
                순위 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모든 기간 한눈에 보기 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'D', label: '일간', data: dailyData, max: 5 },
          { key: 'W', label: '주간', data: weeklyData, max: 35 },
          { key: 'M', label: '월간', data: monthlyData, max: 150 },
        ].map((period) => (
          <div key={period.key} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <h4 className="font-bold text-gray-900 mb-3">{period.label} 학업성취도</h4>
            <div className="space-y-2">
              {period.data && period.data.length > 0 ? (
                period.data.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-16 text-xs text-gray-600 truncate">{item.user_name}</span>
                    <div className="flex-1 bg-gray-200 rounded h-4 overflow-hidden">
                      <div
                        className="bg-blue-400 h-full"
                        style={{ width: `${Math.min((Number(item.totalscore) / period.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
                  데이터 없음
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
