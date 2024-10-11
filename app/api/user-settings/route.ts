import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users, currencies } from "@/db/schema";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let userSettings = await db.query.users.findFirst({
    where: eq(users.user_id, user.id),
  });

  if (!userSettings) {
     const insertedUsers = await db
      .insert(users)
      .values({
        user_id: user.id,
      })
      .returning();

      userSettings = insertedUsers[0]
  }

  //Revalidate the home page that uses the user currency
  revalidatePath("/");
  return Response.json(users);
}
