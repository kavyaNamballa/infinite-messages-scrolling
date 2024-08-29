import { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSwipeable } from "react-swipeable";

export default function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [pageToken, setPageToken] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // console.log(msgs.length);

  const fetchMessages = async () => {
    if (!hasMore) return;

    // console.log("inside fetchMessagesfunction ",msgs);

    const url = `https://message-list.appspot.com/messages${
      pageToken ? `?pageToken=${pageToken}` : ""
    }`;
    const response = await fetch(url);
    const data = await response.json();
    setMsgs([...msgs, ...data.messages]);
    if(data.messages.length === 0) setHasMore(false);
    setPageToken(data.pageToken);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDeleteMessage = (id) => {
    setMsgs((msgs)=>(msgs.filter((msg) => msg.id !== id)));
  };

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

  const MessageItem = ({ msg,handleDeleteMessage}) => {
    const swipeHandlers = useSwipeable({
      onSwipedLeft: () => handleDeleteMessage(msg.id),
      onSwipedRight: () => handleDeleteMessage(msg.id),
      preventDefaultTouchmoveEvent: true,
      trackMouse: true,
    });

    return (
      <div className="item" {...swipeHandlers}>
        <div className="author">
          <img
            src={"https://message-list.appspot.com/" + msg.author.photoUrl}
            alt={msg.author.name}
          />
          <div className="nameDetails">
            <h3>{msg.author.name}</h3>
            <small>{timeAgo(msg.updated)}</small>
          </div>
        </div>
        <li>{msg.content}</li>
      </div>
    );
  };

  return (
    <InfiniteScroll
      dataLength={msgs.length}
      next={fetchMessages}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
    >
      <div className="wrapper">
        <div className="messages">
          {msgs && msgs.length > 0 ? (
            msgs.map((msg) => <MessageItem key={msg.id} msg={msg} handleDeleteMessage={handleDeleteMessage}/>)
          ) : (
            <div>No data found</div>
          )}
        </div>
      </div>
    </InfiniteScroll>
  );
}
