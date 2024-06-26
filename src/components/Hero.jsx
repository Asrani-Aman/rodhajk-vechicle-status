import React from "react";
import { AiOutlineSearch } from "react-icons/ai";
import bgvdo from "../assets/pexels-athena-3010433-1920x1080-24fps.mp4";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="w-full h-screen relative">
        <video
          className="w-full h-full object-cover"
          src={bgvdo}
          autoPlay
          loop
          muted
        />
        <div className="absolute w-full h-full top-0 left-0 bg-gray-900/30"></div>
        <div className="absolute top-0 w-full h-full flex flex-col justify-center text-center text-white p-4">
          <h1>SEARCH FOR BUSES</h1>
          <h2 className="py-4">HERE !!</h2>
          <form
            className="flex-col justify-center items-center max-w-[300px] mx-auto w-full  text-black "
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/vehicles");
                }}
                className="bg-blue-500 text-white py-2 px-12 rounded-full"
              >
                START
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Hero;
