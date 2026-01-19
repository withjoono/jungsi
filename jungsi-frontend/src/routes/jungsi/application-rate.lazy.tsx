import { createLazyFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Bell,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useApplicationRates,
  useRecentChanges,
  useTriggerCrawl,
} from '@/hooks/useApplicationRate';
import type { ApplicationRateItem, ApplicationRateChange } from '@/lib/api/application-rate';

export const Route = createLazyFileRoute('/jungsi/application-rate')({
  component: ApplicationRatePage,
});

function ApplicationRatePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showChanges, setShowChanges] = useState(true);
  const [sortField, setSortField] = useState<'competitionRate' | 'applicationCount' | 'departmentName'>('competitionRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 데이터 조회 (5분마다 자동 갱신)
  const { data: ratesData, isLoading, error, dataUpdatedAt } = useApplicationRates();
  const { data: changesData } = useRecentChanges(undefined, 20);
  const triggerCrawlMutation = useTriggerCrawl();

  // 필터링 및 정렬된 데이터
  const filteredItems = useMemo(() => {
    if (!ratesData || ratesData.length === 0) return [];

    const allItems: (ApplicationRateItem & { universityCode: string })[] = [];
    ratesData.forEach((univ) => {
      univ.items.forEach((item) => {
        allItems.push({ ...item, universityCode: univ.universityCode });
      });
    });

    return allItems
      .filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.universityName.toLowerCase().includes(term) ||
          item.departmentName.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        if (sortField === 'competitionRate') {
          return (a.competitionRate - b.competitionRate) * multiplier;
        }
        if (sortField === 'applicationCount') {
          return (a.applicationCount - b.applicationCount) * multiplier;
        }
        return a.departmentName.localeCompare(b.departmentName) * multiplier;
      });
  }, [ratesData, searchTerm, sortField, sortOrder]);

  // 요약 정보
  const summary = useMemo(() => {
    if (!ratesData || ratesData.length === 0) return null;
    const first = ratesData[0];
    return {
      ...first.summary,
      universityName: first.universityName,
    };
  }, [ratesData]);

  // 마지막 업데이트 시간 포맷
  const lastUpdated = useMemo(() => {
    if (!dataUpdatedAt) return null;
    return new Date(dataUpdatedAt).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [dataUpdatedAt]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRefresh = () => {
    triggerCrawlMutation.mutate();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold text-red-800">데이터를 불러오는데 실패했습니다</h2>
            <p className="mt-2 text-red-600">잠시 후 다시 시도해주세요.</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">실시간 경쟁률</h1>
              <p className="mt-1 text-sm text-gray-500">
                5분마다 자동 갱신됩니다 {lastUpdated && `• 마지막 업데이트: ${lastUpdated}`}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={triggerCrawlMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', triggerCrawlMutation.isPending && 'animate-spin')} />
              {triggerCrawlMutation.isPending ? '갱신 중...' : '즉시 갱신'}
            </Button>
          </div>

          {/* 요약 카드 */}
          {summary && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">대학명</span>
                </div>
                <p className="mt-2 text-xl font-bold text-blue-900">{summary.universityName}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">총 모집인원</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-green-900">
                  {summary.totalRecruitment.toLocaleString()}명
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">총 지원인원</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-purple-900">
                  {summary.totalApplication.toLocaleString()}명
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">전체 경쟁률</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-orange-900">{summary.overallRate}:1</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 메인 테이블 */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow">
              {/* 검색 및 필터 */}
              <div className="border-b p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="학과명 또는 대학명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">대학</th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-gray-500 hover:text-gray-700"
                        onClick={() => handleSort('departmentName')}
                      >
                        <div className="flex items-center gap-1">
                          모집단위
                          {sortField === 'departmentName' &&
                            (sortOrder === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">모집</th>
                      <th
                        className="cursor-pointer px-4 py-3 text-right text-sm font-medium text-gray-500 hover:text-gray-700"
                        onClick={() => handleSort('applicationCount')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          지원
                          {sortField === 'applicationCount' &&
                            (sortOrder === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-right text-sm font-medium text-gray-500 hover:text-gray-700"
                        onClick={() => handleSort('competitionRate')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          경쟁률
                          {sortField === 'competitionRate' &&
                            (sortOrder === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                          <p className="mt-2">데이터를 불러오는 중...</p>
                        </td>
                      </tr>
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, index) => (
                        <tr key={`${item.departmentName}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.universityName}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{item.departmentName}</div>
                            {item.admissionType && (
                              <div className="text-xs text-gray-500">{item.admissionType}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">
                            {item.recruitmentCount}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            {item.applicationCount}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold',
                                item.competitionRate >= 10
                                  ? 'bg-red-100 text-red-800'
                                  : item.competitionRate >= 5
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800',
                              )}
                            >
                              {item.competitionRate}:1
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 테이블 푸터 */}
              <div className="border-t bg-gray-50 px-4 py-3 text-sm text-gray-500">
                총 {filteredItems.length}개 모집단위
              </div>
            </div>
          </div>

          {/* 사이드바 - 변동 알림 */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white shadow">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <h2 className="font-semibold text-gray-900">실시간 변동</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChanges(!showChanges)}
                >
                  {showChanges ? '접기' : '펼치기'}
                </Button>
              </div>

              {showChanges && (
                <div className="max-h-[600px] divide-y overflow-y-auto">
                  {!changesData || changesData.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
                      <p className="mt-2">아직 변동 내역이 없습니다.</p>
                    </div>
                  ) : (
                    changesData.map((change, index) => (
                      <ChangeItem key={`${change.departmentName}-${index}`} change={change} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangeItem({ change }: { change: ApplicationRateChange }) {
  const isIncrease = change.changeAmount > 0;
  const timeAgo = getTimeAgo(change.recordedAt);

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{change.departmentName}</p>
          <p className="text-xs text-gray-500">{change.universityName}</p>
        </div>
        <div className="flex items-center gap-1">
          {isIncrease ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-blue-500" />
          )}
          <span
            className={cn('text-sm font-semibold', isIncrease ? 'text-red-600' : 'text-blue-600')}
          >
            {isIncrease ? '+' : ''}
            {change.changeAmount}명
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          {change.previousRate}:1 → {change.currentRate}:1
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}
