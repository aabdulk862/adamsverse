import React from "react";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

export default function ProfileHeader() {
  return (
    <div className="profile-header">
      <div className="roles">
        <h1>
          <b>Web Development </b>💻
        </h1>
        <h1>
          <b>Content Creation </b>📲
        </h1>
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
