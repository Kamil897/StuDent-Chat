/*
  Warnings:

  - You are about to drop the column `hobbies` on the `cogniyaprofile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `CogniyaProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `cogniyaprofile` DROP COLUMN `hobbies`;

-- CreateIndex
CREATE UNIQUE INDEX `CogniyaProfile_userId_key` ON `CogniyaProfile`(`userId`);
