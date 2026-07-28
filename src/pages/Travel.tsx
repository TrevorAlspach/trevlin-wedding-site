import React from "react";
import { Box, Button, Typography } from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";
const BUTTER = "#f7d076";
const INK = "#26311c";
const BEIGE = "#e9edc6";

const hotels = [
  {
    name: "Wylie Hotel",
    eyebrow: "Old Fourth Ward",
    description:
      "A charming boutique stay on Ponce de Leon Avenue, close to the BeltLine, Ponce City Market, and plenty of neighborhood favorites.",
    url: "https://www.wyliehotel.com/",
  },
  {
    name: "Hotel Clermont",
    eyebrow: "Poncey-Highland",
    description:
      "A colorful Atlanta landmark with thoughtfully designed rooms, a rooftop, and an easy home base for exploring the east side.",
    url: "https://www.hotelclermont.com/",
  },
  {
    name: "FORTH Hotel",
    eyebrow: "Historic Fourth Ward",
    description:
      "A modern stay directly on the BeltLine's Eastside Trail, with restaurants, bars, a pool, and views of the Atlanta skyline.",
    url: "https://forthatlanta.com/hotel",
  },
] as const;

const thingsToDo = [
  {
    number: "01",
    name: "Atlanta BeltLine",
    category: "Walk & explore",
    description:
      "Take a stroll along the Eastside Trail for public art, patios, parks, and an easy path between some of Atlanta's liveliest neighborhoods.",
    url: "https://beltline.org/visitor-information/",
  },
  {
    number: "02",
    name: "Ponce City Market",
    category: "Eat & shop",
    description:
      "Wander the food hall and shops, grab a drink, or head up to the roof before stepping right onto the BeltLine.",
    url: "https://poncecitymarket.com/",
  },
  {
    number: "03",
    name: "Krog Street Market",
    category: "Local flavors",
    description:
      "Stop into this Inman Park food hall for coffee, cocktails, and a choose-your-own-adventure mix of local bites.",
    url: "https://krogstreetmarket.com/",
  },
  {
    number: "04",
    name: "Little Five Points",
    category: "Only in Atlanta",
    description:
      "Browse vintage shops, record stores, murals, and the wonderfully offbeat character of one of Atlanta's most iconic neighborhoods.",
    url: "https://littlefivepoints.net/",
  },
  {
    number: "05",
    name: "Atlanta Botanical Garden",
    category: "Slow afternoon",
    description:
      "Spend a few peaceful hours among the conservatories, seasonal gardens, and leafy paths beside Piedmont Park.",
    url: "https://atlantabg.org/",
  },
  {
    number: "06",
    name: "Martin Luther King, Jr. National Historical Park",
    category: "History & culture",
    description:
      "Visit Sweet Auburn to learn about Dr. King's life and legacy through the historic neighborhood, church, and National Park Service exhibits.",
    url: "https://www.nps.gov/malu/index.htm",
  },
] as const;

// To add your photos later, place the files in /public and set each src below
// (for example, src: "/travel-1.jpg"). Update the alt text to describe the photo.
const travelPhotos = [
  { src: "", alt: "Travel photo one" },
  { src: "", alt: "Travel photo two" },
  { src: "", alt: "Travel photo three" },
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
      Visit hotel
    </Button>
  </Box>
);

interface ThingCardProps {
  item: (typeof thingsToDo)[number];
  gridColumn: { xs: string; md: string };
}

const ThingCard: React.FC<ThingCardProps> = ({ item, gridColumn }) => (
  <Box
    component="article"
    sx={{
      gridColumn,
      minHeight: { xs: 280, md: 330 },
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      color: INK,
      backgroundColor: IVORY,
      border: "1px solid rgba(38, 49, 28, 0.16)",
      p: { xs: 3, md: 4 },
    }}
  >
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "baseline",
          mb: 4,
        }}
      >
        <Typography
          sx={{
            color: CORAL_HOVER,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "0.78rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {item.category}
        </Typography>
        <Typography
          aria-hidden="true"
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
            opacity: 0.45,
          }}
        >
          {item.number}
        </Typography>
      </Box>
      <Typography
        component="h3"
        sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 400,
          fontSize: { xs: "2.05rem", md: "2.5rem" },
          lineHeight: 1.05,
          mb: 2,
        }}
      >
        {item.name}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.08rem",
          lineHeight: 1.55,
          opacity: 0.82,
        }}
      >
        {item.description}
      </Typography>
    </Box>
    <Typography
      component="a"
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        width: "fit-content",
        color: INK,
        fontFamily: "Montserrat, sans-serif",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        textDecorationColor: CORAL,
        textDecorationThickness: "2px",
        textUnderlineOffset: "6px",
        mt: 3,
        "&:hover": { color: CORAL_HOVER },
      }}
    >
      Explore <span aria-hidden="true">↗</span>
    </Typography>
  </Box>
);

