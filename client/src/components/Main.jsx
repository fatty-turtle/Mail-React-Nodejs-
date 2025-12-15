import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Main.css";

export default function Main() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    fetch("http://localhost:3000/api/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Fetch messages
  useEffect(() => {
    fetch("http://localhost:3000/api/messages", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.messages);
        }
      });
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  return (
    <>
      <div className="main-container">
        {/* Header */}
        <header className="header">
          <h2>Welcome, {user ? user.name : "..."}</h2>
          <button onClick={handleLogout}>Logout</button>
        </header>

        {/* Body */}
        <main className="body">
          <button onClick={() => navigate("/write-mail")}>
            Write New Mail
          </button>

          <h3>Your Latest Messages</h3>
          <ul className="messages">
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <li key={msg.id} className="message">
                  <Link to={`/letter/${msg.id}`}>
                    <strong>{msg.subject || "(No subject)"}</strong> from{" "}
                    {msg.sender_name} <br />
                    <span>{msg.body.slice(0, 50)}...</span> <br />
                    <small>{new Date(msg.created_at).toLocaleString()}</small>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </main>
      </div>
    </>
  );
}
