import React from "react";
import { Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

const IVORY = "#f5efe0";

const linkSx = {
  color: IVORY,
  textTransform: "none",
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "1.15rem",
  letterSpacing: "0.18em",
  px: { xs: 1.5, md: 2.5 },
  borderRadius: 0,
  "&:hover": {
    backgroundColor: "transparent",
    color: "#ff9d6c",
  },
};

const Nav: React.FC = () => {
  return (
    <Box
      component="nav"
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 0.5, md: 2 },
        py: 2.5,
        borderTop: "1px solid rgba(245, 239, 224, 0.25)",
        borderBottom: "1px solid rgba(245, 239, 224, 0.25)",
        flexWrap: "wrap",
        textTransform: "uppercase",
      }}
    >
      <Button component={Link} to="/" sx={linkSx}>Home</Button>
      <Button component={Link} to="/registry" sx={linkSx}>Registry</Button>
      <Button component={Link} to="/faq" sx={linkSx}>FAQs</Button>
      <Button component={Link} to="/chat" sx={linkSx}>TaroBot</Button>
      <Button component={Link} to="/rsvp" sx={linkSx}>RSVP</Button>
    </Box>
  );
};

export default Nav;
