import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import chadGon from "@/assets/tarobot/CHAD_GON.png";
import greenHelmet from "@/assets/tarobot/EMPTY_TARO_GREEN.png";
import redHelmet from "@/assets/tarobot/EMPTY_TARO_RED.png";
import yellowHelmet from "@/assets/tarobot/EMPTY_TARO_YELLOW.png";
import happyGon from "@/assets/tarobot/HAPPY_GON.png";
import imDeadGon from "@/assets/tarobot/IMDEAD_GON.png";
import loadingOneDot from "@/assets/tarobot/LOADING_GON_ONEDOT.png";
import loadingThreeDots from "@/assets/tarobot/LOADING_GON_THREEDOTS.png";
import loadingTwoDots from "@/assets/tarobot/LOADING_GON_TWODOTS.png";
import normalGon from "@/assets/tarobot/NORMAL_GON.png";
import sideEyeGon from "@/assets/tarobot/SIDEEYE_GON.png";
import staticGon from "@/assets/tarobot/STATIC_GON.png";
import wtfGon from "@/assets/tarobot/WTF_GON.png";
import type { ChatStatus } from "@/chat/lib/types";
import type { TaroBotAppearance, TaroBotFace } from "@/chat/lib/tarobot";
import { cn } from "@/chat/lib/utils";

type LoadingFace =
  | "LOADING_GON_ONEDOT"
  | "LOADING_GON_TWODOTS"
  | "LOADING_GON_THREEDOTS"
  | "STATIC_GON";

const HELMET_IMAGES = {
  GREEN: greenHelmet,
  YELLOW: yellowHelmet,
  RED: redHelmet,
} as const;

const FACE_IMAGES: Record<TaroBotFace | LoadingFace, string> = {
  NORMAL_GON: normalGon,
  HAPPY_GON: happyGon,
  CHAD_GON: chadGon,
  WTF_GON: wtfGon,
  SIDEEYE_GON: sideEyeGon,
  IMDEAD_GON: imDeadGon,
  LOADING_GON_ONEDOT: loadingOneDot,
  LOADING_GON_TWODOTS: loadingTwoDots,
  LOADING_GON_THREEDOTS: loadingThreeDots,
  STATIC_GON: staticGon,
};

const LOADING_FACES: LoadingFace[] = [
  "LOADING_GON_ONEDOT",
  "LOADING_GON_TWODOTS",
  "LOADING_GON_THREEDOTS",
];

const HELMET_GLOWS = {
  GREEN: "rgba(163, 255, 112, 0.24)",
  YELLOW: "rgba(247, 208, 118, 0.24)",
  RED: "rgba(255, 112, 112, 0.24)",
} as const;

const FACE_LABELS: Record<TaroBotFace, string> = {
  NORMAL_GON: "ready",
  HAPPY_GON: "happy with that answer",
  CHAD_GON: "feeling extra confident",
  WTF_GON: "asking for a little clarification",
  SIDEEYE_GON: "giving that question a side-eye",
  IMDEAD_GON: "stunned by that question",
};

type TaroBotAvatarProps = {
  appearance: TaroBotAppearance;
  status: ChatStatus;
  variant?: "page" | "widget";
};

export function TaroBotAvatar({
  appearance,
  status,
  variant = "widget",
}: TaroBotAvatarProps) {
  const [loadingFace, setLoadingFace] =
    useState<LoadingFace>("LOADING_GON_ONEDOT");
  const loadingIndexRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const isLoading = status === "streaming";

  useEffect(() => {
    const imageUrls = isLoading
      ? [...Object.values(HELMET_IMAGES), ...Object.values(FACE_IMAGES)]
      : [...LOADING_FACES, "STATIC_GON" as const].map(
          (face) => FACE_IMAGES[face],
        );

    for (const imageUrl of new Set(imageUrls)) {
      const image = new Image();
      image.src = imageUrl;
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    loadingIndexRef.current = 0;
    setLoadingFace(LOADING_FACES[0]);
    const interval = window.setInterval(() => {
      if (Math.random() < 0.16) {
        setLoadingFace("STATIC_GON");
        return;
      }

      loadingIndexRef.current =
        (loadingIndexRef.current + 1) % LOADING_FACES.length;
      setLoadingFace(LOADING_FACES[loadingIndexRef.current]);
    }, reduceMotion ? 900 : 520);

    return () => window.clearInterval(interval);
  }, [isLoading, reduceMotion]);

  const displayedFace = isLoading ? loadingFace : appearance.face;
  const label = isLoading
    ? "TaroBot is thinking"
    : `TaroBot is ${FACE_LABELS[appearance.face]}`;

  return (
    <section
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center",
        variant === "page"
          ? "h-[clamp(11rem,25vh,16rem)] items-end overflow-hidden"
          : "h-32 overflow-hidden border-b border-border",
      )}
      style={{
        background:
          variant === "page"
            ? `radial-gradient(circle at 50% 62%, ${HELMET_GLOWS[appearance.helmet]} 0%, rgba(92, 110, 58, 0.9) 42%, #5c6e3a 72%)`
            : `radial-gradient(circle at 50% 62%, ${HELMET_GLOWS[appearance.helmet]} 0%, rgba(245, 239, 224, 0.035) 38%, transparent 72%)`,
      }}
    >
      <motion.div
        animate={
          isLoading && !reduceMotion
            ? { y: [0, -3, 0], rotate: [0, -0.6, 0.6, 0] }
            : { y: 0, rotate: 0 }
        }
        aria-label={label}
        className={cn(
          "relative aspect-square",
          variant === "page"
            ? "w-[clamp(11rem,25vh,16rem)]"
            : "w-[7.25rem]",
        )}
        role="img"
        transition={
          isLoading && !reduceMotion
            ? { duration: 1.8, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.25 }
        }
      >
        <AnimatePresence initial={false}>
          <motion.img
            alt=""
            animate={{ opacity: 1, scale: 1 }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 size-full select-none object-contain"
            decoding="async"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0, scale: 0.985 }}
            key={appearance.helmet}
            src={HELMET_IMAGES[appearance.helmet]}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          />
        </AnimatePresence>

        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            alt=""
            animate={{ opacity: 1, scale: 1 }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 size-full select-none object-contain"
            decoding="async"
            exit={{ opacity: 0, scale: 1.015 }}
            initial={{ opacity: 0, scale: 0.985 }}
            key={displayedFace}
            src={FACE_IMAGES[displayedFace]}
            transition={{ duration: reduceMotion ? 0 : 0.16 }}
          />
        </AnimatePresence>
      </motion.div>

      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </section>
  );
}
