import dotenv from "dotenv";

let envFile = ".env";

if (process.env.NODE_ENV === "production") {
  envFile = ".production.env";
} else if (process.env.DOCKER === "true") {
  envFile = ".docker.env";
}

dotenv.config({ path: envFile });

process.env.DATABASE_URL
console.log()
export default {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
};