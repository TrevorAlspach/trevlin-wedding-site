import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#65c3c8", // cupcake-inspired primary
    },
    secondary: {
      main: "#ef9fbc", // cupcake-inspired secondary
    },
    background: {
      default: "#faf7f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Montserrat', 'Roboto', sans-serif",
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
