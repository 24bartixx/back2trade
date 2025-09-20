"use client";

import React, { createContext, useContext, useReducer } from "react";
import { GameOptions } from "@/types/game-options";

type Action =
  | { type: "SetStartDate"; startDate: Date | null }
  | { type: "SetFinishDate"; finishDate: Date | null }
  | { type: "SetAccountBalance"; accountBalance: number }
  | { type: "SetCryptoSymbol"; cryptoSymbol: string };

const INITIAL_STATE: GameOptions = {
  startDate: null,
  finishDate: null,
  startingAccountBalance: 10_000,
  cryptoSymbol: "",
};

function gameOptionsReducer(state: GameOptions, action: Action): GameOptions {
  switch (action.type) {
    case "SetStartDate":
      return { ...state, startDate: action.startDate };
    case "SetFinishDate":
      return { ...state, finishDate: action.finishDate };
    case "SetAccountBalance":
      return { ...state, startingAccountBalance: action.accountBalance };
    case "SetCryptoSymbol":
      return { ...state, cryptoSymbol: action.cryptoSymbol };
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

type Ctx = { state: GameOptions; dispatch: React.Dispatch<Action> };
const GameOptionsContext = createContext<Ctx | undefined>(undefined);

export function GameOptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(gameOptionsReducer, INITIAL_STATE);
  return (
    <GameOptionsContext.Provider value={{ state, dispatch }}>
      {children}
    </GameOptionsContext.Provider>
  );
}

export function useGameOptions() {
  const ctx = useContext(GameOptionsContext);
  if (!ctx)
    throw new Error("useGameOptions must be used within <GameOptionsProvider>");
  return ctx;
}
