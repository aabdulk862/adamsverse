import React from "react";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

export default function ProfileHeader() {
  return (
    <div className="profile-header">
      {/* Decorative Circles */}
      <span className="bg-circle circle-1"></span>
      <span className="bg-circle circle-2"></span>

      <div className="profile-identity">
        <h1 className="profile-title">Content • Community</h1>
        <p className="profile-subtitle">
          Building experiences, creating content, and connecting communities.
        </p>
      </div>

      <div className="roles">
        <span className="role-pill">Web Development 💻</span>
        <span className="role-pill">Content Creation 📲</span>
        <span className="role-pill">Community Engagement 🌐</span>
      </div>
    </div>
  );
}
