import React from "react";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

export default function ProfileHeader() {
  return (
    <div className="profile-header">
      <div className="profile-identity">
        <h1 className="profile-title">AdamsVerse</h1>
        <p className="profile-tagline">Code • Content • Community</p>
      </div>

      <div className="roles">
        <span className="role-pill">Web Development 💻</span>
        <span className="role-pill">Content Creation 📲</span>
      </div>

      <div className="badges">
        <span className="badge">
          <img src={usa} alt="USA" className="flag" />
        </span>
        <span className="badge">
          <img src={eritrea} alt="Eritrea" className="flag" />
        </span>
      </div>
    </div>
  );
}
