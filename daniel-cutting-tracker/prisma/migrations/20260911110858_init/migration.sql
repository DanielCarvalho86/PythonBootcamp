-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "referenceWeightKg" DOUBLE PRECISION NOT NULL,
    "referenceWeightAt" TIMESTAMP(3) NOT NULL,
    "bodyFatPercent" DOUBLE PRECISION,
    "fatMassKg" DOUBLE PRECISION,
    "muscleMassKg" DOUBLE PRECISION,
    "skeletalMuscleKg" DOUBLE PRECISION,
    "visceralFat" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "deviceBmrKcal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "servingUnit" TEXT NOT NULL,
    "gramsPerUnit" DOUBLE PRECISION,
    "caloriesPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "fiberPer100g" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "caloriesMin" DOUBLE PRECISION NOT NULL,
    "caloriesTarget" DOUBLE PRECISION NOT NULL,
    "caloriesMax" DOUBLE PRECISION NOT NULL,
    "proteinMin" DOUBLE PRECISION NOT NULL,
    "proteinTarget" DOUBLE PRECISION NOT NULL,
    "proteinMax" DOUBLE PRECISION NOT NULL,
    "carbsMin" DOUBLE PRECISION NOT NULL,
    "carbsTarget" DOUBLE PRECISION NOT NULL,
    "carbsMax" DOUBLE PRECISION NOT NULL,
    "fatMin" DOUBLE PRECISION NOT NULL,
    "fatTarget" DOUBLE PRECISION NOT NULL,
    "fatMax" DOUBLE PRECISION NOT NULL,
    "fiberMin" DOUBLE PRECISION NOT NULL,
    "fiberMax" DOUBLE PRECISION NOT NULL,
    "waterMinMl" DOUBLE PRECISION NOT NULL,
    "waterMaxMl" DOUBLE PRECISION NOT NULL,
    "creatineTargetG" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "wheyTargetG" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanMeal" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isProtectedComposition" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isConsumable" BOOLEAN NOT NULL DEFAULT true,
    "isAdjustable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PlanMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanMealItem" (
    "id" TEXT NOT NULL,
    "planMealId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "targetQuantityG" DOUBLE PRECISION NOT NULL,
    "minQuantityG" DOUBLE PRECISION NOT NULL,
    "maxQuantityG" DOUBLE PRECISION NOT NULL,
    "adjustmentStepG" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "role" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanMealItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" TEXT NOT NULL,
    "foodId" TEXT,
    "freeTextDescription" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'user',
    "isEstimated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" DOUBLE PRECISION,
    "steps" INTEGER,
    "caloriesBurned" DOUBLE PRECISION NOT NULL,
    "caloriesSource" TEXT NOT NULL DEFAULT 'user',
    "intensity" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "includedInActivityTotal" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhysicalActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "totalActivityCaloriesKcal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedBmrKcal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedTdeeKcal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "caloriesConsumedKcal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proteinConsumedG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbsConsumedG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fatConsumedG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fiberConsumedG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterMl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hunger" INTEGER,
    "energy" INTEGER,
    "trainingPerformance" INTEGER,
    "dayStatus" TEXT NOT NULL DEFAULT 'on_track',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "measurementCondition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amountMl" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "targetGrams" DOUBLE PRECISION NOT NULL,
    "takenGrams" DOUBLE PRECISION,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplementEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdjustmentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "triggerMealEntryId" TEXT,
    "reason" TEXT NOT NULL,
    "originalPlanJson" TEXT NOT NULL,
    "adjustedPlanJson" TEXT NOT NULL,
    "changesJson" TEXT NOT NULL,
    "warningsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdjustmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dataJson" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Food_name_idx" ON "Food"("name");

-- CreateIndex
CREATE INDEX "NutritionPlan_userId_startDate_endDate_idx" ON "NutritionPlan"("userId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "PlanMeal_planId_idx" ON "PlanMeal"("planId");

-- CreateIndex
CREATE INDEX "PlanMealItem_planMealId_idx" ON "PlanMealItem"("planMealId");

-- CreateIndex
CREATE INDEX "MealEntry_userId_date_idx" ON "MealEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "PhysicalActivity_userId_date_idx" ON "PhysicalActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyLog_userId_date_idx" ON "DailyLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- CreateIndex
CREATE INDEX "WeightEntry_userId_date_idx" ON "WeightEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "WaterEntry_userId_date_idx" ON "WaterEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "SupplementEntry_userId_date_idx" ON "SupplementEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SupplementEntry_userId_date_type_key" ON "SupplementEntry"("userId", "date", "type");

-- CreateIndex
CREATE INDEX "AdjustmentLog_userId_date_idx" ON "AdjustmentLog"("userId", "date");

-- CreateIndex
CREATE INDEX "Alert_userId_date_idx" ON "Alert"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_userId_type_key" ON "Alert"("userId", "type");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionPlan" ADD CONSTRAINT "NutritionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMeal" ADD CONSTRAINT "PlanMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "NutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_planMealId_fkey" FOREIGN KEY ("planMealId") REFERENCES "PlanMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalActivity" ADD CONSTRAINT "PhysicalActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightEntry" ADD CONSTRAINT "WeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterEntry" ADD CONSTRAINT "WaterEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementEntry" ADD CONSTRAINT "SupplementEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentLog" ADD CONSTRAINT "AdjustmentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

