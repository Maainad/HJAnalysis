/**
 * Migrate vehicle_parts from sub_category to main category
 *
 * This script:
 * 1. Finds all listings where sub_category = 'vehicle_parts'
 * 2. Moves them to category = 'vehicle_parts'
 * 3. Clears the sub_category field
 *
 * Run with: node scripts/migrate-vehicle-parts.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateVehicleParts() {
  const client = await pool.connect();

  try {
    console.log('='.repeat(60));
    console.log('Migrating vehicle_parts from sub_category to category');
    console.log('='.repeat(60));

    // First, check how many listings will be affected
    const countResult = await client.query(`
      SELECT COUNT(*) as count
      FROM analyzed_demand
      WHERE sub_category = 'vehicle_parts'
    `);

    const count = parseInt(countResult.rows[0].count);
    console.log(`\nFound ${count} listings with sub_category = 'vehicle_parts'`);

    if (count === 0) {
      console.log('No listings to migrate. Exiting.');
      return;
    }

    // Show some examples
    console.log('\nExample listings to be updated:');
    const examplesResult = await client.query(`
      SELECT post_id, title, category, sub_category
      FROM analyzed_demand
      WHERE sub_category = 'vehicle_parts'
      LIMIT 5
    `);

    examplesResult.rows.forEach(row => {
      console.log(`  - ${row.post_id}: ${row.title}`);
      console.log(`    Current: category="${row.category}", sub_category="${row.sub_category}"`);
      console.log(`    Will become: category="vehicle_parts", sub_category=null`);
    });

    // Ask for confirmation
    console.log(`\n⚠️  About to update ${count} listings.`);
    console.log('Press Ctrl+C to cancel, or any key to continue...');

    // In non-interactive mode, proceed automatically
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Perform the migration
    console.log('\n🔄 Starting migration...');

    const updateResult = await client.query(`
      UPDATE analyzed_demand
      SET
        category = 'vehicle_parts',
        sub_category = NULL
      WHERE sub_category = 'vehicle_parts'
    `);

    console.log(`✅ Successfully updated ${updateResult.rowCount} listings`);

    // Verify the results
    console.log('\n📊 Verification:');

    const vehiclePartsCount = await client.query(`
      SELECT COUNT(*) as count
      FROM analyzed_demand
      WHERE category = 'vehicle_parts'
    `);

    const remainingSubCat = await client.query(`
      SELECT COUNT(*) as count
      FROM analyzed_demand
      WHERE sub_category = 'vehicle_parts'
    `);

    console.log(`  - Listings now in vehicle_parts category: ${vehiclePartsCount.rows[0].count}`);
    console.log(`  - Listings still with vehicle_parts as sub_category: ${remainingSubCat.rows[0].count}`);

    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  migrateVehicleParts().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateVehicleParts };
