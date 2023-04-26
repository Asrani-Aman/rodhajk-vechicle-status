import React from "react";

// import Footer from "./components/Footer";
import Hero from "./components/Hero";
// import Navbar from "./components/Navbar/Navbar";
import Vechile from "./components/Vechiles/Vechile";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/vehicles" element={<Vechile />} />
        <Route path="/" element={<Hero />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
