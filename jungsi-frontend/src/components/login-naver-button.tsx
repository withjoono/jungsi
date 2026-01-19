import { useEffect } from "react";
import { Button } from "./custom/button";
import naverIcon from "@/assets/icon/login-naver.png";

interface Props {
  isPending?: boolean;
  buttonText?: string;
}

export const NaverLoginButton = ({ isPending, buttonText = "네이버 로그인" }: Props) => {
  const init = () => {
    const { naver } = window;
    const naverLogin = new naver.LoginWithNaverId({
      clientId: import.meta.env.VITE_NAVER_LOGIN_CLIENT_ID,
      callbackUrl: `${import.meta.env.VITE_FRONT_URL}/redirect`,
      callbackHandle: true,
      isPopup: false,
      loginButton: {
        type: 3,
      },
    });
    naverLogin.init();
  };

  useEffect(() => {
    init();
  }, []);

  const handleClickNaverLogin = async () => {
    document.getElementById("naverIdLogin_loginButton")?.click();
  };

  return (
    <>
      <Button
        type="button"
        className="h-auto w-full space-x-2 bg-[#06be34] py-2.5 text-white hover:bg-[#06be34] hover:opacity-90"
        onClick={handleClickNaverLogin}
        loading={isPending}
      >
        <img src={naverIcon} className="size-4" />
        <span>{buttonText}</span>
      </Button>
      <div id="naverIdLogin" className="hidden" />
    </>
  );
};
