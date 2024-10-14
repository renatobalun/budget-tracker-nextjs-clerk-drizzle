import { db } from "@/db";
import { categories, transactions, users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const paramType = searchParams.get("type");

  const validator = z.enum(["expense", "income"]).nullable();
  const queryParams = validator.safeParse(paramType);

  if (!queryParams.success) {
    return Response.json(queryParams.error, {
      status: 400,
    });
  }

  const type = queryParams.data;

  const categoriesSettings = await db
    .select({
      userId: transactions.userId,
      createdAt: categories.created_at,
      name: categories.name,
      icon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, user.id))
    .orderBy(asc(categories.name));

  // const categories = await prisma.category.findMany({
  //   where: {
  //     userId: user.id,
  //     ...(type && { type }), //include type in the filters if type is defined
  //   },
  //   orderBy:{
  //       name: "asc",
  //   }
  // });

  return Response.json(categoriesSettings);
}
