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
  EverythingYouNeed,
  BotOverview,
  MakeItYours,
} from "./sections";

export const Home = () => {
  return (
    <>
      <Hero />
      <TrustedBy />
      <WhatAgentifyProvides />
      <RealTimeInsights />
      <EverythingYouNeed />
      <BotOverview />
      <FeaturedCapability />
      <HowItWork />
      {/* <Features /> */}
      {/* <SalesShowcase /> */}
      <LiveDemo />
      <MakeItYours />
      {/* <HowItWorks /> */}
      <FinalCTA />
    </>
  );
};
