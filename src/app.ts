import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
const app: Application = express();

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

export default app;
