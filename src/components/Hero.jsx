import React from "react";
import { AiOutlineSearch } from "react-icons/ai";
// import beachVid from '../assets/beachVid.mp4';
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
            className="flex justify-between items-center max-w-[700px] mx-auto w-full border p-1
          rounded-md text-black bg-gray-100/90"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              {/* <input
              className="bg-transparent w-[300px] sm:w-[400px] font-[Poppins] focus:outline-none
                  "
              type="text"
              placeholder="Search Destinations"
            /> */}
              <select
                id="cars"
                name="cars"
                className="bg-transparent w-[300px] sm:w-[400px] font-[Poppins] focus:outline-none"
              >
                <option value="volvo">HRTC</option>
                <option value="saab">TRAVEL COMPANY Name</option>
                <option value="fiat">TRAVEL COMPANY Name</option>
                <option value="audi">TRAVEL COMPANY Name</option>
                <option value="audi">TRAVEL COMPANY Name</option>
                <option value="audi">TRAVEL COMPANY Name</option>
                <option value="audi">TRAVEL COMPANY Name</option>
              </select>
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/vehicles");
                }}
              >
                <AiOutlineSearch
                  size={20}
                  className="icon"
                  style={{ color: "#ffffff" }}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default Hero;
