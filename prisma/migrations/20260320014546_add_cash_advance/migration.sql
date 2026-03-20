-- CreateTable
CREATE TABLE "CashAdvance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "advanceDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CashAdvance_employeeId_idx" ON "CashAdvance"("employeeId");

-- CreateIndex
CREATE INDEX "CashAdvance_advanceDate_idx" ON "CashAdvance"("advanceDate");

-- AddForeignKey
ALTER TABLE "CashAdvance" ADD CONSTRAINT "CashAdvance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
