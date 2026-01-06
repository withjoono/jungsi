export type JwtPayloadType = {
  sub: string; // "ATK" | "RTK"
  jti: string; // memberId 값이 들어감
  iat: number;
  exp: number;
};

// 스프링에서 사용중인 jwt payload
// {
//     "sub": "ATK",
//     "jti": memberId,
//     "iat": 1716558652,
//     "exp": 1716576652
//   }
