import React from "react";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

export default function ProfileHeader() {
  return (
    <div className="profile-header">
      <div className="profile-identity">
        <h1 className="profile-title">Content • Community</h1>
      </div>

      <div className="roles">
        <span className="role-pill">Web Development 💻</span>
        <span className="role-pill">Content Creation 📲</span>
      </div>
    </div>
  );
}
