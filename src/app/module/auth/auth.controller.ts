import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.registerPatient(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  // Set tokens in cookies  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookies(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Patient registered successfully",
    data: { ...rest, accessToken, refreshToken, token },
  });
});

const loginPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.loginPatient(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  // Set tokens in cookies
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookies(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Patient logged in successfully",
    data: {
      ...rest,
      accessToken,
      refreshToken,
      token,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await authService.getMe(user!);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  console.log("refresh token", refreshToken);

  if (!refreshToken || !betterAuthSessionToken) {
    throw new Error("Refresh token not found");
  }

  const result = await authService.getNewToken(
    refreshToken,
    betterAuthSessionToken,
  );
  const { newAccessToken, newRefreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, newAccessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookies(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New tokens generated successfully",
    data: { newAccessToken, newRefreshToken, token },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const sessionToken = req.cookies["better-auth.session_token"];

  if (!sessionToken) {
    throw new Error("Session token not found");
  }

  const result = await authService.changePassword(payload, sessionToken);

  tokenUtils.setAccessTokenCookie(res, result.accessToken);
  tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
  tokenUtils.setBetterAuthSessionCookies(res, result.token as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const logOutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await authService.logOutUser(sessionToken);

  cookieUtils.deleteCookie(res, "accessToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  cookieUtils.deleteCookie(res, "better-auth.session_token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  cookieUtils.deleteCookie(res, "refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: result,
  });
});

export const authController = {
  registerPatient,
  loginPatient,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
};