interface PhotoSpotProps {
  photo: (typeof travelPhotos)[number];
  number: number;
  gridColumn: { xs: string; md: string };
}

const PhotoSpot: React.FC<PhotoSpotProps> = ({
  photo,
  number,
  gridColumn,
}) => (
  <Box
    sx={{
      gridColumn,
      position: "relative",
      minHeight: { xs: 280, md: 330 },
      overflow: "hidden",
      backgroundColor: BEIGE,
      border: "1px dashed rgba(38, 49, 28, 0.4)",
    }}
  >
    {photo.src ? (
      <Box
        component="img"
        src={photo.src}
        alt={photo.alt}
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      <Box
        role="img"
        aria-label={`Placeholder for travel photo ${number}`}
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: INK,
          p: 4,
          backgroundImage:
            "linear-gradient(135deg, transparent 49.8%, rgba(38,49,28,0.09) 50%, transparent 50.2%), linear-gradient(45deg, transparent 49.8%, rgba(38,49,28,0.09) 50%, transparent 50.2%)",
        }}
      >
        <CameraAltOutlinedIcon sx={{ color: CORAL_HOVER, fontSize: 36, mb: 2 }} />
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.8rem",
            fontStyle: "italic",
            mb: 0.5,
          }}
        >
          Your photo here
        </Typography>
        <Typography
          sx={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.62,
          }}
        >
          Travel photo {String(number).padStart(2, "0")}
        </Typography>
      </Box>
    )}
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
          A few helpful places to stay and some of our favorite ways to spend a
          little extra time in the city.
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
            textAlign: "center",
          }}
        >
          Visit each hotel for current rates and availability.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {hotels.map((hotel) => (
            <HotelCard key={hotel.name} {...hotel} />
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        aria-labelledby="things-heading"
        sx={{
          color: INK,
          backgroundColor: BEIGE,
          py: { xs: 8, md: 11 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
            <Typography
              sx={{
                color: CORAL_HOVER,
                fontFamily: "Montserrat, sans-serif",
                fontSize: "0.76rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                mb: 1.5,
              }}
            >
              Make a weekend of it
            </Typography>
            <Typography
              id="things-heading"
              component="h2"
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "2.7rem", md: "4rem" },
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.05,
                mb: 2,
              }}
            >
              Things to do
            </Typography>
            <Typography
              sx={{
                maxWidth: 640,
                mx: "auto",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "1.15rem", md: "1.3rem" },
                lineHeight: 1.6,
                opacity: 0.8,
              }}
            >
              Eat, wander, shop, and get to know the neighborhoods around our
              celebration.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            <ThingCard
              item={thingsToDo[0]}
              gridColumn={{ xs: "1", md: "span 7" }}
            />
            <PhotoSpot
              photo={travelPhotos[0]}
              number={1}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
            <ThingCard
              item={thingsToDo[1]}
              gridColumn={{ xs: "1", md: "span 4" }}
            />
            <ThingCard
              item={thingsToDo[2]}
              gridColumn={{ xs: "1", md: "span 4" }}
            />
            <PhotoSpot
              photo={travelPhotos[1]}
              number={2}
              gridColumn={{ xs: "1", md: "span 4" }}
            />
            <ThingCard
              item={thingsToDo[3]}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
            <ThingCard
              item={thingsToDo[4]}
              gridColumn={{ xs: "1", md: "span 7" }}
            />
            <PhotoSpot
              photo={travelPhotos[2]}
              number={3}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
            <ThingCard
              item={thingsToDo[5]}
              gridColumn={{ xs: "1", md: "span 7" }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Travel;
