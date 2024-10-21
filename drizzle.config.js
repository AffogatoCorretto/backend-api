export default {
    schema: "src/schema.js",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    out: "migrations/neon",
  };


  