import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  MAX_DIETARY_NOTES_LENGTH,
  MAX_SONG_REQUEST_LENGTH,
  type RsvpDetails,
  type RsvpGuest,
  type RsvpGuestResponse,
  type RsvpSubmission,
} from "../../shared/rsvp";

const IVORY = "#f5efe0";
const CORAL = "#ff9d6c";
const SERIF = "'Cormorant Garamond', serif";
const SANS = "'Montserrat', 'Roboto', sans-serif";

const fieldSx = {
  "& .MuiInputLabel-root": { color: IVORY, fontFamily: SANS },
  "& .MuiInputLabel-root.Mui-focused": { color: IVORY },
  "& .MuiOutlinedInput-root": {
    color: IVORY,
    fontFamily: SANS,
    backgroundColor: "rgba(245, 239, 224, 0.08)",
    "& fieldset": { borderColor: "rgba(245, 239, 224, 0.4)" },
    "&:hover fieldset": { borderColor: "rgba(245, 239, 224, 0.7)" },
    "&.Mui-focused fieldset": { borderColor: IVORY },
  },
  "& .MuiSelect-icon": { color: IVORY },
  "& .MuiFormHelperText-root": { color: IVORY, opacity: 0.8, fontFamily: SANS },
};

const buttonSx = {
  color: "#3a3a1a",
  fontFamily: SANS,
  fontSize: "1.1rem",
  backgroundColor: CORAL,
  "&:hover": { backgroundColor: "#f08152" },
  "&:disabled": { backgroundColor: "rgba(255, 157, 108, 0.4)", color: "#3a3a1a" },
  boxShadow: "none",
  textTransform: "none",
  py: 1.5,
  borderRadius: 0,
};

