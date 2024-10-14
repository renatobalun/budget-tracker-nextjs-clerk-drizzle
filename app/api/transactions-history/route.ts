import { db } from "@/db";
import { currencies, transactions, users } from "@/db/schema";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { OverviewQuerySchema } from "@/validation/overview";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
  });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(transactions);
}

export type GetTransactionHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  const userSettings = await db.query.users.findFirst({
    where: eq(users.user_id, userId),
  });

  if (!userSettings) {
    throw new Error("user settings not found");
  }

  const currencySettings = await db
    .select()
    .from(currencies)
    .where(eq(currencies.id, userSettings.currency!));

  const formatter = GetFormatterForCurrency(currencySettings.at(0)?.name);

  const transactionsSettings = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, from.toISOString().split("T")[0]),
        lte(transactions.date, to.toISOString().split("T")[0])
      )
    )
    .orderBy(desc(transactions.date));
  
  //PRISMA
  // const transactions = await prisma.transaction.findMany({
  //   where: {
  //     userId,
  //     date: {
  //       gte: from,
  //       lte: to,
  //     },
  //   },
  //   orderBy: {
  //     date: "desc",
  //   },
  // });

  return transactionsSettings.map((transaction) => ({
    ...transaction,
    formattedAmount: formatter.format(transaction.amount),
  }));
}
