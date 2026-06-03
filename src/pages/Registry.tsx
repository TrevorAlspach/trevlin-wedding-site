import React from "react";
import { Box, Typography } from "@mui/material";

const Registry: React.FC = () => {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Registry
      </Typography>
      <Typography variant="body1">
        <a
          href="https://www.amazon.com/wedding/share/trevlin420"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.amazon.com/wedding/share/trevlin420
        </a>
      </Typography>
    </Box>
  );
};

export default Registry;
