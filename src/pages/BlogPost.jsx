import React from "react";
import { useParams } from "react-router-dom";

const content = {
  "first-post": {
    title: "My First Post",
    body: "This is the content of my very first blog post.",
  },
  adamsverse: {
    title: "Creating AdamsVerse",
    body: "Building a Super.so-inspired React site with custom branding.",
  },
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = content[slug];

  if (!post) return <p>Post not found.</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>{post.title}</h1>
      <p style={{ marginTop: "16px", lineHeight: 1.6 }}>{post.body}</p>
    </div>
  );
}
