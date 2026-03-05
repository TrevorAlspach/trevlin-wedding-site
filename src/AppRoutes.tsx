import { Routes, Route } from "react-router-dom";
import Registry from "./pages/Registry";
import Home from "./pages/Home";
import FAQ from "./pages/Faq";
import Rsvp from "./pages/Rsvp";
import ChatPage from "./pages/ChatPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registry" element={<Registry />} />
      <Route path="/rsvp" element={<Rsvp />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}

export default AppRoutes;
