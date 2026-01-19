import { useAuthStore } from "@/stores/client/use-auth-store";
import {
  ILoginWithEmailBody,
  IRegisterWithEmailBody,
  ILoginResponse,
  ISendSignupCodeBody,
  ILoginWithSocialBody,
  IRegisterWithSocialBody,
  IVerifyCodeBody,
} from "./interfaces";
import { BaseResponse } from "../../common-interface";
import { createMutation } from "../../common-utils";

// 로그인/회원가입 후 인증토큰 처리
const authSuccessHandler = (data: BaseResponse<ILoginResponse>) => {
  const { setTokens, clearTokens } = useAuthStore.getState();
  if (data.success) {
    const { accessToken, refreshToken, tokenExpiry } = data.data;
    setTokens(accessToken, refreshToken, tokenExpiry);
    
    // localStorage에도 저장 (makeApiCall에서 사용)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    console.log('✅ 로그인 성공! 토큰 저장됨:', {
      accessToken: accessToken.substring(0, 20) + '...',
      refreshToken: refreshToken.substring(0, 20) + '...',
      tokenExpiry
    });
  } else {
    clearTokens();
    // localStorage에서도 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// 이메일로 로그인
export const useLoginWithEmail = () => {
  return createMutation<ILoginWithEmailBody, ILoginResponse>(
    "POST",
    "/auth/login/email",
    authSuccessHandler,
    'nest'
  );
};

// 소셜로 로그인
export const useLoginWithSocial = () => {
  return createMutation<ILoginWithSocialBody, ILoginResponse>(
    "POST",
    "/auth/login/oauth2",
    authSuccessHandler,
    'nest'
  );
};

// 이메일로 회원가입
export const useRegisterWithEmail = () => {
  return createMutation<IRegisterWithEmailBody, ILoginResponse>(
    "POST",
    "/auth/register/email",
    authSuccessHandler,
    'nest'
  );
};

// 소셜로 회원가입
export const useRegisterWithSocial = () => {
  return createMutation<IRegisterWithSocialBody, ILoginResponse>(
    "POST",
    "/auth/register/oauth2",
    authSuccessHandler,
    'nest'
  );
};

// 회원가입 휴대폰 인증코드 발송
export const useSendRegisterCode = () => {
  return createMutation<ISendSignupCodeBody, null>(
    "POST",
    "/sms/auth/send",
    undefined, // onSuccess 콜백이 없으므로 undefined
    'nest'
  );
};

// 휴대폰 인증코드 확인
export const useVerifyCode = () => {
  return createMutation<IVerifyCodeBody, null>(
    "POST",
    "/sms/auth/verify",
    undefined,
    'nest'
  );
};

// 비밀번호 재설정 요청 (이메일 입력 단계)
export const useRequestPasswordReset = () => {
  return createMutation<{ email: string; phone: string }, null>(
    "POST",
    "/auth/password-reset/request",
    undefined,
    'nest'
  );
};

// 인증번호 확인 및 재설정 토큰 발급
export const useVerifyResetCode = () => {
  return createMutation<{ phone: string; code: string }, { token: string }>(
    "POST",
    "/auth/password-reset/verify",
    undefined,
    'nest'
  );
};

// 새 비밀번호 설정
export const useResetPassword = () => {
  return createMutation<{ token: string; newPassword: string }, null>(
    "POST",
    "/auth/password-reset/confirm",
    undefined,
    'nest'
  );
};
