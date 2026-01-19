import { nestApiClient } from "../../api-client";
import { ILoginResponse } from "./interfaces";

interface ISocialLoginReturn {
  accessToken: {
    accessToken: string;
    refreshToken: string;
  };
  message: string | null;
  tokenType: "Bearer";
  status: boolean;
}
export const socialLoginFetch = async ({
  oauthId,
}: {
  oauthId: string;
}): Promise<ISocialLoginReturn> => {
  const res = await nestApiClient.post("auth/login/oauth2", {
    oauthId,
  });

  return res.data;
};

export const emailLoginFetch = async ({
  email,
  password,
}: {
  email: string | null;
  password: string | null;
}): Promise<ILoginResponse> => {
  const res = await nestApiClient.post("/auth/login/email", {
    email,
    password,
  });

  return res.data;
};

interface ITokenRefetchReturn {
  accessToken: {
    accessToken: string;
    refreshToken: null;
  };
  message: null;
  status: boolean;
  tokenType: null;
}

export const tokenReissueFetch = async (
  refreshToken: string,
): Promise<ITokenRefetchReturn> => {
  const res = await nestApiClient.get("auth/reissue", {
    params: {
      refreshToken,
    },
  });

  return res.data;
};
