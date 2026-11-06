"use client";

import React from "react";
import { ToastMessage } from "../../styled";

interface ToastNotificationProps {
  visible: boolean;
  message: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  message,
}) => {
  return (
    <ToastMessage $visible={visible}>
      <span>✓</span> {message}
    </ToastMessage>
  );
};
