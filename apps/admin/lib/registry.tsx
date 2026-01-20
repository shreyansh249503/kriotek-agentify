"use client";

import React, { useState } from "react";
import { StyleSheetManager, ServerStyleSheet } from "styled-components";

export default function StyledComponentsRegistry({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sheet] = useState(() => new ServerStyleSheet());

    return (
        <StyleSheetManager sheet={sheet.instance}>
            {children}
        </StyleSheetManager>
    );
}