function AttendanceQuestion({ id, label, value, onChange, disabled }: {
  id: string;
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <FormControl required disabled={disabled}>
      <FormLabel id={`${id}-label`} sx={{ color: IVORY, fontFamily: SANS, "&.Mui-focused": { color: IVORY } }}>
        {label}
      </FormLabel>
      <RadioGroup
        aria-labelledby={`${id}-label`}
        name={id}
        value={value === null ? "" : value ? "yes" : "no"}
        onChange={(event) => onChange(event.target.value === "yes")}
        row
      >
        {["yes", "no"].map((answer) => (
          <FormControlLabel
            key={answer}
            value={answer}
            control={<Radio required sx={{ color: IVORY, "&.Mui-checked": { color: CORAL } }} />}
            label={answer === "yes" ? "Yes" : "No"}
            sx={{ color: IVORY, "& .MuiFormControlLabel-label": { fontFamily: SANS } }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

async function responseError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return typeof body?.error === "string" ? body.error : fallback;
}

export default function Rsvp() {
  const [details, setDetails] = useState<RsvpDetails | null>(null);
  const [drafts, setDrafts] = useState<Record<number, RsvpGuest>>({});
  const [otherGuestIds, setOtherGuestIds] = useState<number[]>([]);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadInvitation() {
      try {
        const response = await fetch("/api/rsvp", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(await responseError(response, "Unable to load your invitation. Please sign in again or try later."));
        }
        const invitation: RsvpDetails = await response.json();
        if (!controller.signal.aborted) {
          setDetails(invitation);
          setDrafts(Object.fromEntries(invitation.guests.map((guest) => [guest.id, guest])));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "Unable to load your invitation. Please try again.");
        }
      }
    }
    void loadInvitation();
    return () => controller.abort();
  }, [loadVersion]);

  function updateGuest(id: number, changes: Partial<RsvpGuest>) {
    setDrafts((previous) => ({ ...previous, [id]: { ...previous[id], ...changes } }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!details || submitting) return;
    setSubmitError("");
    const guests: RsvpGuestResponse[] = [];
    for (const id of [details.guestId, ...otherGuestIds]) {
      const guest = drafts[id];
      if (guest.attending === null ||
          (details.invitations.teaCeremony && guest.teaCeremonyRsvp === null) ||
          (details.invitations.rehearsalDinner && guest.rehearsalDinnerRsvp === null)) {
        setSubmitError(`Please answer each attendance question for ${guest.name}.`);
        return;
      }
      guests.push({
        guestId: id,
        attending: guest.attending,
        teaCeremonyRsvp: details.invitations.teaCeremony ? guest.teaCeremonyRsvp : null,
        rehearsalDinnerRsvp: details.invitations.rehearsalDinner ? guest.rehearsalDinnerRsvp : null,
        songRequests: guest.songRequests,
        dietaryNotes: guest.dietaryNotes,
      });
    }
    setSubmitting(true);
    try {
      const submission: RsvpSubmission = { guests };
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (!response.ok) {
        throw new Error(await responseError(response, "We couldn't save your RSVP. Please try again."));
      }
      setSaved(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn't save your RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const otherGuests = details?.guests.filter((guest) => guest.id !== details.guestId) ?? [];
  const selectedGuests = details ? [details.guestId, ...otherGuestIds].map((id) => drafts[id]) : [];

  return (
    <Box sx={{ maxWidth: 560, width: "100%", pt: 6, pb: 8, mx: "auto", px: 3, textAlign: "left" }}>
      <Typography component="h1" sx={{ color: IVORY, fontFamily: SERIF, fontWeight: 300, mb: 3, textAlign: "center", fontSize: { xs: "2.25rem", md: "2.75rem" } }}>
        {saved ? "Thank you!" : "RSVP"}
      </Typography>

      {saved ? (
        <Box sx={{ textAlign: "center" }}>
          <Typography role="status" sx={{ fontFamily: SANS, mb: 3 }}>
            Your RSVP has been saved for {selectedGuests.map((guest) => guest.name).join(", ")}. Thank you for letting us know!
          </Typography>
          <Button onClick={() => setSaved(false)} sx={buttonSx}>Edit responses</Button>
        </Box>
      ) : loadError ? (
        <Box>
          <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>
          <Button sx={buttonSx} onClick={() => { setLoadError(""); setLoadVersion((value) => value + 1); }}>Try again</Button>
        </Box>
      ) : !details ? (
        <Box role="status" sx={{ textAlign: "center" }}>
          <CircularProgress size={28} sx={{ color: IVORY, mb: 2 }} />
          <Typography sx={{ fontFamily: SANS }}>Loading your family invitation…</Typography>
        </Box>
      ) : (
        <Box component="form" onSubmit={(event) => void handleSubmit(event)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography sx={{ fontFamily: SANS, lineHeight: 1.7 }}>
            Let us know which celebrations you can join. You can also respond for other members of your family below.
          </Typography>
          <TextField
            label="Your name"
            value={details.identity.name || drafts[details.guestId].name}
            slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="Email"
            type="email"
            value={details.identity.email}
            slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
            fullWidth
            sx={fieldSx}
          />

          {otherGuests.length > 0 && (
            <FormControl fullWidth disabled={submitting} sx={fieldSx}>
              <InputLabel id="family-members-label">Other family members</InputLabel>
              <Select<number[]>
                labelId="family-members-label"
                id="family-members"
                label="Other family members"
                multiple
                value={otherGuestIds}
                onChange={(event) => {
                  const value = event.target.value;
                  setOtherGuestIds(typeof value === "string" ? value.split(",").map(Number) : value);
                }}
                renderValue={(ids) => ids.map((id) => drafts[id].name).join(", ")}
                aria-describedby="family-members-help"
              >
                {otherGuests.map((guest) => (
                  <MenuItem key={guest.id} value={guest.id}>
                    <Checkbox checked={otherGuestIds.includes(guest.id)} />
                    <ListItemText primary={guest.name} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText id="family-members-help">
                Select anyone you’re responding for. Unselected family members’ responses will stay as they are.
              </FormHelperText>
            </FormControl>
          )}

          {selectedGuests.map((guest) => (
            <Box key={guest.id} component="fieldset" sx={{ m: 0, p: { xs: 2, sm: 3 }, minWidth: 0, display: "flex", flexDirection: "column", gap: 2.5, border: "1px solid rgba(245,239,224,0.4)" }}>
              <Typography component="legend" sx={{ px: 1, fontFamily: SERIF, fontSize: "1.8rem" }}>
                {guest.name}{guest.id === details.guestId ? " (you)" : ""}
              </Typography>
              <AttendanceQuestion id={`wedding-${guest.id}`} label="Will you attend the wedding?" value={guest.attending} onChange={(attending) => updateGuest(guest.id, { attending })} disabled={submitting} />
              {details.invitations.teaCeremony && (
                <AttendanceQuestion id={`tea-${guest.id}`} label="Will you attend the tea ceremony?" value={guest.teaCeremonyRsvp} onChange={(teaCeremonyRsvp) => updateGuest(guest.id, { teaCeremonyRsvp })} disabled={submitting} />
              )}
              {details.invitations.rehearsalDinner && (
                <AttendanceQuestion id={`rehearsal-${guest.id}`} label="Will you attend the rehearsal dinner?" value={guest.rehearsalDinnerRsvp} onChange={(rehearsalDinnerRsvp) => updateGuest(guest.id, { rehearsalDinnerRsvp })} disabled={submitting} />
              )}
              <TextField
                label="Song requests (optional)"
                value={guest.songRequests}
                onChange={(event) => updateGuest(guest.id, { songRequests: event.target.value })}
                slotProps={{ htmlInput: { maxLength: MAX_SONG_REQUEST_LENGTH } }}
                disabled={submitting}
                multiline
                rows={2}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Dietary restrictions or notes (optional)"
                value={guest.dietaryNotes}
                onChange={(event) => updateGuest(guest.id, { dietaryNotes: event.target.value })}
                slotProps={{ htmlInput: { maxLength: MAX_DIETARY_NOTES_LENGTH } }}
                disabled={submitting}
                multiline
                rows={3}
                fullWidth
                sx={fieldSx}
              />
            </Box>
          ))}
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <Button type="submit" variant="contained" disabled={submitting} sx={buttonSx}>
            {submitting ? <><CircularProgress size={20} sx={{ color: "inherit", mr: 1 }} />Saving RSVP…</> : "Send RSVP"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
