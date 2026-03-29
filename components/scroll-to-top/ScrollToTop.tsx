"use client";

import { useState, useEffect } from "react";
import { CaretUpIcon } from "@phosphor-icons/react";
import { ScrollButton } from "./styled";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <ScrollButton
      $visible={isVisible}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <CaretUpIcon weight="bold" />
    </ScrollButton>
  );
};
