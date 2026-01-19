import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createLazyFileRoute("/mock-analysis/_layout/statistics")({
  component: StatisticsPage,
});

function StatisticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>홈</span>
          <span>{">"}</span>
          <span>모의고사</span>
          <span>{">"}</span>
          <span className="text-gray-900 font-medium">누적분석</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">누적분석</h1>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>누적 성적 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">모의고사 성적의 누적 분석 결과를 확인할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
