// migration.js

const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');

const connection = postgres(process.env.DATABASE_URL, {
  ssl: 'require', 
  max: 1,     
});

const db = drizzle(connection);

(async () => {
  try {
    await migrate(db, { migrationsFolder: './migrations/neon' });
    console.log('Migration complete');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await connection.end(); 
    process.exit(0);
  }
})();
