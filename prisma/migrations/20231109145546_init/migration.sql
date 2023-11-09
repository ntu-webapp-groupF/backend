-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "permission" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Books" (
    "id" SERIAL NOT NULL,
    "bookname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorys" (
    "id" SERIAL NOT NULL,
    "books_id" INTEGER NOT NULL,
    "categoryname" TEXT NOT NULL,

    CONSTRAINT "Categorys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Images" (
    "id" SERIAL NOT NULL,
    "books_id" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historys" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "categorys_id" INTEGER NOT NULL,
    "times" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Historys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collections" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "books_id" INTEGER NOT NULL,

    CONSTRAINT "Collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoughtBooks" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "books_id" INTEGER NOT NULL,

    CONSTRAINT "BoughtBooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ownerships" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "books_id" INTEGER NOT NULL,

    CONSTRAINT "Ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rates" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "books_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Images_file_path_key" ON "Images"("file_path");

-- AddForeignKey
ALTER TABLE "Categorys" ADD CONSTRAINT "Categorys_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historys" ADD CONSTRAINT "Historys_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historys" ADD CONSTRAINT "Historys_categorys_id_fkey" FOREIGN KEY ("categorys_id") REFERENCES "Categorys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collections" ADD CONSTRAINT "Collections_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collections" ADD CONSTRAINT "Collections_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoughtBooks" ADD CONSTRAINT "BoughtBooks_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoughtBooks" ADD CONSTRAINT "BoughtBooks_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownerships" ADD CONSTRAINT "Ownerships_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownerships" ADD CONSTRAINT "Ownerships_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rates" ADD CONSTRAINT "Rates_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rates" ADD CONSTRAINT "Rates_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
