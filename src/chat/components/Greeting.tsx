import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        style={{
          color: "#f7d076",
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          fontSize: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        Your wedding concierge
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        style={{
          color: "#f5efe0",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontSize: "3rem",
          lineHeight: 1.1,
        }}
      >
        Hi, I'm TaroBot.
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        style={{
          color: "#f5efe0",
          opacity: 0.85,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.5rem",
          fontWeight: 300,
          marginTop: "0.75rem",
        }}
      >
        Ask me anything about Trevor & Kaitlin's wedding.
      </motion.div>
    </div>
  );
};
