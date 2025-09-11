import app from "./app";
import { connectToDatabase } from "./config/db";
import { env } from "./config/env";

async function start() {
  await connectToDatabase();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server listening on port ${env.port}`);
  });
}

start();


