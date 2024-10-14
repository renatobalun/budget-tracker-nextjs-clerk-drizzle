import { db } from "@/db";
import { transactions } from "@/db/schema";
import { OverviewQuerySchema } from "@/validation/overview";
import { currentUser } from "@clerk/nextjs/server";
import { sum, and, eq, gte, lte } from "drizzle-orm";
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
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const stats = await getBalanceStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(stats);
}

export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;

async function getBalanceStats(userId: string, from: Date, to: Date) {
  const totals = await db
    .select({
      type: transactions.type,
      totalAmount: sum(transactions.amount),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, from.toISOString().split("T")[0]),
        lte(transactions.date, to.toISOString().split("T")[0])
      )
    )
    .groupBy(transactions.type);

  // PRISMA
  // const totals = await prisma.transaction.groupBy({
  //   by: ["type"],
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
  // });

  return {
    expense: totals.find((t) => t.type === "expense")?.totalAmount || 0,
    income: totals.find((t) => t.type === "income")?.totalAmount || 0,
  };
}
