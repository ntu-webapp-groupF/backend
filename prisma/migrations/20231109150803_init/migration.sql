/*
  Warnings:

  - Added the required column `owner` to the `Books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Books" ADD COLUMN     "owner" TEXT NOT NULL;
