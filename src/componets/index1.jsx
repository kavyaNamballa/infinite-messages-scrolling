import { useEffect, useState, useCallback } from "react";
import './styles.css';

export default function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [pageToken, setPageToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  },[]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const url = `https://message-list.appspot.com/messages${
      pageToken ? `?pageToken=${pageToken}` : ""
    }`;
    const response = await fetch(url);
    const data = await response.json();
    setMsgs((prevMsgs) => [...prevMsgs, ...data.messages]);
    setPageToken(data.pageToken);
    setLoading(false);
  }, [pageToken]);

  const timeAgo = (date) => {
    const now = new Date();
    const updatedTime = new Date(date);
    const diffInSeconds = Math.floor((now - updatedTime) / 1000);

    const units = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (let unit of units) {
      const interval = Math.floor(diffInSeconds / unit.seconds);
      if (interval >= 1) {
        return `${interval} ${unit.label}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  const handleScroll = useCallback(() => {
    if (loading) return; // Avoid triggering fetch if already loading
    const nearBottom =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 200; // Buffer of 200px from bottom
    if (nearBottom) {
      fetchMessages();
    }
  }, [fetchMessages, loading]);

  return (
    <div className="wrapper">
      <div className="messages">
        {msgs && msgs.length > 0 ? (
          msgs.map((msg) => (
            <div className="item" key={msg.id}>
              <div className="author">
                <img
                  src={ "https://message-list.appspot.com/"+ msg.author.photoUrl}
                  alt={msg.author.name}
                />
                <div className="nameDetails">
                  <h3>{msg.author.name}</h3>
                  <small>{timeAgo(msg.updated)}</small>
                </div>
              </div>
              <span>{msg.content}</span>
            </div>
          ))
        ) : (
          <div>No data found</div>
        )}
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
}
