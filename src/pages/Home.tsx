import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 448 }}>
      <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
        Trevor and Kaitlin!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Dog too fat for walk. Shiba is cute doggo big ol pupper, borking
      </Typography>
      <Button
        component={Link}
        to="/rsvp"
        variant="contained"
        color="primary"
        size="large"
        sx={{ color: "white" }}
      >
        RSVP
      </Button>
    </Box>
  );
};

export default Home;
