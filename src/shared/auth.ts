export const PROVIDERS = {
  google: { label: "Continue with Google", route: "google" },
  aad: { label: "Continue with Microsoft", route: "aad" },
} as const;

export type ProviderName = keyof typeof PROVIDERS;

export type SessionResponse = {
  status: "anonymous" | "invalid" | "allowed" | "denied";
  email: string | null;
  name: string | null;
  providers: ProviderName[];
  accessRequestsEnabled: boolean;
};
