import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hoverType, setHoverType] = useState<"default" | "button" | "text">("default");

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springSlow = { damping: 20, stiffness: 300, mass: 0.8 };
  const springFast = { damping: 30, stiffness: 800, mass: 0.1 };

  const cursorXSlow = useSpring(cursorX, springSlow);
  const cursorYSlow = useSpring(cursorY, springSlow);
  const cursorXFast = useSpring(cursorX, springFast);
  const cursorYFast = useSpring(cursorY, springFast);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Detect what the user is hovering over
      const target = e.target as HTMLElement;
      if (target.closest("button")) {
        setHoverType("button");
      } else if (target.closest("h1") || target.closest("p")) {
        setHoverType("text");
      } else {
        setHoverType("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  // Define how the outer outline changes based on what it hovers
  // Updated Variants for the Invert Effect
  const outerVariants = {
    default: { 
      scale: 1, 
      rotate: 45, 
      borderRadius: "0%", 
      backgroundColor: "rgba(52,211,153,0)",
      borderColor: "rgba(52,211,153,0.6)", // Visible border
      mixBlendMode: "normal" as any
    },
    button: { 
      scale: 2.5, 
      rotate: 90, 
      borderRadius: "50%", 
      backgroundColor: "#ffffff", // Pure white creates the perfect inversion
      borderColor: "rgba(52,211,153,0)", // Hide border
      mixBlendMode: "difference" as any // This creates the magic invert effect!
    },
    text: { 
      scale: 2.5, 
      rotate: 0, 
      borderRadius: "8px", 
      backgroundColor: "rgba(52,211,153,0.15)", 
      borderColor: "rgba(52,211,153,0)",
      mixBlendMode: "normal" as any 
    }
  };

  const innerVariants = {
    default: { scale: 1, opacity: 1 },
    button: { scale: 0, opacity: 0 }, // Hides the dot so the invert is clean
    text: { scale: 1.5, opacity: 0.5 }
  };

  return (
    <>
      {/* Outer Shape */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border pointer-events-none flex items-center justify-center z-[99999]"
        style={{ 
          x: cursorXSlow, 
          y: cursorYSlow,
          translateX: "-50%", 
          translateY: "-50%",
        }}
        variants={outerVariants}
        animate={hoverType}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Inner Dot */}
      <motion.div 
        className="fixed top-0 left-0 w-2 h-2 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] pointer-events-none z-[99999]"
        style={{ 
          x: cursorXFast, 
          y: cursorYFast,
          translateX: "-50%", 
          translateY: "-50%",
          rotate: 45
        }}
        variants={innerVariants}
        animate={hoverType}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </>
  );
}