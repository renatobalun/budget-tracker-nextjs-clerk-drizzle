"use server";

import { db } from "@/db";
import { categories, transactions, userOnCategories } from "@/db/schema";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/validation/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { amount, categoryId, date, description, type } = parsedBody.data;
  const categoryRow = await db.query.userOnCategories.findFirst({
    where: and(
      eq(userOnCategories.userId, user.id),
      eq(userOnCategories.categoryId, categoryId)
    ),
  });

  const categoryInfo = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!categoryRow) {
    throw new Error("category not found");
  }

  //NOTE: don't confuse these two ->
  //$transaction ( prisma ) |||| prisma.transaction (table)

  try {
    await db.transaction(async (trx) => {
      await trx
      .insert(transactions)
      .values({
        name: "name",
        amount: amount,
        description: description,
        date: date,
        type: type,
        userId: user.id,
        categoryId: categoryId,
      });
    });
  } catch (error) {
    console.error(error);
  }

  // await prisma.$transaction([
  //   //Create user transaction
  //   prisma.transaction.create({
  //     data: {
  //       userId: user.id,
  //       amount,
  //       date,
  //       description: description || "",
  //       type,
  //       category: categoryRow.name,
  //       categoryIcon: categoryRow.icon,
  //     },
  //   }),

  //   //Update month aggregate table
  //   prisma.monthHistory.upsert({
  //     where: {
  //       day_month_year_userId: {
  //         userId: user.id,
  //         day: date.getUTCDate(),
  //         month: date.getUTCMonth(),
  //         year: date.getUTCFullYear(),
  //       },
  //     },
  //     create: {
  //       userId: user.id,
  //       day: date.getUTCDate(),
  //       month: date.getUTCMonth(),
  //       year: date.getUTCFullYear(),
  //       expense: type === "expense" ? amount : 0,
  //       income: type === "income" ? amount : 0,
  //     },
  //     update: {
  //       expense: {
  //         increment: type === "expense" ? amount : 0,
  //       },
  //       income: {
  //         increment: type === "income" ? amount : 0,
  //       },
  //     },
  //   }),

  //   //Update year aggregate table
  //   prisma.yearHistory.upsert({
  //     where: {
  //       month_year_userId: {
  //         userId: user.id,
  //         month: date.getUTCMonth(),
  //         year: date.getUTCFullYear(),
  //       },
  //     },
  //     create: {
  //       userId: user.id,
  //       month: date.getUTCMonth(),
  //       year: date.getUTCFullYear(),
  //       expense: type === "expense" ? amount : 0,
  //       income: type === "income" ? amount : 0,
  //     },
  //     update: {
  //       expense: {
  //         increment: type === "expense" ? amount : 0,
  //       },
  //       income: {
  //         increment: type === "income" ? amount : 0,
  //       },
  //     },
  //   }),
  // ]);
}
