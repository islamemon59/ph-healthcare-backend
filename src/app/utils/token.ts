import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";

const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRATION } as SignOptions,
  );
  return accessToken;
};

const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: envVars.REFRESH_TOKEN_EXPIRATION,
    } as SignOptions,
  );
  return refreshToken;
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
};
