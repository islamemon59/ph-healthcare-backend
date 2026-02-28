import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { StatsService } from "./stats.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getDashboardStatsData = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await StatsService.getDashboardStatsData(user);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Dashboard stats fetched successfully",
      data: result,
    });
  },
);

export const StatsController = {
  getDashboardStatsData,
};