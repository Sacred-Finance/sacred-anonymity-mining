export const listVariants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Increase the stagger effect
    },
  },
};

export const itemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8, // Start from an even smaller scale
    y: -20, // Add an initial vertical offset
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0, // Animate to normal position
    transition: {
      duration: 0.5, // Increase the duration
      ease: [0.6, -0.05, 0.01, 0.99], // Use a custom cubic bezier curve for easing
    },
  },
};
