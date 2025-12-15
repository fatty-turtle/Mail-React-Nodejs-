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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
    console.log(" Messages table ready");

    await pool.query(`
    INSERT IGNORE INTO users (name, email, password)
    VALUES 
    ('admin', 'admin@gmail.com', '$2a$12$Iubq4ajysrbiUqK9H4z1sumbrCfUExh/Xkh2rZBoR7KGVhaP1gm9i'),
    ('user', 'user@gmail.com', '$2a$12$RbczaSjB8NTbY.3ZrYhElecW07pwSrB.x4bkgP83/l8bboSVI4z2O');
`);

    await pool.query(`
    INSERT INTO messages (sender_id, receiver_id, subject, body, attachment_path)
    SELECT 1, 2, 'Subject 1', 'Body 1', NULL
    WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE sender_id=1 AND receiver_id=2 AND subject='Subject 1' AND body='Body 1'
);
`);
    await pool.query(`
    INSERT INTO messages (sender_id, receiver_id, subject, body, attachment_path)
    SELECT 2, 1, 'Subject 2', 'Body 2', NULL
    WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE sender_id=2 AND receiver_id=1 AND subject='Subject 2' AND body='Body 2'
);
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
