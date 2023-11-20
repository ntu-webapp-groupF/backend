-- DropForeignKey
ALTER TABLE "BoughtBooks" DROP CONSTRAINT "BoughtBooks_books_id_fkey";

-- DropForeignKey
ALTER TABLE "BoughtBooks" DROP CONSTRAINT "BoughtBooks_users_id_fkey";

-- DropForeignKey
ALTER TABLE "Categorys" DROP CONSTRAINT "Categorys_books_id_fkey";

-- DropForeignKey
ALTER TABLE "Collections" DROP CONSTRAINT "Collections_books_id_fkey";

-- DropForeignKey
ALTER TABLE "Collections" DROP CONSTRAINT "Collections_users_id_fkey";

-- DropForeignKey
ALTER TABLE "Historys" DROP CONSTRAINT "Historys_categorys_id_fkey";

-- DropForeignKey
ALTER TABLE "Historys" DROP CONSTRAINT "Historys_users_id_fkey";

-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_books_id_fkey";

-- DropForeignKey
ALTER TABLE "Ownerships" DROP CONSTRAINT "Ownerships_books_id_fkey";

-- DropForeignKey
ALTER TABLE "Ownerships" DROP CONSTRAINT "Ownerships_users_id_fkey";

-- DropForeignKey
ALTER TABLE "Rates" DROP CONSTRAINT "Rates_books_id_fkey";

-- DropForeignKey
ALTER TABLE "Rates" DROP CONSTRAINT "Rates_users_id_fkey";

-- AddForeignKey
ALTER TABLE "Categorys" ADD CONSTRAINT "Categorys_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historys" ADD CONSTRAINT "Historys_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historys" ADD CONSTRAINT "Historys_categorys_id_fkey" FOREIGN KEY ("categorys_id") REFERENCES "Categorys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collections" ADD CONSTRAINT "Collections_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collections" ADD CONSTRAINT "Collections_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoughtBooks" ADD CONSTRAINT "BoughtBooks_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoughtBooks" ADD CONSTRAINT "BoughtBooks_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownerships" ADD CONSTRAINT "Ownerships_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownerships" ADD CONSTRAINT "Ownerships_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rates" ADD CONSTRAINT "Rates_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rates" ADD CONSTRAINT "Rates_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
