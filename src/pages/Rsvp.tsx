import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useForm, ValidationError } from "@formspree/react";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const CORAL_HOVER = "#f08152";

const SERIF = "'Cormorant Garamond', serif";

const fieldSx = {
  "& .MuiInputLabel-root": {
    color: IVORY,
    opacity: 0.75,
    fontFamily: SERIF,
    fontSize: "1.1rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: IVORY, opacity: 1 },
  "& .MuiOutlinedInput-root": {
    color: IVORY,
    fontFamily: SERIF,
    fontSize: "1.15rem",
    backgroundColor: "rgba(245, 239, 224, 0.08)",
    "& fieldset": { borderColor: "rgba(245, 239, 224, 0.4)" },
    "&:hover fieldset": { borderColor: "rgba(245, 239, 224, 0.7)" },
    "&.Mui-focused fieldset": { borderColor: IVORY },
  },
};

const Rsvp: React.FC = () => {
  const [state, handleSubmit] = useForm("xykawgab");
  const [attending, setAttending] = useState("yes");
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([""]);

  if (state.succeeded) {
    return (
      <Box sx={{ maxWidth: 480, pt: 6, mx: "auto", px: 3, textAlign: "center" }}>
        <Typography
          variant="h3"
          fontFamily="'Cormorant Garamond', serif"
          color={IVORY}
          sx={{ fontWeight: 300, mb: 2 }}
        >
          Thank you!
        </Typography>
        <Typography
          fontFamily="'Cormorant Garamond', serif"
          color={IVORY}
          sx={{ fontSize: "1.25rem", opacity: 0.9 }}
        >
          We've received your RSVP and can't wait to celebrate with you.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 520, width: "100%", pt: 6, pb: 8, mx: "auto", px: 3, textAlign: "left" }}>
      <Typography
        variant="h4"
        component="h1"
        color={IVORY}
        sx={{
          fontFamily: SERIF,
          fontWeight: 300,
          mb: 4,
          textAlign: "center",
          fontSize: { xs: "2.25rem", md: "2.75rem" },
        }}
      >
        RSVP
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />

        <FormControl>
          <FormLabel
            sx={{
              color: IVORY,
              opacity: 0.85,
              mb: 1,
              fontFamily: SERIF,
              fontSize: "1.1rem",
              "&.Mui-focused": { color: IVORY },
            }}
          >
            Will you be attending?
          </FormLabel>
          <RadioGroup
            name="attending"
            value={attending}
            onChange={(e) => setAttending(e.target.value)}
            row
          >
            <FormControlLabel
              value="yes"
              control={<Radio sx={{ color: IVORY, "&.Mui-checked": { color: CORAL } }} />}
              label="Joyfully accepts"
              sx={{ color: IVORY, "& .MuiFormControlLabel-label": { fontFamily: SERIF, fontSize: "1.1rem" } }}
            />
            <FormControlLabel
              value="no"
              control={<Radio sx={{ color: IVORY, "&.Mui-checked": { color: CORAL } }} />}
              label="Regretfully declines"
              sx={{ color: IVORY, "& .MuiFormControlLabel-label": { fontFamily: SERIF, fontSize: "1.1rem" } }}
            />
          </RadioGroup>
        </FormControl>

        {attending === "no" && (
          <TextField
            label="Your name"
            name="guest_name_1"
            required
            fullWidth
            variant="outlined"
            sx={fieldSx}
          />
        )}

        {attending === "yes" && (
          <>
            <TextField
              label="Number of guests (including yourself)"
              name="guest_count"
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 10 } }}
              value={guestCount}
              onChange={(e) => {
                const n = Math.min(10, Math.max(1, Number(e.target.value)));
                setGuestCount(n);
                setGuestNames((prev) => {
                  const next = [...prev];
                  while (next.length < n) next.push("");
                  return next.slice(0, n);
                });
              }}
              fullWidth
              variant="outlined"
              sx={fieldSx}
            />
            {guestNames.map((name, i) => (
              <TextField
                key={i}
                label={i === 0 ? "Your name" : `Guest ${i + 1} name`}
                name={`guest_name_${i + 1}`}
                value={name}
                onChange={(e) =>
                  setGuestNames((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                }
                required
                fullWidth
                variant="outlined"
                sx={fieldSx}
              />
            ))}
          </>
        )}

        <TextField
          label="Song requests (optional)"
          name="song_requests"
          multiline
          rows={2}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />

        <TextField
          label="Dietary restrictions or notes (optional)"
          name="dietary"
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />

        <ValidationError errors={state.errors} />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={state.submitting}
          sx={{
            mt: 1,
            color: "#3a3a1a",
            fontFamily: SERIF,
            fontSize: "1.2rem",
            fontWeight: 500,
            letterSpacing: "0.04em",
            backgroundColor: CORAL,
            "&:hover": { backgroundColor: CORAL_HOVER },
            "&:disabled": { backgroundColor: "rgba(255, 157, 108, 0.4)", color: "#3a3a1a" },
            boxShadow: "none",
            textTransform: "none",
            py: 1.5,
            borderRadius: 0,
          }}
        >
          {state.submitting ? <CircularProgress size={24} sx={{ color: "#3a3a1a" }} /> : "Send RSVP"}
        </Button>
      </Box>
    </Box>
  );
};

export default Rsvp;
