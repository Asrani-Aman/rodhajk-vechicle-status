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
const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [logo, setLogo] = useState(false);
  const handleNav = () => {
    setNav(!nav);
    setLogo(!logo);
  };

  function handleClick(myLink) {
    window.location.href = myLink;
  }

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

              handleClick("https://rodhka-main.onrender.com");
            }}
          ></img>
        </h1>
      </div>
      <ul className="hidden md:flex">
        <li
          onClick={(e) => {
            e.preventDefault();

            handleClick("https://rodhka-main.onrender.com");
          }}
        >
          Home
        </li>
        <li
          onClick={(e) => {
            e.preventDefault();

            handleClick("https://rodhka-main.onrender.com");
          }}
        >
          About
        </li>
        <li
          onClick={(e) => {
            e.preventDefault();

            handleClick("https://rodhka-main.onrender.com");
          }}
        >
          Testimonials
        </li>
        <li
          onClick={(e) => {
            e.preventDefault();

            handleClick("https://rodhka-main.onrender.com");
          }}
        >
          Contact us
        </li>
        {/* <li>Book</li> */}
      </ul>
      <div className="hidden md:flex">
        <BiSearch className="" size={20} />
        <BsPerson size={20} />
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
        <ul>
          <h1>RODHAK</h1>
          <li className="border-b">Home</li>
          <li className="border-b">About</li>
          <li className="border-b">Testimonials</li>
          <li className="border-b">Contact us</li>
          {/* <li className="border-b">Book</li> */}
          <div className="flex flex-col">
            {/* <button className="my-6">Search</button>
            <button>Account</button> */}
          </div>
          <div className="flex justify-between my-6">
            <FaFacebook className="icon" />
            <FaTwitter className="icon" />
            <FaYoutube className="icon" />
            <FaPinterest className="icon" />
            <FaInstagram className="icon" />
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
