import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";

const port = config.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log("connected to db successfully!");

    app.listen(port, () => {
      console.log(`server is connected with the port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
