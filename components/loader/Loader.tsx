"use client";

import { LoaderContainer, Spinner } from "./styled";

interface LoaderProps {
  fullScreen?: boolean;
}

export const Loader = ({ fullScreen = false }: LoaderProps) => {
  return (
    <LoaderContainer $fullScreen={fullScreen}>
      <Spinner />
    </LoaderContainer>
  );
};
