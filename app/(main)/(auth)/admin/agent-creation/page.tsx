"use client";

import React, { Suspense } from "react";
import AgentCreation from "./AgentCreation";
import { Loader } from "@/components";

export default function AgentCreationPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader />
        </div>
      }
    >
      <AgentCreation />
    </Suspense>
  );
}
