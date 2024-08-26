import { SERVER_WSS } from "@/constants";
import { useEffect } from "react";

export default function useWss() {
  useEffect(() => {
    const wss = new WebSocket(SERVER_WSS)
    wss.onopen = () => {
      console.log("Connected to websocket server.")
    }

    wss.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log(`[DAVID](WSS) onMessage :`, message)
    }
  }, [])

  return {}
}