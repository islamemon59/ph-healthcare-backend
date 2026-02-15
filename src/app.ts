import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { prisma } from "./app/lib/prisma";
import { indexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { auth } from "./app/lib/auth";
import { toNodeHandler } from "better-auth/node";
import path from "path";
import { envVars } from "./config/env";
import cors from "cors";
const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(
  cors({
    origin: [envVars.FRONTED_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", indexRoutes);

app.get("/", async (req: Request, res: Response) => {
  const result = await prisma.specialty.create({
    data: {
      title: "Cardiology",
    },
  });

  res
    .status(201)
    .json({ success: true, message: "Specialty created", data: result });
  res.send("Hello, World!");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
