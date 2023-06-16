import React from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

export function MotionFlexBanner({ children, ...props }) {
  return (
      <MotionDiv
          className="flex justify-between space-x-4 w-full items-center flex-col sm:flex-row rounded-b-md"
          {...props}
      >
        {children}
      </MotionDiv>
  );
}
