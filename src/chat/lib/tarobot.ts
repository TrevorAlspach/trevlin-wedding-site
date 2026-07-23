export const TAROBOT_HELMETS = ["GREEN", "YELLOW", "RED"] as const;
export const TAROBOT_FACES = [
  "NORMAL_GON",
  "HAPPY_GON",
  "CHAD_GON",
  "WTF_GON",
  "SIDEEYE_GON",
  "IMDEAD_GON",
] as const;

export type TaroBotHelmet = (typeof TAROBOT_HELMETS)[number];
export type TaroBotFace = (typeof TAROBOT_FACES)[number];

export type TaroBotAppearance = {
  helmet: TaroBotHelmet;
  face: TaroBotFace;
};

export const DEFAULT_TAROBOT_APPEARANCE: TaroBotAppearance = {
  helmet: "GREEN",
  face: "NORMAL_GON",
};

export function isTaroBotHelmet(value: unknown): value is TaroBotHelmet {
  return TAROBOT_HELMETS.some((helmet) => helmet === value);
}

export function isTaroBotFace(value: unknown): value is TaroBotFace {
  return TAROBOT_FACES.some((face) => face === value);
}

export function stripTaroBotControlText(content: string): string {
  return content
    .replace(/\[\[TAROBOT:[\s\S]*?\]\]/gi, "")
    .replace(/\[\[TAROBOT:[\s\S]*$/i, "")
    .replace(/^\s+/, "");
}
