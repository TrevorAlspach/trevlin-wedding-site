import React from "react";
import { Box, Typography, Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";
const BUTTER = "#f7d076";

const REGISTRY_URL = "https://www.amazon.com/wedding/share/trevlin420";

const Registry: React.FC = () => {
  return (
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", py: { xs: 6, md: 8 }, px: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
        <Typography
          sx={{
            color: BUTTER,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontSize: "1.1rem",
            mb: 1,
          }}
        >
          With love and gratitude
        </Typography>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: { xs: "3rem", md: "4.5rem" },
            letterSpacing: "0.02em",
            mb: 3,
          }}
        >
          Registry
        </Typography>
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "1.2rem", md: "1.4rem" },
            fontWeight: 300,
            opacity: 0.9,
            maxWidth: 640,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          Your presence at our wedding is the greatest gift of all. For those who
          wish to celebrate with something extra, we've put together a small
          registry below.
        </Typography>
      </Box>

      {/* Registry cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr" },
          gap: 4,
          maxWidth: 720,
          mx: "auto",
        }}
      >
        <RegistryCard
          name="Amazon"
          tagline="Our main registry — household, kitchen, and a few wishlist items"
          url={REGISTRY_URL}
        />
      </Box>

      {/* Closing note */}
      <Box sx={{ textAlign: "center", mt: { xs: 8, md: 10 } }}>
        <FavoriteBorderIcon sx={{ color: CORAL, fontSize: "2rem", mb: 2 }} />
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            fontWeight: 300,
            opacity: 0.9,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Thank you for being part of our story.
        </Typography>
      </Box>
    </Box>
  );
};

interface RegistryCardProps {
  name: string;
  tagline: string;
  url: string;
}

const RegistryCard: React.FC<RegistryCardProps> = ({ name, tagline, url }) => (
  <Box
    sx={{
      backgroundColor: "rgba(245, 239, 224, 0.08)",
      border: "1px solid rgba(245, 239, 224, 0.25)",
      borderRadius: 0,
      px: { xs: 3, md: 5 },
      py: { xs: 4, md: 5 },
      textAlign: "center",
      transition: "background-color 0.2s, border-color 0.2s",
      "&:hover": {
        backgroundColor: "rgba(245, 239, 224, 0.12)",
        borderColor: "rgba(245, 239, 224, 0.4)",
      },
    }}
  >
    <Typography
      sx={{
        color: BUTTER,
        fontFamily: "'Cormorant Garamond', serif",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        fontSize: "0.95rem",
        mb: 1,
      }}
    >
      Registered at
    </Typography>
    <Typography
      sx={{
        color: IVORY,
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 300,
        fontSize: { xs: "2.5rem", md: "3.25rem" },
        mb: 2,
        letterSpacing: "0.02em",
      }}
    >
      {name}
    </Typography>
    <Typography
      sx={{
        color: IVORY,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.15rem",
        opacity: 0.85,
        mb: 4,
        maxWidth: 480,
        mx: "auto",
        lineHeight: 1.5,
      }}
    >
      {tagline}
    </Typography>
    <Button
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      variant="contained"
      size="large"
      endIcon={<OpenInNewIcon />}
      sx={{
        color: "#3a3a1a",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.1rem",
        fontWeight: 600,
        letterSpacing: "0.15em",
        backgroundColor: CORAL,
        "&:hover": { backgroundColor: CORAL_HOVER },
        boxShadow: "none",
        textTransform: "uppercase",
        px: 4,
        py: 1.25,
        borderRadius: 0,
      }}
    >
      View Registry
    </Button>
  </Box>
);

export default Registry;
