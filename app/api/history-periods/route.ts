import { db } from "@/db";
import { transactions } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const periods = await getHistoryPeriods(user.id);
  return Response.json(periods);
}

export type GetHistoryPeriodsResponseType = Awaited<
  ReturnType<typeof getHistoryPeriods>
>;

async function getHistoryPeriods(userId: string) {
  const result = await db
    .selectDistinct({
      year: sql<number>`EXTRACT(YEAR FROM ${transactions.date})`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(sql`EXTRACT(YEAR FROM ${transactions.date})`);
    
  // PRISMA
  // const result = await prisma.monthHistory.findMany({
  //   where: {
  //     userId,
  //   },
  //   select: {
  //     year: true,
  //   },
  //   distinct: ["year"],
  //   orderBy: [
  //     {
  //       year: "asc",
  //     },
  //   ],
  // });

  const years = result.map((el) => el.year);
  if (years.length === 0) {
    return [new Date().getFullYear()];
  }

  return years;
}
