import React, { useState } from "react";
import "../components/Community.css";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState("");

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newPost = {
      id: Date.now(),
      username: "Anonymous",
      content: input,
      timestamp: new Date().toLocaleString(),
      replies: [],
    };
    setPosts([newPost, ...posts]);
    setInput("");
  };

  const handleReplySubmit = (postId, replyText, setReplyInput) => {
    if (!replyText.trim()) return;
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [
            ...post.replies,
            {
              id: Date.now(),
              username: "Anonymous",
              content: replyText,
              timestamp: new Date().toLocaleString(),
            },
          ],
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    setReplyInput("");
  };

  return (
    <div className="community-page">
      <h1>Community Forum</h1>

      {/* Post Form */}
      <form onSubmit={handlePostSubmit} className="post-form">
        <textarea
          placeholder="Share something with the community..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>

      {/* Posts */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet. Be the first to post!</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} handleReplySubmit={handleReplySubmit} />)
        )}
      </div>
    </div>
  );
}

function PostCard({ post, handleReplySubmit }) {
  const [replyInput, setReplyInput] = useState("");
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="post-card">
      <div className="post-header">
        <span className="username">{post.username}</span>
        <span className="timestamp">{post.timestamp}</span>
      </div>
      <div className="post-content">{post.content}</div>
      <button className="reply-button" onClick={() => setShowReply(!showReply)}>
        {showReply ? "Cancel" : "Reply"}
      </button>

      {showReply && (
        <div className="reply-form">
          <textarea
            placeholder="Write a reply..."
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
          />
          <button onClick={() => handleReplySubmit(post.id, replyInput, setReplyInput)}>Reply</button>
        </div>
      )}

      {/* Replies */}
      <div className="replies">
        {post.replies.map((reply) => (
          <div key={reply.id} className="reply-card">
            <div className="post-header">
              <span className="username">{reply.username}</span>
              <span className="timestamp">{reply.timestamp}</span>
            </div>
            <div className="post-content">{reply.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
