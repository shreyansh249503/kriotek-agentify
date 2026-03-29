"use client";

import { motion } from "framer-motion";
import { SettingsContainer, DashboardWrapper } from "./styled";
import useMotion from "@/hooks/useMotion";

export default function SettingsPage() {
  const { containerVariants } = useMotion();

  return (
    <SettingsContainer>
      <DashboardWrapper
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        Settings
      </DashboardWrapper>
    </SettingsContainer>
  );
}
