import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <Box
      sx={{
        maxWidth: 448,
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        pt: 6,
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        color="#2F2504"
        fontFamily="serif"
        sx={{ fontWeight: 100 }}
      >
        Trevor & Kaitlin
      </Typography>
      {/* <Typography variant="body1" sx={{ mb: 3 }}>
        Dog too fat for walk. Shiba is cute doggo big ol pupper, borking
      </Typography> */}
      <Button
        component={Link}
        to="/rsvp"
        variant="contained"
        size="large"
        sx={{
          color: "white",
          fontFamily: "serif",
          backgroundColor: "#594E36",
          "&:hover": { backgroundColor: "#6e8360" },
        }}
      >
        RSVP
      </Button>
    </Box>
  );
};

export default Home;
