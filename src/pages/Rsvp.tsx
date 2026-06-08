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

const Rsvp: React.FC = () => {
  const [state, handleSubmit] = useForm("xykawgab");
  const [attending, setAttending] = useState("yes");
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([""]);

  if (state.succeeded) {
    return (
      <Box sx={{ maxWidth: 480, pt: 6 }}>
        <Typography variant="h4" fontFamily="serif" color="#2F2504" sx={{ fontWeight: 100, mb: 2 }}>
          Thank you!
        </Typography>
        <Typography variant="body1">
          We've received your RSVP and can't wait to celebrate with you.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, pt: 6 }}>
      <Typography
        variant="h3"
        component="h1"
        color="#2F2504"
        fontFamily="serif"
        sx={{ fontWeight: 100, mb: 4 }}
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
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />

        <FormControl>
          <FormLabel sx={{ color: "#2F2504", mb: 1 }}>Will you be attending?</FormLabel>
          <RadioGroup
            name="attending"
            value={attending}
            onChange={(e) => setAttending(e.target.value)}
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Joyfully accepts" />
            <FormControlLabel value="no" control={<Radio />} label="Regretfully declines" />
          </RadioGroup>
        </FormControl>

        {attending === "no" && (
          <TextField
            label="Your name"
            name="guest_name_1"
            required
            fullWidth
            variant="outlined"
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
        />

        <TextField
          label="Dietary restrictions or notes (optional)"
          name="dietary"
          multiline
          rows={3}
          fullWidth
          variant="outlined"
        />

        <ValidationError errors={state.errors} />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={state.submitting}
          sx={{
            color: "white",
            fontFamily: "serif",
            backgroundColor: "#594E36",
            "&:hover": { backgroundColor: "#6e8360" },
            "&:disabled": { backgroundColor: "#9e9e9e" },
          }}
        >
          {state.submitting ? <CircularProgress size={24} color="inherit" /> : "Send RSVP"}
        </Button>
      </Box>
    </Box>
  );
};

export default Rsvp;
