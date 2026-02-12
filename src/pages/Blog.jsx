import React from "react";
import Section from "../components/Section";
import Card from "../components/Card";

const posts = [
  { title: "My First Post", slug: "first-post" },
  { title: "Creating AdamsVerse", slug: "adamsverse" },
];

export default function Blog() {
  return (
    <div className="page-container">
      <Section title="Blog">
        {posts.map((post) => (
          <Card
            key={post.slug}
            icon="fas fa-newspaper"
            text={post.title}
            link={`/blog/${post.slug}`}
            fullWidth
          />
        ))}
      </Section>
    </div>
  );
}
