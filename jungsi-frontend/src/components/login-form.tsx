import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./custom/button";
import { loginFormSchema } from "@/lib/validations/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLoginWithEmail } from "@/stores/server/features/auth/mutations";
import { USER_API } from "@/stores/server/features/me/apis";
// import { NaverLoginButton } from "./login-naver-button";
import { GoogleLoginButton } from "./login-google-button";

interface Props {
  className?: string;
}

export function LoginForm({ className }: Props) {
  const navigate = useNavigate();
  const loginWithEmail = useLoginWithEmail();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    if (loginWithEmail.isPending) return;
    const result = await loginWithEmail.mutateAsync({
      email: values.email,
      password: values.password,
    });

    if (result.success) {
      toast.success("환영합니다. 거북스쿨입니다. 😄");

      // 사용자 정보를 가져와서 memberType에 따라 리다이렉트
      try {
        const user = await USER_API.fetchCurrentUserAPI();
        // TODO: mentoring 기능은 별도 앱으로 분리 예정
        // if (user?.memberType === 'teacher') {
        //   navigate({ to: "/mentoring/admin" });
        // } else if (user?.memberType === 'parent') {
        //   navigate({ to: "/mentoring/parent" });
        // } else {
        //   navigate({ to: "/" });
        // }
        navigate({ to: "/" });
      } catch {
        navigate({ to: "/" });
      }
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <div className={cn("space-y-2", className)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="이메일 주소" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>패스워드</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="off"
                      placeholder="패스워드"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loginWithEmail.isPending}
          >
            로그인
          </Button>
        </form>
        <div className="flex justify-center pt-2">
          <Link
            to="/auth/register"
            className="text-sm text-blue-500 hover:underline"
          >
            이메일로 회원가입하기
          </Link>
        </div>
        <div className="flex justify-center">
          <Link
            to="/auth/reset-password"
            className="text-sm text-blue-500 hover:underline"
          >
            패스워드 재설정
          </Link>
        </div>

        <div className="py-2">
          <Separator />
        </div>
        <div className="space-y-2">
          <GoogleLoginButton isPending={loginWithEmail.isPending} />
          {/* <NaverLoginButton isPending={loginWithEmail.isPending} /> */}
        </div>
      </div>
    </Form>
  );
}
