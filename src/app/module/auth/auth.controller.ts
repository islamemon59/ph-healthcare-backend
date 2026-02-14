import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

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

export const authController = {
  registerPatient,
  loginPatient,
  getMe,
};
