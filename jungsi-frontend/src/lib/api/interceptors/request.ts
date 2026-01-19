/**
 * Request 인터셉터
 * Reference 프로젝트의 패턴 적용
 */

import { InternalAxiosRequestConfig } from 'axios';
import { decamelizeKeys } from 'humps';
import { getAccessToken } from '../token-manager';

/**
 * 인증 Request 인터셉터
 * - Authorization 헤더에 Bearer 토큰 추가
 * - 데이터를 snake_case로 변환
 */
export const authRequestInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  // Access Token 추가
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // 데이터를 snake_case로 변환
  if (config.data) {
    config.data = decamelizeKeys(config.data);
  }
  if (config.params) {
    config.params = decamelizeKeys(config.params);
  }

  return config;
};

/**
 * Request 인터셉터 에러 핸들러
 */
export const authRequestErrorInterceptor = (error: any) => {
  return Promise.reject(error);
};
