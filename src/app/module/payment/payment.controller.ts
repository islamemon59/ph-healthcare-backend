import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../../config/env";
import status from "http-status";
import { stripe } from "../../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      return res
        .status(status.BAD_REQUEST)
        .json({ error: "Missing Stripe signature or webhook secret" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (error) {
      console.error("Error processing Stripe webhook event", error);
      return res
        .status(status.BAD_REQUEST)
        .json({ error: "Error processing Stripe webhook event" });
    }

    try {
      const result = await PaymentService.handlerStripeWebHookEvent(event);

      sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      console.error("Error processing Stripe webhook event", error);
      sendResponse(res, {
        httpStatusCode: status.BAD_REQUEST,
        success: false,
        message: "Error processing Stripe webhook event",
        data: error,
      });
    }
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
