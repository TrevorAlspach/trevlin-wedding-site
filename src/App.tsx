import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Registry from "./pages/Registry";
import Home from "./pages/Home";
import FAQ from "./pages/FAQ";
import Rsvp from "./pages/Rsvp";
import roTooFat from "./assets/ro_too_fat.jpg";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div
      className="hero min-h-screen bg-neutral"
      style={{
        backgroundImage: isHomePage ? `url(${roTooFat})` : undefined,
      }}
    >
      <div className="hero-overlay">
        <div className="navbar opacity-bar">
          <div className="navbar-start">
            <Link
              to="/"
              className="btn btn-ghost text-white normal-case text-xl"
            >
              Home
            </Link>
            <Link
              to="/registry"
              className="btn btn-ghost text-white normal-case text-xl "
            >
              Registry
            </Link>
            <Link
              to="/faq"
              className="btn text-white btn-ghost normal-case text-xl"
            >
              FAQs
            </Link>
          </div>
          <div className="navbar-center"></div>
          <div className="navbar-end">
            <Link
              to="/rsvp"
              className="btn text-white btn-ghost normal-case text-xl"
            >
              RSVP
            </Link>
          </div>
        </div>
      </div>
      <div className="hero-content text-neutral-content text-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/rsvp" element={<Rsvp />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
