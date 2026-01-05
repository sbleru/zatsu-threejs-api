import { createContext } from "react";

import { PlayerContextValue } from "./types";

export const PlayerContext = createContext<PlayerContextValue | null>(null);
