import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WriteMail() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();

    if (!to || !body) {
      setError("Recipient and body are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverEmail: to, // match backend name
          subject,
          body,
        }),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/main");
      } else {
        setError(data.message || "Failed to send message.");
      }
    } catch (err) {
      setError("Server error.");
    }
  };

  return (
    <div className="write-container">
      <h2>Write a New Mail</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSend} className="write-form">
        <input
          type="email"
          placeholder="Recipient Email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Write your message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <div className="actions">
          <button type="submit">Send</button>
          <button type="button" onClick={() => navigate("/main")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
