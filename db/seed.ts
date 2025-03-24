import { PrismaClient } from "@prisma/client";
import sampleData from "./sample-data";

// execute command is: npx tsx ./db/seed
async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();

  await prisma.product.createMany({ data: sampleData.products });
}

main();
