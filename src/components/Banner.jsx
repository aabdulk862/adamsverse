import React from "react";
import BannerImage from "../assets/images/banner.png";

export default function Banner() {
  return (
  <div className="container">
    <div className="banner">
      <img src={BannerImage} alt="Adams Verse Banner" />
    </div>
  </div>
);
}
