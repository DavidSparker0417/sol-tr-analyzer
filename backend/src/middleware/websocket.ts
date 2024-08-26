import { Express } from "express";
import http from "http"
import WebSocket from "ws"

const server = http.createServer()
const wss = new WebSocket.Server({server})

export function wssCreate(app: Express) {
  const server = http.createServer(app)
  const wss = new WebSocket.Server({server})
}

export function wssSend(data: any) {
  wss.clients.forEach((client:any) => {
    if (client.readyState === WebSocket.OPEN)
      client.send(data)
  })
}