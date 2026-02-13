import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "When and where is the wedding?",
    answer:
      "Details about the date, time, and venue will be shared here once confirmed.",
  },
  {
    question: "What is the dress code?",
    answer: "We suggest semi-formal / cocktail attire. More details to come!",
  },
  {
    question: "Can I bring a plus one?",
    answer:
      "Please refer to your invitation for the number of seats reserved in your name.",
  },
  {
    question: "Is the venue accessible?",
    answer:
      "Yes, the venue is wheelchair accessible. Please reach out if you have any specific needs.",
  },
  {
    question: "Will there be parking available?",
    answer:
      "Yes, free parking is available on-site. Details will be provided closer to the date.",
  },
  {
    question: "What if I have dietary restrictions?",
    answer:
      "Please let us know about any dietary restrictions when you RSVP and we will do our best to accommodate.",
  },
];

const FAQ: React.FC = () => {
  return (
    <Box sx={{ width: "100%", maxWidth: 720, mx: "auto", py: 4, px: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        FAQ
      </Typography>

      {faqs.map((faq, index) => (
        <Accordion key={index} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQ;
