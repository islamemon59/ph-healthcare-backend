import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { indexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
const app: Application = express();

app.use(express.json());

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
