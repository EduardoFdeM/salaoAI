-- AlterTable
ALTER TABLE "salons" ADD COLUMN     "client_required_fields" JSONB DEFAULT '{"phone": true, "email": false}';
