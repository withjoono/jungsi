import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bell,
  MessageSquare,
  Smartphone,
  Mail,
  Check,
  Clock,
  Flame,
  TrendingUp,
  AlertCircle,
  Volume2,
  Moon,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/jungsi/notifications")({
  component: NotificationsPage,
});

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
  connected: boolean;
  detail?: string;
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  channels: string[];
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-14 h-8 rounded-full transition-colors duration-200",
        enabled ? "bg-indigo-600" : "bg-gray-300"
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200",
          enabled ? "translate-x-7" : "translate-x-1"
        )}
      />
    </button>
  );
}

function NotificationsPage() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: "kakao",
      name: "카카오톡",
      icon: MessageSquare,
      description: "카카오톡 알림톡으로 받기",
      enabled: true,
      connected: true,
      detail: "010-1234-5678",
    },
    {
      id: "sms",
      name: "문자 (SMS)",
      icon: Smartphone,
      description: "문자 메시지로 받기",
      enabled: false,
      connected: true,
      detail: "010-1234-5678",
    },
    {
      id: "push",
      name: "푸시 알림",
      icon: Bell,
      description: "앱/웹 푸시 알림",
      enabled: true,
      connected: true,
    },
    {
      id: "email",
      name: "이메일",
      icon: Mail,
      description: "이메일로 받기",
      enabled: false,
      connected: true,
      detail: "student@example.com",
    },
  ]);

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      id: "competition_surge",
      name: "경쟁률 급등 알림",
      description: "지원 대학 경쟁률이 30% 이상 상승할 때",
      icon: Flame,
      enabled: true,
      channels: ["kakao", "push"],
    },
    {
      id: "probability_change",
      name: "합격 확률 변동",
      description: "합격 확률이 5% 이상 변동될 때",
      icon: TrendingUp,
      enabled: true,
      channels: ["push"],
    },
    {
      id: "safe_zone",
      name: "안전권 진입/이탈",
      description: "지원 대학이 안전권에 진입하거나 이탈할 때",
      icon: Check,
      enabled: true,
      channels: ["kakao", "push"],
    },
    {
      id: "deadline",
      name: "마감 임박 알림",
      description: "원서 접수 마감 24시간/1시간 전",
      icon: Clock,
      enabled: true,
      channels: ["kakao", "sms", "push"],
    },
    {
      id: "daily_summary",
      name: "일일 요약 리포트",
      description: "매일 오후 9시 지원 현황 요약",
      icon: AlertCircle,
      enabled: false,
      channels: ["email"],
    },
  ]);

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    start: "23:00",
    end: "07:00",
  });

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const toggleNotificationType = (id: string) => {
    setNotificationTypes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const enabledChannelsCount = channels.filter((c) => c.enabled).length;
  const enabledTypesCount = notificationTypes.filter((n) => n.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 예시 안내 배너 */}
      <div className="bg-orange-500 text-white py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-sm md:text-base">
            ⚠️ 아래는 예시입니다. 실제 서비스는 12월 29일 오픈 예정입니다.
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-black">알림 설정</h1>
          <p className="text-orange-100 text-sm mt-1">
            중요한 변동 사항을 놓치지 않도록 알림을 설정하세요
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">현재 알림 상태</p>
              <p className="text-lg font-bold text-gray-900">
                {enabledChannelsCount}개 채널, {enabledTypesCount}개 알림 활성화
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">알림 수신 채널</h2>
            <p className="text-gray-500 text-sm">알림을 받을 방법을 선택하세요</p>
          </div>
          <div className="divide-y divide-gray-100">
            {channels.map((channel) => (
              <div key={channel.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      channel.enabled ? "bg-indigo-100" : "bg-gray-100"
                    )}>
                      <channel.icon className={cn(
                        "w-6 h-6",
                        channel.enabled ? "text-indigo-600" : "text-gray-400"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{channel.name}</p>
                        {channel.connected && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            연결됨
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">{channel.description}</p>
                      {channel.detail && (
                        <p className="text-gray-400 text-xs mt-1">{channel.detail}</p>
                      )}
                    </div>
                  </div>
                  <Toggle
                    enabled={channel.enabled}
                    onChange={() => toggleChannel(channel.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">알림 종류</h2>
            <p className="text-gray-500 text-sm">어떤 상황에서 알림을 받을지 설정하세요</p>
          </div>
          <div className="divide-y divide-gray-100">
            {notificationTypes.map((type) => (
              <div key={type.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      type.enabled ? "bg-orange-100" : "bg-gray-100"
                    )}>
                      <type.icon className={cn(
                        "w-5 h-5",
                        type.enabled ? "text-orange-500" : "text-gray-400"
                      )} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{type.name}</p>
                      <p className="text-gray-500 text-sm">{type.description}</p>
                      {type.enabled && (
                        <div className="flex gap-1 mt-2">
                          {type.channels.map((channelId) => {
                            const channel = channels.find((c) => c.id === channelId);
                            if (!channel) return null;
                            return (
                              <span
                                key={channelId}
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  channel.enabled
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-gray-100 text-gray-500 line-through"
                                )}
                              >
                                {channel.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <Toggle
                    enabled={type.enabled}
                    onChange={() => toggleNotificationType(type.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">방해 금지 시간</h2>
                <p className="text-gray-500 text-sm">설정된 시간에는 알림을 보내지 않습니다</p>
              </div>
              <Toggle
                enabled={quietHours.enabled}
                onChange={() => setQuietHours((prev) => ({ ...prev, enabled: !prev.enabled }))}
              />
            </div>
          </div>
          {quietHours.enabled && (
            <div className="p-4">
              <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-600" />
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={(e) => setQuietHours((prev) => ({ ...prev, start: e.target.value }))}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center font-mono"
                  />
                </div>
                <span className="text-gray-400">~</span>
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange-500" />
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={(e) => setQuietHours((prev) => ({ ...prev, end: e.target.value }))}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center font-mono"
                  />
                </div>
              </div>
              <p className="text-center text-gray-400 text-sm mt-3">
                이 시간에는 긴급 알림만 발송됩니다
              </p>
            </div>
          )}
        </div>

        {/* Test Notification */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">테스트 알림 보내기</p>
                <p className="text-gray-500 text-sm">설정이 잘 되었는지 확인해보세요</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              테스트
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl h-auto text-lg">
          설정 저장하기
        </Button>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/jungsi/dashboard" className="text-gray-500 text-sm hover:text-gray-700">
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
