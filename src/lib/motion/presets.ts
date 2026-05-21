import { Variants } from "framer-motion";

const easing: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: easing },
  },
};

export const scaleSoft: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.015,
    transition: { duration: 0.18, ease: easing },
  },
};

export const hoverLift: Variants = {
  initial: { y: 0 },
  hover: {
    y: -3,
    transition: { duration: 0.2, ease: easing },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: easing },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: easing },
  },
};
