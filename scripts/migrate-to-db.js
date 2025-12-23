#!/usr/bin/env node

/**
 * Migration script to import existing JSON data into PostgreSQL database
 *
 * Usage:
 *   node scripts/migrate-to-db.js
 */

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432'),
  ssl: process.env.PGHOST?.includes('azure') ? {
    rejectUnauthorized: false
  } : false,
});

async function migrate() {
  console.log('Starting migration...');

  try {
    // Initialize database schema
    console.log('\n1. Initializing database schema...');
    const initSQL = await fs.readFile(path.join(__dirname, 'init-db.sql'), 'utf-8');
    await pool.query(initSQL);
    console.log('✓ Database schema initialized');

    // Import shift mapping
    console.log('\n2. Importing shift mapping...');
    const mappingPath = path.join(__dirname, '..', 'data', 'shiftmapping.json');
    const mappingData = JSON.parse(await fs.readFile(mappingPath, 'utf-8'));

    await pool.query(
      'INSERT INTO shift_mapping (day_types) VALUES ($1) ON CONFLICT DO NOTHING',
      [JSON.stringify(mappingData.dayTypes)]
    );
    console.log('✓ Shift mapping imported');

    // Import shift data files
    console.log('\n3. Importing shift data files...');
    const dataDir = path.join(__dirname, '..', 'data');
    const files = await fs.readdir(dataDir);
    const shiftFiles = files.filter(f => f.match(/^\d{6}shift\.json$/));

    console.log(`Found ${shiftFiles.length} shift data files`);

    for (const file of shiftFiles) {
      const year = parseInt(file.substring(0, 4));
      const month = parseInt(file.substring(4, 6));

      const filePath = path.join(dataDir, file);
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));

      await pool.query(
        `INSERT INTO shift_data (year, month, pod, lockdate, people, tag_arrangement)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (year, month) DO UPDATE SET
           pod = EXCLUDED.pod,
           lockdate = EXCLUDED.lockdate,
           people = EXCLUDED.people,
           tag_arrangement = EXCLUDED.tag_arrangement,
           updated_at = CURRENT_TIMESTAMP`,
        [
          year,
          month,
          data.pod || 'Default',
          data.lockdate || [],
          JSON.stringify(data.people || []),
          JSON.stringify(data.tag_arrangement || [])
        ]
      );

      console.log(`✓ Imported ${year}-${String(month).padStart(2, '0')}`);
    }

    console.log('\n✅ Migration completed successfully!');

    // Show summary
    const shiftCount = await pool.query('SELECT COUNT(*) FROM shift_data');
    console.log(`\nTotal shift records in database: ${shiftCount.rows[0].count}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migrate();
