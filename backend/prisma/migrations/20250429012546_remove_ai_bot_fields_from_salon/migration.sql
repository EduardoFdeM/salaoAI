-- AlterTable
ALTER TABLE "salons" ADD COLUMN     "ai_bot_enabled" BOOLEAN DEFAULT false,
ADD COLUMN     "appointment_interval" INTEGER DEFAULT 30,
ADD COLUMN     "booking_cancel_limit" INTEGER DEFAULT 4,
ADD COLUMN     "booking_lead_time" INTEGER DEFAULT 2,
ADD COLUMN     "evolution_api_key" TEXT,
ADD COLUMN     "evolution_api_url" TEXT,
ADD COLUMN     "evolution_instance_name" TEXT;
