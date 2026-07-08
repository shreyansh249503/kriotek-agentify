"use client";

import {
  // Features,
  FinalCTA,
  Hero,
  // HowItWorks,
  // SalesShowcase,
  LiveDemo,
  TrustedBy,
  WhatAgentifyProvides,
  RealTimeInsights,
  FeaturedCapability,
  HowItWork,
} from "./sections";

export const Home = () => {
  return (
    <>
      <Hero />
      <TrustedBy />
      <WhatAgentifyProvides />
      <RealTimeInsights />
      <FeaturedCapability />
      <HowItWork />
      {/* <Features /> */}
      {/* <SalesShowcase /> */}
      <LiveDemo />
      {/* <HowItWorks /> */}
      <FinalCTA />
    </>
  );
};
