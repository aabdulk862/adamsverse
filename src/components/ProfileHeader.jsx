import React from "react";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

export default function ProfileHeader() {
  return (
    <div className="profile-header">
      <div className="roles">
        <span>
          <b>Web Development </b>💻
        </span>
        <span>
          <b>Content Creation </b>📲
        </span>
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
