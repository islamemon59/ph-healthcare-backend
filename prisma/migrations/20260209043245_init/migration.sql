-- CreateTable
CREATE TABLE "specialty" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "specialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialty_title_key" ON "specialty"("title");

-- CreateIndex
CREATE INDEX "idx_specialty_isDeleted" ON "specialty"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_specialty_title" ON "specialty"("title");
