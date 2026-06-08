import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AppRoutes from "./AppRoutes";
import { ChatWidget } from "./chat/components/ChatWidget";
import Nav from "./components/Nav";

const OLIVE = "#5c6e3a";
const IVORY = "#f5efe0";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isChatPage = location.pathname === "/chat";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: OLIVE,
        color: IVORY,
      }}
    >
      {!isHomePage && <Nav />}

      <Box
        sx={{
          display: "flex",
          justifyContent: isChatPage || isHomePage ? "stretch" : "center",
          alignItems: isChatPage ? "stretch" : "flex-start",
          minHeight: isHomePage ? "auto" : "calc(100vh - 80px)",
          color: IVORY,
          textAlign: isChatPage || isHomePage ? "left" : "center",
          width: "100%",
        }}
      >
        <AppRoutes />
      </Box>
      <ChatWidget />
    </Box>
  );
}

export default App;
