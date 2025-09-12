import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

sqlite3.verbose();

export async function initDB() {
  return open({
    filename: './database.db',   // oppure un path relativo come './server/database.db'
    driver: sqlite3.Database
  });
}