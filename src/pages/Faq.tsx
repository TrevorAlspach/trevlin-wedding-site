import React from "react";
import { Box, Typography } from "@mui/material";

const FAQ: React.FC = () => {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        FAQ
      </Typography>
      <Typography variant="body1">
        Welcome to the FAQ page. Here you can find answers to common questions.
      </Typography>
    </Box>
  );
};

export default FAQ;
