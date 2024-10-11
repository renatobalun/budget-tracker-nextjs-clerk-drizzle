// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// import { chatbots, groups, plans, queries, toolOnChatbots, tools, userOnChatbots, users, vdbFiles } from "./schema";
// import "dotenv/config"
// import { faker } from '@faker-js/faker';
// import { randomInt } from "crypto";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// })

// const db = drizzle(pool);

// async function main(){
//   console.log("Seeding started...");

//   // const groupsArr:number[] = [];
  
//   // // groups
//   // for(let i=0;i<3;i++){
//   //   await db.insert(groups).values({
//   //     name: faker.company.name(),
//   //   })
//   //   .returning()
//   //   .then((res) => {
//   //     groupsArr.push(res[0].id as number)
//   //   })
//   // }
//   // let groupId = 0;
//   // await db.insert(groups).values({
//   //   name: "demo account",
//   // })
//   // .returning()
//   // .then((res) => {
//   //   groupId = res[0].id
//   // })

//   console.log("Seeding finished!");
//   process.exit(0);
// }

// main()
// .then()
// .catch(error => {
//   console.log("error: ", error);
//   process.exit(0);
// })
