"use client"
import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import "./style.css";

export default function Home() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState([])
  const [fetching, setFetching] = useState(false)
  const [mode, setMode] = useState('main')

  async function fetchTransactions() {
    setFetching(true)
    setMode('main')
    const resp = await axios.get(`https://dev.sonexdigital.com/backend/api/raydium`)
    // console.log(`[DAVID] (fetchTransactions) resp =`, resp)
    setTransactions(resp.data.data)
    setFetching(false)

    document.getElementById("tbl_analyse").style.display = "none";
    document.getElementById("tbl_transaction").style.display = "block";
  }

  async function fetchAnalyze() {
    setFetching(true)
    setMode('anal')
    const resp = await axios.get(`https://dev.sonexdigital.com/backend/api/raydium/summary`)
    // console.log(`[DAVID] (fetchTransactions) resp =`, resp)
    setSummary(resp.data.data)
    setFetching(false)

    document.getElementById("tbl_analyse").style.display = "block";
    document.getElementById("tbl_transaction").style.display = "none";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div id="action_area">
        <label>Date Range: </label>
        <input type="calendar" id="txt_start"></input>
        <label> - </label>
        <input type="calendar" id="txt_end"></input>
        <input type="button" id="btn_get_result" onClick={() => fetchTransactions()} value="Get Result"></input>
        <input type="button" id="btn_view_analyse" onClick={() => fetchAnalyze()} value="Analyse"></input>
      </div>

      <table className="main_table" id="tbl_analyse">
        <thead>
          <tr>
            <th>No</th>
            <th>Wallet</th>
            <th>Num Trades</th>
            <th>Num Tokens</th>
            <th>Total Spent</th>
            <th>Total Receive</th>
            <th>Profit</th>
            <th>Win Rate</th>
            <th>ROI</th>
            <th>Trades Per Wallet</th>
            <th>Last Trade Time</th>
          </tr>
        </thead>
        <tbody>
          {
            fetching
              ? <h1>Fetching Data ...</h1>
              : summary.map((t: any, i: number) => {
                return (<tr>
                  <td>{i}</td>
                  <td>{t.wallet}</td>
                  <td>{t.numTrades}</td>
                  <td>{t.numTokens}</td>
                  <td>{t.totalSpent}</td>
                  <td>{t.totalReceive}</td>
                  <td>{t.profit}</td>
                  <td>{t.winRate}</td>
                  <td>{t.roi}</td>
                  <td>{t.tradesPerToken}</td>
                  <td>{t.lastTradeTime}</td>
                </tr>
                )
              })
          }
        </tbody>
      </table>
      <table className="main_table" id="tbl_transaction">
        <thead>
          <tr>
            <th>No</th>
            <th>Time</th>
            <th>Wallet ID</th>
            <th>Plateform</th>
            <th>Token</th>
            <th>Action</th>
            <th>Spent</th>
            <th>Receive</th>
          </tr>
        </thead>
        <tbody>
          {
            fetching
              ? <h1>Fetching Data ...</h1>
              :
              transactions.map((t: any, i: number) => {
                return (<tr>
                  <td>{i}</td>
                  <td>{t.when}</td>
                  <td>{t.who}</td>
                  <td>{t.where}</td>
                  <td>{t.what}</td>
                  <td class={t.how}>{t.how}</td>
                  <td>{t.sentAsset.amount}</td>
                  <td>{t.rcvAsset.amount}</td>
                </tr>
                )
              })
          }
        </tbody>
      </table>
    </main>
  )
}
