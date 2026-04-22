import dotenv from "dotenv";

// Load .env file (Docker Compose will inject these variables)

if(process.env.NODE_ENV == 'development'){
  dotenv.config({ path: ".docker.env" });
  
}else {
  dotenv.config({ path: ".env" });
  
}

console.log(process.env.DATABASE_URL)

export default {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME
};