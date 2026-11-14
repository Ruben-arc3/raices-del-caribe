import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(connectionString
  ? { connectionString, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined }
  : { host: process.env.PGHOST ?? 'localhost', port: Number(process.env.PGPORT) || 5432, database: process.env.PGDATABASE ?? 'artesanias_caribe', user: process.env.PGUSER ?? 'postgres', password: process.env.PGPASSWORD });

pool.on('error', (error) => console.error('Error inesperado de PostgreSQL:', error.message));
