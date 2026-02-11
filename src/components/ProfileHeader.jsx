import React from "react";


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
