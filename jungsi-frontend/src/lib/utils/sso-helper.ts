/**
 * SSO (Single Sign-On) 헬퍼 유틸리티
 * 외부 서비스로 이동할 때 토큰을 URL에 포함시켜 자동 로그인 지원
 */

import { getAccessToken, getRefreshToken, setTokens } from '@/lib/api/token-manager';
import { useTokenStore } from '@/stores/atoms/tokens';
import { useAuthStore } from '@/stores/client/use-auth-store';

/**
 * JWT 토큰에서 만료 시간(exp) 추출
 * @param token - JWT 토큰
 * @returns 만료 시간 (Unix timestamp in seconds) 또는 기본값 (1시간 후)
 */
function getTokenExpiry(token: string): number {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp) {
      return decoded.exp;
    }
  } catch (error) {
    console.warn('JWT 토큰 디코딩 실패, 기본 만료 시간 사용');
  }
  // 기본값: 1시간 후
  return Math.floor(Date.now() / 1000) + 3600;
}

/**
 * SSO URL 생성
 * 현재 사용자의 토큰을 URL 파라미터에 추가하여 외부 서비스에서 자동 로그인 가능하게 함
 * @param baseUrl - 외부 서비스 URL
 * @returns 토큰이 포함된 SSO URL (비로그인 시 원본 URL 반환)
 */
export function generateSSOUrl(baseUrl: string): string {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    // 로그인되지 않은 경우 토큰 없이 그대로 반환
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set('sso_access_token', accessToken);
  url.searchParams.set('sso_refresh_token', refreshToken);

  return url.toString();
}

/**
 * SSO 지원 서비스인지 확인
 * @param href - 체크할 URL
 * @returns SSO 지원 서비스 여부
 */
export function isSSOService(href: string): boolean {
  const ssoServices = [
    import.meta.env.VITE_STUDYPLANNER_URL,
    import.meta.env.VITE_SUSI_URL,
    import.meta.env.VITE_MYEXAM_URL,
    import.meta.env.VITE_HUB_URL,
  ].filter(Boolean);

  return ssoServices.some((service) => href.startsWith(service));
}

/**
 * URL 파라미터에서 SSO 토큰을 추출하고 자동 로그인 처리
 * Hub나 다른 서비스에서 SSO로 접근할 때 사용
 * @returns 성공 여부
 */
export function processSSOLogin(): boolean {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const ssoAccessToken = urlParams.get('sso_access_token');
    const ssoRefreshToken = urlParams.get('sso_refresh_token');

    // SSO 토큰이 없으면 처리하지 않음
    if (!ssoAccessToken || !ssoRefreshToken) {
      return false;
    }

    console.log('🔐 SSO 토큰 발견 - 자동 로그인 처리 중...');

    // JWT에서 만료 시간 추출
    const tokenExpiry = getTokenExpiry(ssoAccessToken);

    // 1. token-manager에 토큰 저장
    setTokens(ssoAccessToken, ssoRefreshToken);

    // 2. Zustand 스토어에도 토큰 저장
    useTokenStore.getState().setTokens(ssoAccessToken, ssoRefreshToken);
    useAuthStore.getState().setTokens(ssoAccessToken, ssoRefreshToken, tokenExpiry);

    // 3. URL에서 SSO 파라미터 제거 (보안상 중요)
    urlParams.delete('sso_access_token');
    urlParams.delete('sso_refresh_token');

    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);

    console.log('✅ SSO 자동 로그인 성공');
    return true;
  } catch (error) {
    console.error('❌ SSO 로그인 처리 실패:', error);
    return false;
  }
}
