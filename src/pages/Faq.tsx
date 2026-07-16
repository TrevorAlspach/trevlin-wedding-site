import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { weddingFaqs, type WeddingFaqItem } from "../../shared/wedding-info";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const BUTTER = "#f7d076";

const half = Math.ceil(weddingFaqs.length / 2);
const leftFaqs = weddingFaqs.slice(0, half);
const rightFaqs = weddingFaqs.slice(half);

const accordionSx = {
  backgroundColor: "rgba(245, 239, 224, 0.06)",
  color: IVORY,
  borderRadius: 0,
  boxShadow: "none",
  borderBottom: "1px solid rgba(245, 239, 224, 0.2)",
  "&:before": { display: "none" },
  "&.Mui-expanded": {
    backgroundColor: "rgba(245, 239, 224, 0.1)",
    margin: 0,
  },
};

const FaqColumn: React.FC<{ items: readonly WeddingFaqItem[] }> = ({ items }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    {items.map((faq) => (
      <Accordion key={faq.question} disableGutters sx={accordionSx}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: CORAL }} />}
          sx={{
            "& .MuiAccordionSummary-content": { my: 1.5 },
          }}
        >
          <Typography
            sx={{
              color: IVORY,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {faq.question}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            sx={{
              color: IVORY,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem",
              opacity: 0.9,
              lineHeight: 1.6,
            }}
          >
            {faq.answer}
          </Typography>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);

const FAQ: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        py: { xs: 6, md: 8 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
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
          Everything you need to know
        </Typography>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: IVORY,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: { xs: "3rem", md: "4.5rem" },
            letterSpacing: "0.02em",
          }}
        >
          FAQs
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 0, md: 4 },
          alignItems: "flex-start",
        }}
      >
        <FaqColumn items={leftFaqs} />
        <FaqColumn items={rightFaqs} />
      </Box>
    </Box>
  );
};

export default FAQ;
