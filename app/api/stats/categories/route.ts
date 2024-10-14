import { db } from "@/db";
import { transactions } from "@/db/schema";
import { OverviewQuerySchema } from "@/validation/overview";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql, and, gte, lte, desc, sum } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({ from, to });
  if (!queryParams.success) {
    throw new Error(queryParams.error.message);
  }

  const stats = await getCategoriesStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );
  return Response.json(stats);
}

export type GetCategoriesStatsResponseType = Awaited<
  ReturnType<typeof getCategoriesStats>
>;

async function getCategoriesStats(userId: string, from: Date, to: Date) {
  const stats = await db
    .select({
      type: transactions.type,
      category: transactions.categoryId,
      totalAmount: sum(transactions.amount).as("totalAmount"),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, from.toISOString().split("T")[0]),
        lte(transactions.date, to.toISOString().split("T")[0])
      )
    )
    .groupBy(transactions.type, transactions.categoryId)
    .orderBy(sql`totalAmount`);

  return stats;

  // PRISMA
  // const stats = await prisma.transaction.groupBy({ 
  //   by: ["type", "category", "categoryIcon"],
  //   where: {
  //     userId,
  //     date: {
  //       gte: from,
  //       lte: to,
  //     },
  //   },
  //   _sum: {
  //     amount: true,
  //   },
  //   orderBy: {
  //     _sum: {
  //       amount: "desc",
  //     },
  //   },
  // });

  // return stats;
}
