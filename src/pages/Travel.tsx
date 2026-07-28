import React from "react";
import { Box, Button, Typography } from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import travelOne from "../assets/travel-1.png";
import travelTwo from "../assets/travel-2.png";
import travelThree from "../assets/travel-3.png";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";
const BUTTER = "#f7d076";
const INK = "#26311c";
const BEIGE = "#e9edc6";

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

const activities = [
  {
    number: "01",
    name: "Georgia Aquarium",
    category: "3–4 hours",
    description:
      "Purchase a ticket online to reserve a time slot in advance. Go during the week if you can to avoid the crowds!",
    url: "https://www.georgiaaquarium.org/",
  },
  {
    number: "02",
    name: "Atlanta Botanical Garden",
    category: "3–4 hours",
    description:
      "Purchase a ticket online to reserve a time slot in advance. Tulips and daffodils will be in season!",
    url: "https://atlantabg.org/",
  },
  {
    number: "03",
    name: "World of Coca-Cola",
    category: "2 hours",
    description:
      "Purchase a ticket online to reserve a time slot in advance. Try the red cream soda!",
    url: "https://www.worldofcoca-cola.com/",
  },

  {
    number: "04",
    name: "Buford Highway",
    category: "1 hour",
    description:
      "Drive 15 minutes out of the city to try the best Hispanic and Asian restaurants in the South. Our favorites are Pho Bac, Canton House, and Kamayan—reservations are highly recommended.",
    url: "https://discoveratlanta.com/dining/buford-highway/",
  },
  {
    number: "05",
    name: "BeltLine",
    category: "1–5 hours · depends on you!",
    description:
      "Find an entrance around Piedmont Park, Ponce City Market, or Inman Park and enjoy a stroll through the city. Inman Park's Victory Sandwich Bar has a great Jack and Coke slushie!",
    url: "https://beltline.org/visitor-information/",
  },
  {
    number: "06",
    name: "Atlantic Station",
    category: "Shopping",
    description:
      "Show up and enjoy free parking for two hours for any last-minute shopping if you don't want to deal with the mall.",
    url: "https://atlanticstation.com/",
  },
  {
    number: "07",
    name: "Farmer's Market",
    category: "Saturday · 9 AM–1 PM",
    description:
      "Find it at Piedmont Park on Saturdays only. We always stop by the coffee stand!",
    url: "https://piedmontpark.org/green-market/",
  },
] as const;

const restaurantGroups = [
  {
    number: "01",
    name: "Bang for your buck",
    restaurants: [
      "Steamhouse Lounge",
      "Urban Hai",
      "bb.q Chicken (Korean fried chicken)",
      "Nagomiya (the ramen/sushi combos)",
      "DUA (poke bowls)",
      "Xi'an Gourmet House",
      "Establishment (happy hour)",
      "Silver Skillet",
    ],
  },
  {
    number: "02",
    name: "Delicious with city prices",
    restaurants: [
      "Tabla",
      "E Ramen",
      "Agora",
      "Boqueria",
      "Pasta da Pulcinella",
      "26 Thai",
      "Rreal Tacos",
      "Crescent City Kitchen",
    ],
  },
  {
    number: "03",
    name: "I want a sweet treat",
    restaurants: [
      "Cafe Intermezzo",
      "Moge Tee",
      "White Windmill",
      "Coffee: Cafe Lucia, Dancing Goats, For Five, Hara's",
    ],
  },
  {
    number: "04",
    name: "Familiar faces",
    restaurants: ["Chipotle", "Shake Shack", "5 Guys", "Chick-fil-A", "Panera"],
  },
  {
    number: "05",
    name: "Higher end",
    restaurants: ["The Consulate", "Rumi's Kitchen"],
  },
] as const;

const travelPhotos = [
  { src: travelOne, alt: "" },
  { src: travelThree, alt: "" },
  { src: travelTwo, alt: "" },
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

interface ThingCardProps {
  item: (typeof activities)[number];
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

interface RestaurantCardProps {
  group: (typeof restaurantGroups)[number];
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        alignItems: "baseline",
        mb: 3,
      }}
    >
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
      <Typography
        aria-hidden="true"
        sx={{
          color: CORAL_HOVER,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.2rem",
        }}
      >
        {group.number}
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
  number: number;
  gridColumn: { xs: string; md: string };
}

const PhotoSpot: React.FC<PhotoSpotProps> = ({ photo, number, gridColumn }) => (
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
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          p: { xs: 2, md: 3 },
        }}
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
        <CameraAltOutlinedIcon
          sx={{ color: CORAL_HOVER, fontSize: 36, mb: 2 }}
        />
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
              item={activities[0]}
              gridColumn={{ xs: "1", md: "span 7" }}
            />
            <PhotoSpot
              photo={travelPhotos[0]}
              number={1}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
            <ThingCard
              item={activities[1]}
              gridColumn={{ xs: "1", md: "span 4" }}
            />
            <ThingCard
              item={activities[2]}
              gridColumn={{ xs: "1", md: "span 4" }}
            />
            <PhotoSpot
              photo={travelPhotos[1]}
              number={2}
              gridColumn={{ xs: "1", md: "span 4" }}
            />
            <ThingCard
              item={activities[3]}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
            <ThingCard
              item={activities[4]}
              gridColumn={{ xs: "1", md: "span 7" }}
            />
            <ThingCard
              item={activities[5]}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
            <ThingCard
              item={activities[6]}
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
              component="h3"
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
              group={restaurantGroups[0]}
              gridColumn={{ xs: "1", md: "span 7" }}
            />
            <PhotoSpot
              photo={travelPhotos[2]}
              number={3}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
            <RestaurantCard
              group={restaurantGroups[1]}
              gridColumn={{ xs: "1", md: "span 6" }}
            />
            <RestaurantCard
              group={restaurantGroups[2]}
              gridColumn={{ xs: "1", md: "span 6" }}
            />
            <RestaurantCard
              group={restaurantGroups[3]}
              gridColumn={{ xs: "1", md: "span 7" }}
            />
            <RestaurantCard
              group={restaurantGroups[4]}
              gridColumn={{ xs: "1", md: "span 5" }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Travel;
