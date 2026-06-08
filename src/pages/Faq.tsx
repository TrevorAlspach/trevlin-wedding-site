import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const BUTTER = "#f7d076";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "When and where is the wedding?",
    answer:
      "Our wedding will be held on April 17, 2027 from 5:00-10:00 PM at the Trolley Barn in Atlanta, GA.",
  },
  {
    question: "What time to arrive?",
    answer:
      "Please aim to arrive at the venue at 4:30PM. For Atlanta newcomers, please beware that if google maps says 15 minutes, it will almost certainly take 30 minutes with traffic.",
  },
  {
    question: "How to RSVP?",
    answer:
      "RSVPs will only be received through the online form. An email receipt of your form submission is confirmation that we will see you on 4/17!",
  },
  {
    question: "What should I wear?",
    answer:
      "Our dress code is cocktail attire! Elegant knee to midi length dresses, your fanciest jumpsuit or separates, or the classic suit and tie are welcome. Please refrain from wearing any hats or jeans. When in doubt come dressed your best, and joyful springtime colors or patterns are encouraged!",
  },
  {
    question: "What will the weather be like?",
    answer:
      "Springtime weather can range from the 50s to 80s in Atlanta. Be prepared for humidity and April showers!",
  },
  {
    question: "Can I bring a plus one?",
    answer:
      "Please fill out the RSVP form to notify us of a guest that has not been named on the invitation so we can provide the proper accommodations to welcome you all!",
  },
  {
    question: "Are children allowed at the wedding?",
    answer:
      "Please fill out the RSVP form to notify us of any children in attendance so we can provide proper accommodations for our smallest guests!",
  },
  {
    question: "Can I request songs to the DJ?",
    answer:
      "Any song requests will be accepted before the day of. Feel free to submit as many as you want in the online form!",
  },
  {
    question: "What kind of food will be served?",
    answer:
      "Light snacks will be offered at cocktail hour, followed by a buffet-style dinner at 6:30PM.",
  },
  {
    question: "Will there be parking available?",
    answer:
      "Yes, free street parking/nearby lots are available and there will be an officer directing traffic. You can also use Uber or MARTA if you're feeling adventurous!",
  },
  {
    question: "What if I have dietary restrictions?",
    answer:
      "Please fill out the RSVP form to notify us of any dietary restrictions as soon as possible for us to request separate food accomodations.",
  },
  {
    question: "Need to fly in?",
    answer:
      "Hartsfield-Jackson Airport (ATL) is the main airport hub in Atlanta, and 15 minutes away from the Inman Park area. Delta can definitely get you there!",
  },
  {
    question: "Directions to venue?",
    answer:
      "The Trolley Barn is located at 963 Edgewood Ave NE, Atlanta, GA 30307",
  },
  {
    question: "How to change RSVP?",
    answer:
      "If you would like to add or remove from your RSVP, please contact us directly at trevlin420@gmail.com",
  },
  {
    question: "Am I allowed to take pictures?",
    answer:
      "We request that phones be turned off for all guests to enjoy the ceremony without distractions. However, pictures are highly encouraged during the reception! Please send your favorites to us after the big day: (link to album or email).",
  },
  {
    question: "Where to see updates?",
    answer: "Right here! :)))",
  },
  {
    question: "How do you pronounce 'Alspach'?",
    answer: "'All-spa'. It’s German!",
  },
];

const half = Math.ceil(faqs.length / 2);
const leftFaqs = faqs.slice(0, half);
const rightFaqs = faqs.slice(half);

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

const FaqColumn: React.FC<{ items: FaqItem[] }> = ({ items }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    {items.map((faq, index) => (
      <Accordion key={index} disableGutters sx={accordionSx}>
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
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", py: { xs: 6, md: 8 }, px: { xs: 2, md: 4 } }}>
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
