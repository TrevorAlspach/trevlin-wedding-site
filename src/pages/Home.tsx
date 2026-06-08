import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";
import wideGoobers from "../assets/widegoobers.jpg";
import Nav from "../components/Nav";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";
const BUTTER = "#f7d076";

const Home: React.FC = () => {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Names header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          pt: { xs: 6, md: 10 },
          pb: { xs: 4, md: 6 },
          px: 3,
          gap: 2,
        }}
      >
        <Typography
          sx={{
            color: BUTTER,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "1rem", md: "1.2rem" },
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          We're getting married
        </Typography>
        <Typography
          variant="h1"
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: { xs: "3.5rem", md: "6rem" },
            lineHeight: 1.05,
            letterSpacing: "0.02em",
          }}
        >
          Trevor
          <Box component="span" sx={{ color: CORAL, fontStyle: "italic", px: 1.5 }}>
            &
          </Box>
          Kaitlin
        </Typography>
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            fontWeight: 300,
            letterSpacing: "0.15em",
            opacity: 0.9,
          }}
        >
          April 17, 2027 · Atlanta, GA
        </Typography>
      </Box>

      {/* Nav below names */}
      <Nav />

      {/* Full-width picture */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 320, md: 520 },
          backgroundImage: `url(${wideGoobers})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Save the Date section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Typography
          sx={{
            color: BUTTER,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            mb: 2,
            fontSize: "1.1rem",
          }}
        >
          Save the Date
        </Typography>
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 300,
            mb: 2,
          }}
        >
          Coming Soon
        </Typography>
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.3rem",
            opacity: 0.85,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          We're finalizing the details. Check back soon — and in the meantime,
          please send your RSVP so we can plan accordingly.
        </Typography>
      </Container>

      {/* Our Story section */}
      <Box sx={{ backgroundColor: "rgba(50, 60, 30, 0.35)" }}>
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
          <Typography
            sx={{
              color: BUTTER,
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              mb: 2,
              fontSize: "1.1rem",
            }}
          >
            Our Story
          </Typography>
          <Typography
            sx={{
              color: IVORY,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 300,
              mb: 4,
            }}
          >
            How it began
          </Typography>
          <Typography
            sx={{
              color: IVORY,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem",
              opacity: 0.9,
              lineHeight: 1.7,
              maxWidth: 700,
              mx: "auto",
            }}
          >
            Add your story here — how you met, the proposal, what you love about
            each other. This is a placeholder you can fill in later.
          </Typography>
        </Container>
      </Box>

      {/* Footer CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 }, textAlign: "center" }}>
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "2rem", md: "2.75rem" },
            fontWeight: 300,
            mb: 3,
          }}
        >
          We can't wait to celebrate with you
        </Typography>
        <Button
          component={Link}
          to="/rsvp"
          variant="contained"
          size="large"
          sx={{
            color: "#3a3a1a",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.15rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            backgroundColor: CORAL,
            "&:hover": { backgroundColor: CORAL_HOVER },
            boxShadow: "none",
            textTransform: "uppercase",
            px: 5,
            py: 1.5,
            borderRadius: 0,
          }}
        >
          RSVP
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
