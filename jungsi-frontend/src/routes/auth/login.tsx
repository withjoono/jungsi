import { LoginFormSimple } from "@/components/login-form-simple";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-screen-xl px-4">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-full sm:max-w-[400px]">
            <div className="pb-6">
              <h2 className="text-xl font-medium sm:text-3xl">로그인</h2>
            </div>
            <LoginFormSimple />
          </div>
        </div>
      </div>
    </div>
  );
}
