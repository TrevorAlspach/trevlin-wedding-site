import React from "react";
import { Box, Button, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";
const BUTTER = "#f7d076";
const INK = "#26311c";

const hotels = [
  {
    name: "Loews Atlanta Hotel",
    eyebrow: "Where we'll be staying · 50 rooms",
    description:
      "Stay with us at the Loews! Our room block includes 50 rooms at a discounted rate for wedding guests.",
    url: "https://www.loewshotels.com/atlanta-hotel/group-tranalspach-wedding-room-block",
  },
  {
    name: "Moxy + AC Midtown Atlanta",
    eyebrow: "10 rooms each · 20 rooms total",
    description:
      "Choose between the Moxy and AC Hotel in Midtown. We've reserved 10 rooms at each hotel at a discounted rate for wedding guests.",
    url: "https://www.marriott.com/event-reservations/reservation-link.mi?id=1784255237720&key=GRP&app=resvlink&_branch_match_id=1380215872398857711&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXTywo0MtNLCrKzC8p0UvOz9UvSi0uy0wtN7IHytiCODmZedlqmSm2huYWJkampkbG5uZGBmrZqZW27kEBanVFqWmpQO156fFJRfnlxalFts4ZRfm5qQAktQdDYQAAAA%3D%3D",
  },
] as const;

interface HotelCardProps {
  name: string;
  eyebrow: string;
  description: string;
  url: string;
}

const HotelCard: React.FC<HotelCardProps> = ({
  name,
  eyebrow,
  description,
  url,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "rgba(245, 239, 224, 0.08)",
      border: "1px solid rgba(245, 239, 224, 0.25)",
      px: { xs: 3, md: 4 },
      py: { xs: 4, md: 5 },
      textAlign: "center",
      transition: "background-color 0.2s, border-color 0.2s",
      "&:hover": {
        backgroundColor: "rgba(245, 239, 224, 0.12)",
        borderColor: "rgba(245, 239, 224, 0.42)",
      },
    }}
  >
    <Typography
      sx={{
        color: BUTTER,
        fontFamily: "'Cormorant Garamond', serif",
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        fontSize: "0.88rem",
        mb: 1.5,
      }}
    >
      {eyebrow}
    </Typography>
    <Typography
      component="h3"
      sx={{
        color: IVORY,
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 300,
        fontSize: { xs: "2.35rem", md: "2.75rem" },
        lineHeight: 1.05,
        mb: 2,
      }}
    >
      {name}
    </Typography>
    <Typography
      sx={{
        flexGrow: 1,
        color: IVORY,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.1rem",
        lineHeight: 1.55,
        opacity: 0.86,
        mb: 4,
      }}
    >
      {description}
    </Typography>
    <Button
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      endIcon={<OpenInNewIcon />}
      sx={{
        alignSelf: "center",
        color: INK,
        backgroundColor: CORAL,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1rem",
        fontWeight: 700,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        px: 3,
        py: 1.15,
        borderRadius: 0,
        boxShadow: "none",
        "&:hover": { backgroundColor: CORAL_HOVER },
      }}
    >
      Reserve a room
    </Button>
  </Box>
);

const Travel: React.FC = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        component="header"
        sx={{
          maxWidth: 1100,
          mx: "auto",
          py: { xs: 6, md: 8 },
          px: { xs: 2, md: 4 },
          textAlign: "center",
        }}
      >
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
          Welcome to Atlanta
        </Typography>
        <Typography
          component="h1"
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: { xs: "3rem", md: "4.5rem" },
            lineHeight: 1.05,
            mb: 3,
          }}
        >
          Travel
        </Typography>
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "1.2rem", md: "1.4rem" },
            fontWeight: 300,
            lineHeight: 1.6,
            opacity: 0.9,
            maxWidth: 680,
            mx: "auto",
          }}
        >
          Helpful places to stay while you celebrate with us in Atlanta.
        </Typography>
      </Box>

      <Box
        component="section"
        aria-labelledby="hotels-heading"
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pb: { xs: 8, md: 11 },
        }}
      >
        <Typography
          id="hotels-heading"
          component="h2"
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 300,
            mb: 1,
            textAlign: "center",
          }}
        >
          Where to stay
        </Typography>
        <Typography
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.1rem",
            opacity: 0.78,
            mb: 4,
            maxWidth: 760,
            mx: "auto",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          We've reserved discounted room blocks for our guests at the Loews
          Atlanta and AC/Moxy Midtown Atlanta. Please make your reservation by{" "}
          <Box component="strong" sx={{ color: BUTTER, fontWeight: 600 }}>
            March 16
          </Box>{" "}
          to receive the special rate. We can't wait to celebrate with you!
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 3,
            alignItems: "stretch",
            maxWidth: 960,
            mx: "auto",
          }}
        >
          {hotels.map((hotel) => (
            <HotelCard key={hotel.name} {...hotel} />
          ))}
        </Box>
      </Box>

    </Box>
  );
};

export default Travel;
