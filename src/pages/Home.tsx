import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Link } from "react-router-dom";
import wideGoobers from "../assets/widegoobers.jpg";
import Nav from "../components/Nav";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";
const BUTTER = "#f7d076";
const INK = "#26311c";
const BEIGE = "#e9edc6";

const VENUE_ADDRESS = "963 Edgewood Ave NE, Atlanta, GA 30307";
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_ADDRESS)}`;
const CALENDAR_URL = new URL("https://calendar.google.com/calendar/render");
CALENDAR_URL.search = new URLSearchParams({
  action: "TEMPLATE",
  text: "Trevor & Kaitlin's Wedding",
  dates: "20270417T210000Z/20270418T020000Z",
  location: VENUE_ADDRESS,
  details:
    "Wedding ceremony and reception at The Trolley Barn. Please arrive by 4:30 PM. Cocktail attire.",
}).toString();

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
          <Box
            component="span"
            sx={{ color: CORAL, fontStyle: "italic", px: 1.5 }}
          >
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

      {/* Wedding day schedule */}
      <Box
        component="section"
        sx={{
          color: INK,
          backgroundColor: BEIGE,
          py: { xs: 8, md: 11 },
          px: 2,
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: { xs: "0.72rem", sm: "0.8rem" },
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              mb: { xs: 4, md: 5 },
            }}
          >
            Trevor & Kaitlin's Wedding Day
          </Typography>

          <Typography
            component="h2"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "2.45rem", sm: "3.5rem", md: "4rem" },
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.05,
              mb: 3,
            }}
          >
            Saturday, April 17, 2027
          </Typography>

          <FavoriteBorderRoundedIcon
            aria-hidden="true"
            sx={{ color: CORAL, fontSize: 38, mb: 2.5 }}
          />

          <Typography
            component="h3"
            sx={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: { xs: "1.25rem", sm: "1.45rem" },
              fontWeight: 700,
              mb: 0.75,
            }}
          >
            Wedding Ceremony & Reception
          </Typography>
          <Typography
            sx={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.95rem" }}
          >
            5:00–10:00 PM
          </Typography>
          <Typography
            sx={{
              color: CORAL,
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              mt: 0.5,
              mb: 3,
            }}
          >
            Please arrive by 4:30 PM
          </Typography>

          <Typography
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.35rem",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            The Trolley Barn
          </Typography>
          <Typography
            component="a"
            href={MAP_URL}
            target="_blank"
            rel="noreferrer"
            sx={{
              display: "inline-block",
              color: INK,
              fontFamily: "Montserrat, sans-serif",
              fontSize: { xs: "0.82rem", sm: "0.9rem" },
              fontWeight: 700,
              textDecorationColor: CORAL,
              textUnderlineOffset: "4px",
              mb: 3,
            }}
          >
            {VENUE_ADDRESS}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: { xs: 1, sm: 2.5 },
              mb: 4,
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.86rem",
            }}
          >
            <Typography component="span" sx={{ font: "inherit" }}>
              Cocktail Attire
            </Typography>
            <Typography
              component="span"
              aria-hidden="true"
              sx={{ color: CORAL }}
            >
              •
            </Typography>
            <Typography component="span" sx={{ font: "inherit" }}>
              Buffet Dinner at 6:30 PM
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              maxWidth: 520,
              mx: "auto",
            }}
          >
            <Button
              component="a"
              href={MAP_URL}
              target="_blank"
              rel="noreferrer"
              startIcon={<LocationOnOutlinedIcon />}
              sx={{
                py: 1.4,
                borderRadius: 0,
                color: IVORY,
                backgroundColor: INK,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { backgroundColor: "#3c4b2c" },
              }}
            >
              Map
            </Button>
            <Button
              component="a"
              href={CALENDAR_URL.toString()}
              target="_blank"
              rel="noreferrer"
              startIcon={<CalendarMonthOutlinedIcon />}
              sx={{
                py: 1.4,
                borderRadius: 0,
                color: IVORY,
                backgroundColor: INK,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { backgroundColor: "#3c4b2c" },
              }}
            >
              Add to calendar
            </Button>
          </Box>

          <Typography
            sx={{
              mt: 3,
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.76rem",
              lineHeight: 1.6,
              opacity: 0.72,
            }}
          >
            Free street parking and nearby lots are available. Uber and MARTA
            are also options.
          </Typography>
        </Container>
      </Box>

      {/* Our Story section */}
      <Box sx={{ backgroundColor: "rgba(50, 60, 30, 0.35)" }}>
        <Container
          maxWidth="md"
          sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}
        >
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
      <Container
        maxWidth="md"
        sx={{ py: { xs: 8, md: 10 }, textAlign: "center" }}
      >
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
