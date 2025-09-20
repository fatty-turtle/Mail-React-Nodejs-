import express, { json } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { getDB, initDB } from "./initialize.js";
import session from "express-session";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      secure: false,
    },
  })
);
await initDB();

app.get("/api/login", authMiddleware, async (req, res) => {
  try {
    const db = getDB();

    const [rows] = await db.query("SELECT name FROM users WHERE id=?", [
      req.session.userId,
    ]);

    if (rows.length === 0) {
      res.status(400).json({ success: false, message: "user not found" });
    }

    const user = rows[0];
    res.json({ success: true, message: "user found" });
  } catch (err) {
    console.log("profile error", err.message);
    res.status(500);
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = rows[0];
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.json({ success: false, message: "Invalid password" });
    }
    req.session.userId = user.id;
    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

function authMiddleware(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }
  next();
}

app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.session.userId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = getDB();

    if ((!name, !email, !password)) {
      return res.json({ success: false, message: "Invalid input" });
    }

    const [existing] = await db.query("SELECT * FROM users WHERE email=?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.json({ success: false, message: "Email is already registed" });
    }

    const harshedPassword = await bcrypt.hash(password, 12);

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.json({ success: true, message: "Registration successful" });
  } catch (err) {
    console.error("Register error", err.message);
    res.status(500);
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out" });
  });
});

app.get("/api/messages", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT m.id, m.subject, m.body, u.name AS sender_name, m.created_at
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_id = ?
       ORDER BY m.created_at DESC
       LIMIT 5`,
      [req.session.userId]
    );

    res.json({ success: true, messages: rows });
  } catch (err) {
    console.error("Messages fetch error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/messages/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await getDB().query(
      `SELECT m.*, 
              s.name AS sender_name, 
              r.name AS receiver_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE m.id = ? AND m.receiver_id = ?`,
      [id, req.session.userId]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/messages", authMiddleware, async (req, res) => {
  try {
    const { receiverEmail, subject, body } = req.body;
    const db = getDB();

    // Validate input
    if (!receiverEmail || !body) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver and body are required" });
    }

    // Find receiver by email
    const [receiver] = await db.query("SELECT id FROM users WHERE email = ?", [
      receiverEmail,
    ]);

    if (receiver.length === 0) {
      return res.json({ success: false, message: "Receiver not found" });
    }

    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, subject, body, created_at) VALUES (?, ?, ?, ?, NOW())",
      [req.session.userId, receiver[0].id, subject || "", body]
    );

    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Send message error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.listen(3000, () => console.log(`Server running on http://localhost:3000`));
