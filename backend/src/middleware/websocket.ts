import { Express } from "express";
import WebSocket from "ws"
import http from "http"

const wssPort = 5082
const server = http.createServer()
const wss = new WebSocket.Server({server})

server.listen(wssPort, async() => {
  console.log(`WebSocket server is running on ${wssPort} port as wss`);
})

wss.on('connection', (socket:WebSocket, request:any) => {
  console.log(`[DAVID](WSS) connection ...`)
})

export function wssSend(data: any) {
  if (!wss)
    return
  // console.log(wss.clients)
  wss.clients.forEach((client:any) => {
    if (client.readyState === WebSocket.OPEN)
      client.send(JSON.stringify(data))
  })
}