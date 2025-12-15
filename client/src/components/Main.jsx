import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

export default function Main() {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile to get userId
    fetch("http://localhost:3000/api/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserId(data.user.id);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));

    // Fetch messages
    fetch("http://localhost:3000/api/messages", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.messages);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleLogout = () => {
    fetch("http://localhost:3000/api/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => navigate("/login"));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      fetch(`http://localhost:3000/api/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Remove the message from the list
            setMessages(messages.filter((msg) => msg.id !== id));
          } else {
            alert("Failed to delete message: " + data.message);
          }
        })
        .catch(() => alert("Error deleting message"));
    }
  };

  return (
    <div className="main-container">
      <div className="header">
        <h1>Mail</h1>
        <div>
          <button onClick={() => navigate("/write-mail")}>Write Mail</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="body">
        <ul className="messages">
          {messages.map((msg) => {
            const isSent = msg.sender_id === userId;
            return (
              <li key={msg.id} className="message">
                <strong>{msg.subject || "(No subject)"}</strong>
                <br />
                <small>
                  {isSent
                    ? `To: ${msg.receiver_name}`
                    : `From: ${msg.sender_name}`}{" "}
                  | {new Date(msg.created_at).toLocaleString()}
                </small>
                <br />
                <button onClick={() => navigate(`/letter/${msg.id}`)}>
                  View
                </button>
                <button onClick={() => handleDelete(msg.id)}>Delete</button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
