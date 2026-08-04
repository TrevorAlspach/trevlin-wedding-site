import React from "react";
import { Box, Fab, Typography } from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import travelOne from "../assets/travel-1.png";
import travelTwo from "../assets/travel-2.png";
import travelThree from "../assets/travel-3.png";
import {
  atlantaActivities,
  atlantaRestaurantGroups,
} from "../../shared/things-to-do";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";
const INK = "#26311c";
const BEIGE = "#e9edc6";

const travelPhotos = [
  { src: travelOne, alt: "" },
  { src: travelThree, alt: "" },
  { src: travelTwo, alt: "" },
] as const;

interface ThingCardProps {
  item: (typeof atlantaActivities)[number];
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
      <Box sx={{ mb: 4 }}>
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

interface RestaurantCardProps {
  group: (typeof atlantaRestaurantGroups)[number];
  gridColumn: { xs: string; md: string };
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  group,
  gridColumn,
}) => (
  <Box
    component="article"
    sx={{
      gridColumn,
      color: INK,
      backgroundColor: IVORY,
      border: "1px solid rgba(38, 49, 28, 0.16)",
      p: { xs: 3, md: 4 },
    }}
  >
    <Box sx={{ mb: 3 }}>
      <Typography
        component="h3"
        sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 400,
          fontSize: { xs: "2.05rem", md: "2.5rem" },
          lineHeight: 1.05,
        }}
      >
        {group.name}
      </Typography>
    </Box>
    <Box
      component="ul"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        gap: "0.75rem 1.5rem",
        m: 0,
        pl: 2.5,
        "& li::marker": { color: CORAL_HOVER },
      }}
    >
      {group.restaurants.map((restaurant) => (
        <Typography
          component="li"
          key={restaurant}
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.08rem",
            lineHeight: 1.4,
          }}
        >
          {restaurant}
        </Typography>
      ))}
    </Box>
  </Box>
);

interface PhotoSpotProps {
  photo: (typeof travelPhotos)[number];
  gridColumn: { xs: string; md: string };
}

const PhotoSpot: React.FC<PhotoSpotProps> = ({ photo, gridColumn }) => (
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
    <Box
      component="img"
      src={photo.src}
      alt={photo.alt}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        p: { xs: 2, md: 3 },
      }}
    />
  </Box>
);

const ThingsToDo: React.FC = () => (
  <Box
    component="main"
    sx={{
      width: "100%",
      minHeight: "calc(100vh - 80px)",
    }}
  >
    <Box
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
            component="h1"
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
            Please enjoy the city we love if you have the time to try some of
            our favorite activities.
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
            item={atlantaActivities[0]}
            gridColumn={{ xs: "1", md: "span 7" }}
          />
          <PhotoSpot
            photo={travelPhotos[0]}
            gridColumn={{ xs: "1", md: "span 5" }}
          />
          <ThingCard
            item={atlantaActivities[1]}
            gridColumn={{ xs: "1", md: "span 4" }}
          />
          <ThingCard
            item={atlantaActivities[2]}
            gridColumn={{ xs: "1", md: "span 4" }}
          />
          <PhotoSpot
            photo={travelPhotos[1]}
            gridColumn={{ xs: "1", md: "span 4" }}
          />
          <ThingCard
            item={atlantaActivities[3]}
            gridColumn={{ xs: "1", md: "span 5" }}
          />
          <ThingCard
            item={atlantaActivities[4]}
            gridColumn={{ xs: "1", md: "span 7" }}
          />
          <ThingCard
            item={atlantaActivities[5]}
            gridColumn={{ xs: "1", md: "span 5" }}
          />
          <ThingCard
            item={atlantaActivities[6]}
            gridColumn={{ xs: "1", md: "span 7" }}
          />
        </Box>

        <Box sx={{ textAlign: "center", my: { xs: 7, md: 9 } }}>
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
            Hungry?
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "2.6rem", md: "3.6rem" },
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.05,
            }}
          >
            Walkable Midtown restaurants
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          <RestaurantCard
            group={atlantaRestaurantGroups[0]}
            gridColumn={{ xs: "1", md: "span 7" }}
          />
          <PhotoSpot
            photo={travelPhotos[2]}
            gridColumn={{ xs: "1", md: "span 5" }}
          />
          <RestaurantCard
            group={atlantaRestaurantGroups[1]}
            gridColumn={{ xs: "1", md: "span 6" }}
          />
          <RestaurantCard
            group={atlantaRestaurantGroups[2]}
            gridColumn={{ xs: "1", md: "span 6" }}
          />
          <RestaurantCard
            group={atlantaRestaurantGroups[3]}
            gridColumn={{ xs: "1", md: "span 7" }}
          />
          <RestaurantCard
            group={atlantaRestaurantGroups[4]}
            gridColumn={{ xs: "1", md: "span 5" }}
          />
        </Box>
      </Box>
    </Box>

    <Box
      id="things-map"
      component="section"
      aria-labelledby="things-map-heading"
      sx={{
        scrollMarginTop: 16,
        backgroundColor: IVORY,
        color: INK,
        px: { xs: 2, md: 4 },
        pt: { xs: 7, md: 9 },
        pb: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        <Typography
          id="things-map-heading"
          component="h2"
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: "2.6rem", md: "3.6rem" },
            fontStyle: "italic",
            fontWeight: 300,
            lineHeight: 1.05,
            mb: { xs: 3, md: 4 },
            textAlign: "center",
          }}
        >
          Things to do & Restaurants Map
        </Typography>
        <Box
          sx={{
            width: "100%",
            overflow: "hidden",
            border: "1px solid rgba(38, 49, 28, 0.2)",
            lineHeight: 0,
          }}
        >
          <Box
            component="iframe"
            title="Wedding recommendations around Atlanta"
            src="https://www.google.com/maps/d/embed?mid=1_Pl0wnBABm68DASDSCD5zxiscokjgrU&ehbc=2E312F&noprof=1"
            width="640"
            height="480"
            loading="lazy"
            sx={{
              display: "block",
              width: "100%",
              height: { xs: "70vh", sm: 520, md: 640 },
              minHeight: 480,
              border: 0,
            }}
          />
        </Box>
      </Box>
    </Box>

    <Fab
      component="a"
      href="#things-map"
      variant="extended"
      size="small"
      aria-label="Jump to the recommendations map"
      sx={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1200,
        minHeight: 36,
        height: 36,
        px: 1.75,
        color: INK,
        backgroundColor: CORAL,
        fontFamily: "Montserrat, sans-serif",
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        boxShadow: "0 4px 14px rgba(38, 49, 28, 0.3)",
        "&:hover": { backgroundColor: CORAL_HOVER },
      }}
    >
      <MapOutlinedIcon sx={{ mr: 0.75, fontSize: 17 }} />
      Jump to map
    </Fab>
  </Box>
);

export default ThingsToDo;
