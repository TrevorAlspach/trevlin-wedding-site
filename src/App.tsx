import { Link, useLocation } from "react-router-dom";
import roTooFat from "./assets/ro_too_fat.jpg";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import AppRoutes from "./AppRoutes";
import { ChatWidget } from "./chat/components/ChatWidget";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isChatPage = location.pathname === "/chat";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: isHomePage ? `url(${roTooFat})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: isHomePage ? undefined : "background.default",
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: "rgba(10, 21, 9, 0.484)",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "1.25rem",
              }}
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/registry"
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "1.25rem",
              }}
            >
              Registry
            </Button>
            <Button
              component={Link}
              to="/faq"
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "1.25rem",
              }}
            >
              FAQs
            </Button>
            <Button
              component={Link}
              to="/chat"
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "1.25rem",
              }}
            >
              Chat
            </Button>
          </Box>
          <Button
            component={Link}
            to="/rsvp"
            sx={{ color: "white", textTransform: "none", fontSize: "1.25rem" }}
          >
            RSVP
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          justifyContent: isChatPage ? "stretch" : "center",
          alignItems: isChatPage ? "stretch" : "center",
          minHeight: "calc(100vh - 64px)",
          color: isHomePage ? "white" : "text.primary",
          textAlign: isChatPage ? "left" : "center",
        }}
      >
        <AppRoutes />
      </Box>
      <ChatWidget />
    </Box>
  );
}

export default App;
