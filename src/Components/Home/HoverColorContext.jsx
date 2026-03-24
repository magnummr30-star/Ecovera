import React, { createContext, useContext } from "react";

export const HoverColorContext = createContext(null);

export function useHoverColor() {
  const ctx = useContext(HoverColorContext);
  return ctx ?? { hoverColor: null, setHoverColor: () => {} };
}
