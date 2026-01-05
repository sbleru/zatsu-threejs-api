import { useContext } from "react";

import { PlayerContext } from "./context";
import { PlayerContextValue } from "./types";

export const usePlayer = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
};
