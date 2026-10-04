import { motion } from "framer-motion";

export const Greeting = ({
  variant = "widget",
}: {
  variant?: "page" | "widget";
}) => {
  const isPage = variant === "page";

  return (
    <div
      className="mx-auto flex w-full flex-1 max-w-3xl flex-col justify-center px-2 md:mt-16 md:size-full md:flex-none md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-0.5 text-[0.65rem] leading-tight tracking-[0.18em] md:mb-2 md:text-base md:tracking-[0.3em]"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        style={{
          color: isPage ? "#a75034" : "#f7d076",
          fontFamily: "'Montserrat', 'Roboto', sans-serif",
          textTransform: "uppercase",
        }}
      >
        Your wedding concierge
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-[1.75rem] leading-none md:text-5xl md:leading-[1.1]"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        style={{
          color: isPage ? "#34351f" : "#f5efe0",
          fontFamily: "'Montserrat', 'Roboto', sans-serif",
          fontWeight: 300,
        }}
      >
        Hi, I'm TaroBot.
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-sm leading-5 md:mt-3 md:text-2xl md:leading-snug"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        style={{
          color: isPage ? "#34351f" : "#f5efe0",
          opacity: 0.85,
          fontFamily: "'Montserrat', 'Roboto', sans-serif",
          fontWeight: 300,
        }}
      >
        Ask me anything about Trevor & Kaitlin's wedding.
      </motion.div>
    </div>
  );
};
