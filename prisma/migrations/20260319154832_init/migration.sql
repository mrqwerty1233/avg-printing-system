-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'NO_RECORD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCode" TEXT,
    "fullName" TEXT NOT NULL,
    "position" TEXT,
    "dailySalary" DECIMAL(10,2) NOT NULL DEFAULT 450.00,
    "lateDeduction" DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "timeIn" TEXT,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "lateDeductionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "dailyJobIncomeTotal" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_entries" (
    "id" TEXT NOT NULL,
    "dailyRecordId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_summaries" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalWorkedDays" INTEGER NOT NULL DEFAULT 0,
    "totalLateDays" INTEGER NOT NULL DEFAULT 0,
    "totalLateDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "baseSalary" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalJobIncome" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "bonusAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "finalSalary" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeCode_key" ON "employees"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "daily_records_employeeId_workDate_key" ON "daily_records"("employeeId", "workDate");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_summaries_employeeId_month_year_key" ON "monthly_summaries"("employeeId", "month", "year");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_entries" ADD CONSTRAINT "job_entries_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "daily_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_summaries" ADD CONSTRAINT "monthly_summaries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
