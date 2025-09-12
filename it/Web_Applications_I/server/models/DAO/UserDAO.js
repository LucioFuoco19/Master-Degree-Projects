import { initDB } from '../db.js';
import crypto from 'crypto';
class UserDAO {
  constructor() {
    this.dbPromise = initDB(); // il DB è una promise
  }

  async createTable() {
    const db = await this.dbPromise;
    await db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'teacher'))
      );
    `);
  }
  async insertUser(username, password, role) {
  const db = await this.dbPromise;
  const hashedPassword = hashPassword(password);
  await db.run(
    `INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`,
    [username, hashedPassword, role]
  );
}
   async getUserByUsername(username) {
    const db = await this.dbPromise;
    return db.get(`SELECT * FROM Users WHERE username = ?`, [username]);
  }
   async getAllStudents() {
    const db = await this.dbPromise;
    return db.all(`SELECT * FROM Users WHERE role = 'student'`);
  }
  async getAllTeachers() {
    const db = await this.dbPromise;
    return db.all(`SELECT * FROM Users WHERE role = 'teacher'`);
  }
   async getUserById(id) {
    const db = await this.dbPromise;
    return db.get(`SELECT * FROM Users WHERE id = ?`, [id]);
  }
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, hashed) {
  const [salt, originalHash] = hashed.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

export default new UserDAO();