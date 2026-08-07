import { renderHook } from "@testing-library/react";
import useMotion from "./useMotion";

describe("useMotion Hook", () => {
  it("should return containerVariants and itemVariants with correct motion configurations", () => {
    const { result } = renderHook(() => useMotion());

    expect(result.current.containerVariants).toBeDefined();
    expect(result.current.containerVariants.hidden).toEqual({ opacity: 0 });
    expect(result.current.containerVariants.visible).toEqual({
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    });

    expect(result.current.itemVariants).toBeDefined();
    expect(result.current.itemVariants.hidden).toEqual({ y: 20, opacity: 0 });
    expect(result.current.itemVariants.visible).toEqual({
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    });
  });
});
