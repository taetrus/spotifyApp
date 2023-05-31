import "./App.css";

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import CallbackPage from "./CallbackPage";
import PlaylistsPage from "./PlaylistPage";

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/callbackpage" element={<CallbackPage />} />
          <Route path="/start" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
      {/* <PlaylistsPage></PlaylistsPage> */}
    </>
  );
};

export default App;

/*export default function App() {
  return (
    <main>
      React ⚛️ + Vite ⚡ + Replit 🌀
    </main>
  )
}*/
