import dbConnect from "./mongodb";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkDatabaseConnection() {
  console.log("\n🔍 Checking database connection...");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await dbConnect();
      console.log("----MongoDB connected successfully!");
      return true;
    } catch (error) {
      console.error(
        `XXXXX-----MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`
      );

      if (error instanceof Error) {
        console.error(`   Error: ${error.message}`);
      }

      if (attempt < MAX_RETRIES) {
        console.log(`   Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        console.error("\n FATAL: Could not connect to MongoDB");
        console.error("   Please check:");
        console.error("   1. MongoDB URI is correct in .env");
        console.error("   2. MongoDB cluster is running");
        console.error("   3. Network connection is stable");
        console.error("   4. IP address is whitelisted in MongoDB Atlas\n");

        // Exit process in production
        if (process.env.NODE_ENV === "production") {
          process.exit(1);
        }

        return false;
      }
    }
  }

  return false;
}
