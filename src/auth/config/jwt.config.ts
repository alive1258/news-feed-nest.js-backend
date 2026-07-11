import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTlt: parseInt(process.env.JWT_ACCESSTOKEN_TLT ?? '3600 ', 10),
    refreshTokenTlt: parseInt(process.env.JWT_REFRESH_TOKEN_TLT ?? '86400', 10),
  };
});
