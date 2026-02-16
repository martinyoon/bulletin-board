-- CreateTable
CREATE TABLE "Dislike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Dislike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Dislike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Dislike_postId_userId_key" ON "Dislike"("postId", "userId");
