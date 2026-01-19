import { useSocialSignUp } from "@/stores/client/use-social-sign-up";
import { useLoginWithSocial } from "@/stores/server/features/auth/mutations";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { USER_API } from "@/stores/server/features/me/apis";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/(naver)/redirect")({
  component: Redirect,
});

function Redirect() {
  const setData = useSocialSignUp((state) => state.setData);
  const loginWithSocial = useLoginWithSocial();
  const navigate = useNavigate();
  const user = useGetCurrentUser();
  const init = () => {
    const { naver } = window;
    const naverLogin = new naver.LoginWithNaverId({
      clientId: import.meta.env.VITE_NAVER_LOGIN_CLIENT_ID,
      callbackHandle: false,
      isPopup: false,
    });
    naverLogin.init();
    naverLogin.getLoginStatus(async () => {
      const result = await loginWithSocial.mutateAsync({
        socialType: "naver",
        accessToken: naverLogin.accessToken.accessToken,
      });

      if (result.success) {
        toast.success("환영합니다. 거북스쿨입니다. 😄");
        await user.refetch();

        // 사용자 정보를 가져와서 memberType에 따라 리다이렉트
        try {
          const userData = await USER_API.fetchCurrentUserAPI();
          if (userData?.memberType === "teacher") {
            navigate({ to: "/mentor" });
          } else if (userData?.memberType === "parent") {
            navigate({ to: "/family" });
          } else {
            navigate({ to: "/" });
          }
        } catch {
          navigate({ to: "/" });
        }
      } else {
        // 실패 시 회원가입을 위해 oauth정보 저장
        setData({
          socialType: "naver",
          token: naverLogin.accessToken.accessToken,
        });
        navigate({ to: "/auth/register", replace: true });
        toast.error(result.error);
      }
    });
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div></div>;
}
