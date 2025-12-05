"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";

interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
}

export default function Home() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);

  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        const data = await res.json();
        // Resend list API returns { data: [...] }
        setEmails(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch emails", error);
    } finally {
      setLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, message }),
      });

      if (res.ok) {
        setStatus("Email sent successfully!");
        setTo("");
        setSubject("");
        setMessage("");
        fetchEmails(); // Refresh list
      } else {
        const data = await res.json();
        setStatus(`Error: ${data.error || "Failed to send email"}`);
      }
    } catch (error) {
      setStatus("Error: Failed to send email");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Vortile Internal Email Provider</h1>
        <UserButton />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <h2>Send Email</h2>
          <form onSubmit={sendEmail} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>To:</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem", minHeight: "100px" }}
              />
            </div>
            <button type="submit" style={{ padding: "0.75rem", cursor: "pointer", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px" }}>
              Send Email
            </button>
          </form>
          {status && <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{status}</p>}
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Recent Emails</h2>
            <button onClick={fetchEmails} style={{ padding: "0.5rem", cursor: "pointer" }}>Refresh</button>
          </div>
          
          {loadingEmails ? (
            <p>Loading...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "500px", overflowY: "auto" }}>
              {emails.length === 0 ? (
                <p>No emails found.</p>
              ) : (
                emails.map((email) => (
                  <div key={email.id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "4px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>{email.subject}</div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>To: {email.to.join(", ")}</div>
                    <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.5rem" }}>
                      {new Date(email.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
