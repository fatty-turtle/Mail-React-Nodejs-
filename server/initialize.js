import mysql from "mysql2/promise";

let pool;

export async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS maildb`);

    console.log("Database loaded!");

    await connection.end();

    pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "maildb",
      waitForConnections: true,
      connectionLimit: 5,
    });

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL 
        )`);

    console.log("table ready");

    await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            subject VARCHAR(255),
            body TEXT NOT NULL,
            attachment_path VARCHAR(500),
            sender_deleted TINYINT(1) DEFAULT 0,
            receiver_deleted TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
    console.log(" Messages table ready");

    // Add columns if they don't exist (for existing databases)
    try {
      await pool.query(
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_deleted TINYINT(1) DEFAULT 0`
      );
      await pool.query(
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_deleted TINYINT(1) DEFAULT 0`
      );
    } catch (err) {
      console.log("Columns may already exist or ALTER failed:", err.message);
    }

    await pool.query(`
    INSERT IGNORE INTO users (name, email, password)
    VALUES 
    ('admin', 'admin@gmail.com', '$2a$12$sI0e1GgvN/BFEqT0tN96s.6iAU//eLoS4oqq9dL9e.2zuZlW6c2OO'),
    ('user', 'user@gmail.com', '$2a$12$kwSnsxphFrlfu3RKm3t3SezZp29VwEsiDQ2pOzndOJg7iMUow/3zS');
`);
    console.log("test data ready");
  } catch (err) {
    console.error("db init fail", err.message);
    process.exit(1);
  }
}

export function getDB() {
  if (!pool) throw new Error("DB is not initalized");
  return pool;
}
