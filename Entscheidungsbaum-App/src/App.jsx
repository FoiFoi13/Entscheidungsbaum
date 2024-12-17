import React from "react";
import Startseite from "./components/Startseite";
import Spiel from "./components/Spiel";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Startseite />} />
        <Route path="/ort?id" element={<Spiel />} /> 
        <Route path="/ort" element={<Startseite />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;