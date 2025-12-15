import { useState, useEffect } from "react";
import { useParams, useNavigate, data } from "react-router-dom";
import "./Letter.css";

export default function Letter() {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3000/api/messages/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLetter(data.message);
        } else {
          setLetter({ error: "Message not found" });
        }
      })
      .catch(() => navigate("/"));
  }, [id, navigate]);

  if (!letter) return <p>Loading...</p>;
  if (letter.error) return <p>{letter.error}</p>;
  return (
    <>
      <div className="letter-container">
        <button onClick={() => navigate("/main")}>← Back</button>
        <h2>{letter.subject || "(No subject)"}</h2>
        <p>
          <strong>From:</strong> {letter.sender_name} <br />
          <strong>To:</strong> {letter.receiver_name}
        </p>
        <p>
          <em>{new Date(letter.created_at).toLocaleString()}</em>
        </p>
        <hr />
        <p>{letter.body}</p>
        {letter.attachment_path && (
          <div>
            {/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(letter.attachment_path) ? (
              <img
                src={`http://localhost:3000/uploads/${letter.attachment_path}`}
                alt="Attachment"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            ) : (
              <p>
                📎{" "}
                <a
                  href={`http://localhost:3000/uploads/${letter.attachment_path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download attachment
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
