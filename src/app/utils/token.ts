import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import { bearer } from "better-auth/plugins";

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

const setAccessTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60  * 24 * 1000,  // 1 day in milliseconds
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60  * 24 * 7 * 1000, // 7 day in milliseconds
  });
};

const setBetterAuthSessionCookies = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60  * 24 * 1000, // 1 day in milliseconds
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookies,
};
