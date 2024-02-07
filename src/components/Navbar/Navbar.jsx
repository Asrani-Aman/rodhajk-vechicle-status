import React, { useState } from "react";
import { BsPerson } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPinterest,
  FaYoutube,
} from "react-icons/fa";
import Logo from "../../assets/LOGO.png";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [logo, setLogo] = useState(false);
  const navigate = useNavigate();

  const handleNav = () => {
    setNav(!nav);
    setLogo(!logo);
  };

  function handleClick(myLink) {
    window.location.href = myLink;
  }

  const goToHome = () => {
    // Redirect to Rodhak website
    window.location.href = "https://www.dndrodhak.in/";
  };

  return (
    <div className="flex w-full justify-between items-center h-20 px-4 absolute z-10 text-white">
      <div>
        <h1 onClick={handleNav} className={logo ? "hidden" : "block"}>
          <img
            src={Logo}
            className="logoimage"
            alt="logoImg"
            onClick={(e) => {
              e.preventDefault();
              handleClick("https://dndrodhak.in/");
            }}
          ></img>
        </h1>
      </div>

      <div className="hidden md:flex">
        <button
          onClick={goToHome}
          className="cursor-pointer bg-orange-500 text-white py-2 px-4 rounded-full"
          style={{ width: "100px", height: "40px" }}
        >
          Home
        </button>
        {/* <BiSearch className="" size={20} />
        <BsPerson size={20} /> */}
      </div>

      {/* Hamburger */}
      <div onClick={handleNav} className="md:hidden z-10">
        {nav ? (
          <AiOutlineClose className="text-black" size={20} />
        ) : (
          <HiOutlineMenuAlt4 size={20} />
        )}
      </div>

      {/* Mobile menu dropdown */}
      <div
        onClick={handleNav}
        className={
          nav
            ? "absolute text-black left-0 top-0 w-full bg-gray-100/90 px-4 py-7 flex flex-col"
            : "absolute left-[-100%]"
        }
      >
        <button onClick={goToHome} className="cursor-pointer">
          Home
        </button>
      </div>
    </div>
  );
};

export default Navbar;
