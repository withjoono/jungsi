import { IconChevronDown } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button, buttonVariants } from "./custom/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/client/use-auth-store";
import { useQuery } from "@tanstack/react-query";
import { USER_API } from "@/stores/server/features/me/apis";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu, Bell, Users } from "lucide-react";
import { WonCircle } from "./icons";
import { clearTokens as clearTokenManager } from "@/lib/api/token-manager";
import { useTokenStore } from "@/stores/atoms/tokens";

export const Header = () => {
  const queryClient = useQueryClient();
  const _navigate = useNavigate();

  const isLoginPage = window.location.pathname === "/auth/login";
  const isTestPage = window.location.pathname === "/test/auth-me";
  const isRegisterPage = window.location.pathname === "/auth/register";
  const isResetPasswordPage = window.location.pathname === "/auth/reset-password";
  const isAuthPage = isLoginPage || isTestPage || isRegisterPage || isResetPasswordPage;

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    enabled: !isAuthPage,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // user 데이터에서 직접 officer 여부 확인 (추가 API 호출 방지)
  const isOfficer = user?.role === "officer";

  const { clearTokens } = useAuthStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleLogoutClick = (e?: React.MouseEvent) => {
    // 이벤트 전파 중지 (Dialog 내부에서 호출 시)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('🚪 로그아웃 시작...');
    console.log('현재 localStorage:', JSON.stringify(Object.fromEntries(
      Object.keys(localStorage).map(key => [key, localStorage.getItem(key)?.substring(0, 50)])
    ), null, 2));

    // 1. 모든 쿠키 삭제 (도메인 쿠키 포함)
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });

    // 2. Zustand persist 스토어를 먼저 초기화 (재저장 방지)
    useAuthStore.persist.clearStorage();
    useTokenStore.persist.clearStorage();

    // 3. localStorage 전체 삭제
    localStorage.clear();

    // 4. sessionStorage 전체 삭제
    sessionStorage.clear();

    // 5. Zustand 메모리 상태 초기화
    clearTokens();
    clearTokenManager();
    useTokenStore.getState().clearTokens();

    // 6. React Query 캐시 완전 삭제
    queryClient.clear();

    // 7. 다시 한번 localStorage 확인 및 삭제 (혹시 모를 재저장 대비)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('token-storage');

    console.log('✅ 로그아웃 완료 - 저장소 확인:', {
      localStorageKeys: Object.keys(localStorage),
      accessToken: localStorage.getItem('accessToken'),
      authStorage: localStorage.getItem('auth-storage'),
      tokenStorage: localStorage.getItem('token-storage'),
    });

    // 8. 즉시 페이지 리다이렉트 (setTimeout 제거)
    window.location.href = '/auth/login';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto">
        <div className="container flex h-14 w-screen items-center justify-between lg:h-16">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-auto w-10 lg:w-12" />
            <div className="text-base font-medium text-primary lg:text-lg">거북스쿨</div>
          </Link>

          <span className="flex lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu className="flex h-5 w-5 lg:hidden" onClick={() => setIsOpen(true)}>
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <img src="/logo.png" alt="logo" className="h-auto w-10 lg:w-12" />
                    <div className="text-base font-medium text-primary lg:text-lg">거북스쿨</div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col items-start justify-center gap-4">
                  <Link to="/" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>🏠 홈</Link>
                  <Separator className="my-2" />
                  <div className="w-full space-y-2">
                    <div className="font-semibold text-sm text-gray-500 px-1">고객센터</div>
                    <Link to="/official/notice" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>공지사항</Link>
                    <Link to="/official/guide" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>서비스 소개</Link>
                    <Link to="/official/faq" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>FAQ</Link>
                  </div>
                  <Separator className="my-2" />
                  <div className="w-full space-y-2">
                    <Link to="/products" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2 px-1 text-blue-600")} onClick={() => setIsOpen(false)}>
                      <WonCircle className="h-6 w-6" />
                      이용권 구매
                    </Link>
                    <Link to="/notifications" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2 px-1")} onClick={() => setIsOpen(false)}>
                      <Bell className="h-4 w-4" />
                      알림 설정
                    </Link>
                    <Link to="/account-linkage" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2 px-1")} onClick={() => setIsOpen(false)}>
                      <Users className="h-4 w-4" />
                      계정연동
                    </Link>
                    {user ? (
                      <>
                        <Link to="/users/profile" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>마이 페이지</Link>
                        <Link to="/users/school-record" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>생기부/성적 입력</Link>
                        <Link to="/users/mock-exam" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>모의고사/수능 성적 입력</Link>
                        {isOfficer && <Link to="/officer/apply" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>평가자 전용 페이지</Link>}
                        <Button variant="ghost" type="button" onClick={(e) => handleLogoutClick(e)} className="w-full justify-start px-1 text-red-500 hover:text-red-600">로그아웃</Button>
                      </>
                    ) : (
                      <Link to="/auth/login" className={cn(buttonVariants({ variant: "default" }), "w-full rounded-full bg-blue-600 hover:bg-blue-700")} onClick={() => setIsOpen(false)}>로그인</Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          <div className="hidden items-center gap-4 lg:flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost"><span>고객센터</span><IconChevronDown className="size-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 space-y-1 p-1">
                <Link to="/official/notice" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">공지사항</Link>
                <Link to="/official/guide" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">서비스 소개</Link>
                <Link to="/official/faq" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">FAQ</Link>
              </PopoverContent>
            </Popover>

            {/* 아이콘 메뉴 */}
            <div className="flex items-center gap-1">
              {/* 이용권 구매 */}
              <Link
                to="/products"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-blue-600 hover:bg-blue-50 hover:text-blue-700")}
                title="이용권 구매"
              >
                <WonCircle className="h-6 w-6" />
              </Link>
              {/* 알림 */}
              <Link
                to="/notifications"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative text-gray-600 hover:bg-gray-100 hover:text-gray-900")}
                title="알림 설정"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </Link>
              {/* 계정연동 */}
              <Link
                to="/account-linkage"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-gray-600 hover:bg-gray-100 hover:text-gray-900")}
                title="계정연동"
              >
                <Users className="h-5 w-5" />
              </Link>
            </div>
            {user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost"><span>{user.nickname} 님</span> <IconChevronDown className="size-4" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 space-y-1 p-1">
                  <Link to="/users/profile" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">마이 페이지</Link>
                  <Link to="/users/school-record" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">생기부/성적 입력</Link>
                  <Link to="/users/mock-exam" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">모의고사/수능 성적 입력</Link>
                  <Link to="/users/payment" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">결제내역</Link>
                  {isOfficer && <Link to="/officer/apply" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">평가자 전용 페이지</Link>}
                  <Separator />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="flex h-8 w-full items-center justify-start rounded-md px-2 text-sm font-normal text-red-500 hover:bg-gray-100 hover:text-red-500">로그아웃</Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[300px]">
                      <DialogHeader>
                        <DialogTitle>로그아웃 하시겠습니까?</DialogTitle>
                        <DialogDescription>로그아웃하면 다시 로그인해야 합니다.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-4">
                        <DialogClose asChild>
                          <Button variant="outline" type="button">취소</Button>
                        </DialogClose>
                        <Button type="button" onClick={(e) => handleLogoutClick(e)}>확인</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </PopoverContent>
              </Popover>
            ) : (
              <Link to="/auth/login" className={cn(buttonVariants(), "rounded-full bg-blue-600 hover:bg-blue-700")}>로그인</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
