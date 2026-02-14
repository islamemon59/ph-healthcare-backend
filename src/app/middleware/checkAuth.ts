/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { env } from "node:process";
import { jwtUtils } from "../utils/jwt";

export const checkAuth = (...authRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );
      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized: No session token provided",
        );
      }

      if (sessionToken) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;
          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);

          const sessionLifetime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentRemaining = (timeRemaining / sessionLifetime) * 100;

          if (percentRemaining < 20) {
            res.header("X-Session-Expiring-Soon", "true");
            res.header("X-Session-Expires-At", expiresAt.toISOString());
            res.header("X-Session-Time-Remaining", percentRemaining.toString());
            console.log("session expiring soon");
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(
              status.UNAUTHORIZED,
              "User is blocked or deleted",
            );
          }

          if (user.isDeleted) {
            throw new AppError(status.UNAUTHORIZED, "User is deleted");
          }

          if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
            throw new AppError(
              status.FORBIDDEN,
              "User does not have required role",
            );
          }

          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };
        }
      }

      const accessToken = cookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized: No access token provided",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        env.ACCESS_TOKEN_SECRET!,
      );

      if (!verifiedToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized: Invalid access token",
        );
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.data!.role as Role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "User does not have required role",
        );
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
};
