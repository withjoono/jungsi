import { RegisterWithEmailForm } from "@/components/register-with-email-form";
import { RegisterWithSocialForm } from "@/components/register-with-social-form";
import { useSocialSignUp } from "@/stores/client/use-social-sign-up";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register")({
  component: Register,
});

function Register() {
  const socialType = useSocialSignUp((state) => state.socialType);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-screen-xl px-4">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-full sm:max-w-[400px]">
            <div className="space-y-2 pb-6">
              <h2 className="text-xl font-medium sm:text-3xl">회원가입</h2>
              <p className="text-sm text-foreground/60">
                🤗 거북스쿨을 찾아주셔서 감사합니다. 좋은 서비스를 만들기 위해
                항상 노력하겠습니다.
              </p>
            </div>
            {socialType === null ? (
              <RegisterWithEmailForm className="" />
            ) : (
              <RegisterWithSocialForm className="" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
