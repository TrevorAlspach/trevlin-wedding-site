import { Routes, Route } from "react-router-dom";
import Registry from "./pages/Registry";
import Home from "./pages/Home";
import FAQ from "./pages/Faq";
import Rsvp from "./pages/Rsvp";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registry" element={<Registry />} />
      <Route path="/rsvp" element={<Rsvp />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  );
}

export default AppRoutes;
