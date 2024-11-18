const postgres = require('postgres');

// Create a PostgreSQL client
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

(async () => {
  try {
    // Drop all tables
    await sql`DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS "' || quote_ident(r.tablename) || '" CASCADE';
      END LOOP;
    END $$;`;

    console.log('All tables dropped successfully.');

    // Drop all enums
    await sql`DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS "' || quote_ident(r.typname) || '" CASCADE';
      END LOOP;
    END $$;`;

    console.log('All enums dropped successfully.');

    await sql.end();
  } catch (error) {
    console.error('Error dropping tables or enums:', error);
  }
})();
