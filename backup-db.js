
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(process.cwd(), `backup-${timestamp}.sql`);

// Build pg_dump command
const command = `pg_dump "${databaseUrl}" --clean --if-exists`;

// Execute backup
exec(command, async (error, stdout, stderr) => {
  if (error) {
    console.error('Error generating backup:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('pg_dump stderr:', stderr);
  }

  try {
    await writeFile(backupFile, stdout);
    console.log(`Backup saved to: ${backupFile}`);
  } catch (err) {
    console.error('Error saving backup file:', err);
    process.exit(1);
  }
});
