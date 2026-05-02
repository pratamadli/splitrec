import { neon } from '@neondatabase/serverless'

const url = process.env.SP_DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!url) {
  console.error('No DATABASE_URL found')
  process.exit(1)
}

const sql = neon(url)

try {
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS bank_name text`
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS bank_account text`
  console.log('✓ Migration applied: bank_name, bank_account added to participants')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
}
