"use server";

import { db } from "@/db";
import { categories, transactions, userOnCategories } from "@/db/schema";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
  DeleteCategorySchema,
  DeleteCategorySchemaType,
} from "@/validation/categories";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function CreateCategory(form: CreateCategorySchemaType) {
  const parsedBody = CreateCategorySchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name, icon } = parsedBody.data;
  try {
    let result = await db
      .insert(categories)
      .values({
        name: name,
        icon: icon,
      })
      .onConflictDoNothing()
      .returning();

    if (result.length === 0) {
      result = await db
        .select()
        .from(categories)
        .where(eq(categories.name, name));
    }

    await db.insert(userOnCategories).values({
      userId: user.id,
      categoryId: result[0].id,
    });

    return result[0];
  } catch (error) {
    console.error("An error occurred", error);
  }

  //   const { name, icon, type } = parsedBody.data;
  //   return await prisma.category.create({
  //     data: {
  //       userId: user.id,
  //       name,
  //       icon,
  //       type,
  //     },
  //   });
}

export async function DeleteCategory(form: DeleteCategorySchemaType) {
  const parsedBody = DeleteCategorySchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const result = await db
    .delete(categories)
    .where(and(eq(categories.name, parsedBody.data.name)))
    .returning();

  const deletedCategoryId = result[0].id;

  await db
    .delete(userOnCategories)
    .where(
      and(
        eq(userOnCategories.userId, user.id),
        eq(userOnCategories.categoryId, deletedCategoryId)
      )
    );

  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.userId, user.id),
        eq(transactions.categoryId, deletedCategoryId)
      )
    );

  return result[0];
  // return await prisma.category.delete({
  //   where: {
  //     name_userId_type: {
  //       userId: user.id,
  //       name: parsedBody.data.name,
  //       type: parsedBody.data.type,
  //     },
  //   },
  // });
}
