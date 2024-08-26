"use client";
import { SERVER_WSS } from "@/constants";
import React, { createContext } from "react";

const WssContext = createContext<undefined>(
  undefined,
);

export default function WssContextProvider({children}:{children:React.ReactNode}) {
  const wss = new WebSocket(SERVER_WSS)
  wss.onopen = () => {
    console.log("[DAVID] Connected to websocket server.")
  }
  return (<WssContext.Provider value={undefined}>
    {children}
  </WssContext.Provider>)
}