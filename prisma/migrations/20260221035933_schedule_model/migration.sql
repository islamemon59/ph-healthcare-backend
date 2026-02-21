/*
  Warnings:

  - You are about to drop the column `EndTime` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `StartTime` on the `schedules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "EndTime",
DROP COLUMN "StartTime";
