"use client";

import {
  Features,
  FinalCTA,
  Hero,
  HowItWorks,
  SalesShowcase,
  LiveDemo,
  TrustedBy,
  WhatAgentifyProvides,
} from "./sections";

export const Home = () => {
  return (
    <>
      <Hero />
      <TrustedBy />
      <WhatAgentifyProvides />
      <Features />
      <SalesShowcase />
      <LiveDemo />
      <HowItWorks />
      <FinalCTA />
    </>
  );
};
