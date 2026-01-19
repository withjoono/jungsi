import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

export const Route = createFileRoute('/members/my-group/_layout/quiz-ranking')({
  component: QuizRankingPage,
})

// 주간 퀴즈 랭킹 데이터 (예시)
const weeklyRankingData = [
  { rank: 1, name: '김민수', score: 98, quizCount: 5, avgScore: 96 },
  { rank: 2, name: '이지은', score: 95, quizCount: 5, avgScore: 94 },
  { rank: 3, name: '박준호', score: 92, quizCount: 5, avgScore: 91 },
  { rank: 4, name: '최유진', score: 90, quizCount: 4, avgScore: 89 },
  { rank: 5, name: '정하늘', score: 88, quizCount: 5, avgScore: 87 },
  { rank: 6, name: '강서연', score: 85, quizCount: 4, avgScore: 84 },
  { rank: 7, name: '윤도현', score: 82, quizCount: 5, avgScore: 81 },
  { rank: 8, name: '임수빈', score: 80, quizCount: 3, avgScore: 79 },
]

// 과목별 랭킹 데이터 (예시)
const subjectRankingData = {
  korean: [
    { rank: 1, name: '이지은', score: 95 },
    { rank: 2, name: '김민수', score: 92 },
    { rank: 3, name: '정하늘', score: 90 },
  ],
  english: [
    { rank: 1, name: '박준호', score: 98 },
    { rank: 2, name: '최유진', score: 94 },
    { rank: 3, name: '김민수', score: 91 },
  ],
  math: [
    { rank: 1, name: '김민수', score: 100 },
    { rank: 2, name: '강서연', score: 96 },
    { rank: 3, name: '윤도현', score: 93 },
  ],
  science: [
    { rank: 1, name: '최유진', score: 97 },
    { rank: 2, name: '이지은', score: 94 },
    { rank: 3, name: '박준호', score: 91 },
  ],
}

// 성적 추이 데이터 (예시)
const trendData = [
  { week: '1주차', korean: 75, english: 80, math: 70, science: 78 },
  { week: '2주차', korean: 78, english: 82, math: 75, science: 80 },
  { week: '3주차', korean: 82, english: 85, math: 80, science: 83 },
  { week: '4주차', korean: 85, english: 88, math: 85, science: 87 },
  { week: '5주차', korean: 88, english: 90, math: 88, science: 90 },
]

// 주간 평균 데이터
const weeklyAverageData = [
  { week: '1주차', average: 76 },
  { week: '2주차', average: 79 },
  { week: '3주차', average: 82 },
  { week: '4주차', average: 86 },
  { week: '5주차', average: 89 },
]

function QuizRankingPage() {
  const [activeTab, setActiveTab] = useState('weekly')

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900'
    if (rank === 2) return 'bg-gray-300 text-gray-800'
    if (rank === 3) return 'bg-amber-600 text-amber-100'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">퀴즈 랭킹</h1>
        <p className="mt-1 text-gray-600">
          주간 퀴즈 성적을 기반으로 한 랭킹입니다.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">주간 랭킹</TabsTrigger>
          <TabsTrigger value="subject">과목별 랭킹</TabsTrigger>
          <TabsTrigger value="trend">성적 추이</TabsTrigger>
        </TabsList>

        {/* 주간 랭킹 탭 */}
        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>이번 주 퀴즈 랭킹</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">순위</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead className="text-right">최고 점수</TableHead>
                    <TableHead className="text-right">응시 횟수</TableHead>
                    <TableHead className="text-right">평균 점수</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyRankingData.map((item) => (
                    <TableRow key={item.rank}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${getRankBadge(item.rank)}`}
                        >
                          {item.rank}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right font-semibold text-orange-600">
                        {item.score}점
                      </TableCell>
                      <TableCell className="text-right">{item.quizCount}회</TableCell>
                      <TableCell className="text-right">{item.avgScore}점</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>주간 평균 점수 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAverageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#f97316" name="평균 점수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 과목별 랭킹 탭 */}
        <TabsContent value="subject" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 국어 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">국어 퀴즈 랭킹</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">순위</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectRankingData.korean.map((item) => (
                      <TableRow key={item.rank}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${getRankBadge(item.rank)}`}
                          >
                            {item.rank}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.score}점
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 영어 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">영어 퀴즈 랭킹</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">순위</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectRankingData.english.map((item) => (
                      <TableRow key={item.rank}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${getRankBadge(item.rank)}`}
                          >
                            {item.rank}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.score}점
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 수학 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">수학 퀴즈 랭킹</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">순위</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectRankingData.math.map((item) => (
                      <TableRow key={item.rank}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${getRankBadge(item.rank)}`}
                          >
                            {item.rank}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.score}점
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 과학 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">과학 퀴즈 랭킹</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">순위</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectRankingData.science.map((item) => (
                      <TableRow key={item.rank}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${getRankBadge(item.rank)}`}
                          >
                            {item.rank}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.score}점
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 성적 추이 탭 */}
        <TabsContent value="trend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>과목별 성적 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="korean"
                      stroke="#ef4444"
                      name="국어"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="english"
                      stroke="#3b82f6"
                      name="영어"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="math"
                      stroke="#22c55e"
                      name="수학"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="science"
                      stroke="#a855f7"
                      name="과학"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">국어 최근 점수</p>
                  <p className="text-2xl font-bold text-red-500">88점</p>
                  <p className="text-xs text-green-600">+3점 상승</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">영어 최근 점수</p>
                  <p className="text-2xl font-bold text-blue-500">90점</p>
                  <p className="text-xs text-green-600">+2점 상승</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">수학 최근 점수</p>
                  <p className="text-2xl font-bold text-green-500">88점</p>
                  <p className="text-xs text-green-600">+3점 상승</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">과학 최근 점수</p>
                  <p className="text-2xl font-bold text-purple-500">90점</p>
                  <p className="text-xs text-green-600">+3점 상승</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
