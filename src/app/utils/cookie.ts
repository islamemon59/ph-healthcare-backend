/* eslint-disable @typescript-eslint/no-explicit-any */
import { CookieOptions, Response, Request } from "express";

const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

const getCookie = (req: Request, key: string) => {
  // Safely handle cases where the cookie parser middleware is not present
  // or `req.cookies` is undefined. Fall back to parsing the `Cookie` header.
  if (req.cookies && typeof req.cookies === "object") {
    return (req.cookies as any)[key];
  }

  const header = req.headers?.cookie;
  if (!header) return undefined;

  const cookies: Record<string, string> = {};
  header.split(";").forEach((pair) => {
    const [rawName, ...rawVal] = pair.split("=");
    const name = rawName?.trim();
    const val = rawVal.join("=").trim();
    if (name) cookies[name] = decodeURIComponent(val);
  });

  return cookies[key];
};

const deleteCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const cookieUtils = {
  setCookie,
  getCookie,
  deleteCookie,
};
