
import { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../shared/sendResponse";

export const notFound = (req: Request, res: Response,) => {
	sendResponse(res, {
		httpStatusCode: status.NOT_FOUND,
		success: false,
		message: `Route ${req.originalUrl} not found`,
	});
};

export default notFound;

