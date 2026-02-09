import React from "react";
import BannerImage from "../assets/images/banner.png";

export default function Banner() {
  return (
    <div className="banner">
      <img src="src/assets/images/banner.png" alt="Adams Verse Banner" />
      <img
        src={BannerImage}
        srcSet={`${BannerImage} 1x, ${HighResBannerImage} 2x`}
        alt="Banner"
        loading="lazy"
      />
    </div>
  );
}
