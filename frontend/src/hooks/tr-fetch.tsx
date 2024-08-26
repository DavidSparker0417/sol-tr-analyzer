import { SERVER_WSS } from "@/constants";
import { useState } from "react";

let wss = new WebSocket(SERVER_WSS)
wss.onopen = () => {
  console.log("[DAVID] Connected to websocket server.")
}

wss.onerror = (e: Event) => {
  console.log(`[DAVID](WSS) error :`, e)
}

wss.onclose = (e: Event) => {
  console.log(`[DAVID](WSS) Connection closed :`, e)
  setInterval(() => {
    try {
      // console.log(`[DAVID](WSS) Connection state :`, wss.readyState)
      if (wss.readyState === WebSocket.CLOSED) {
        wss = new WebSocket(SERVER_WSS) 
      }
    } catch (error) { }
  }, 1000)
}

export default function useTrFetching() {

  const [fetchedCount, setFetchedCount] = useState(0)
  const [fetchBlockCount, setFetchBlockCount] = useState(0)
  const [transaction, setTransaction] = useState(undefined)

  function resetFetchCount() {
    setFetchedCount(0)
    setFetchBlockCount(0)
    setTransaction(undefined)
  }

  wss.onmessage = (event: any) => {
    const message = JSON.parse(event.data)
    switch (message.cmd) {
      case 'siglist':
        // console.log(message)
        const totalCount = fetchBlockCount + message.trCount
        setFetchBlockCount(totalCount)
        if (totalCount > fetchedCount)
          setFetchedCount(totalCount)
        break;
      case 'transaction':
        // console.log(message)
        setTransaction(message)
        setFetchedCount(fetchedCount + 1)
        break
      default:
        break;
    }
  }

  return {
    fetchedCount,
    resetFetchCount,
    transaction
  }
}