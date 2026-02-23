import React from "react";
import BannerImage from "../assets/images/banner2.jpeg";

export default function Banner() {
  return (
    <div className="banner">
      <img src={BannerImage} alt="Adams Verse Banner" />
    </div>
  );
}
