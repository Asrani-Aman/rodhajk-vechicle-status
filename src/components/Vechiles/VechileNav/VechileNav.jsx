import React from "react";
import Logo from "../../../assets/LOGO.png";
import "./VechileNav.css";

const VechileNav = () => {
  return (
    <div>
      <nav>
        <div>
          <img className="logoImg" src={Logo} alt="logImg"></img>
        </div>
        <div className="opertorName">
          <p>HIMRAAHI</p>
        </div>
      </nav>
    </div>
  );
};

export default VechileNav;
