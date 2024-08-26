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
  const [curPage, setCurPage] = useState(0)

  var num_per_page = 100;
  var navs_arr = [];

  async function fetchTransactions() {
    setFetching(true)
    setMode('main')
    const resp = await axios.get(`https://dev.sonexdigital.com/backend/api/raydium`)
    // console.log(`[DAVID] (fetchTransactions) resp =`, resp)
    setTransactions(resp.data.data)
    setFetching(false)

    document.getElementById("tbl_analyse").style.display = "none";
    document.getElementById("tbl_transaction").style.display = "inline-grid";
    document.getElementById("div_time_range").style.display = "block";
  }

  async function fetchAnalyze() {
    setFetching(true)
    setMode('anal')
    const resp = await axios.get(`https://dev.sonexdigital.com/backend/api/raydium/summary`)

    // console.log(`[DAVID] (fetchTransactions) resp =`, resp)

    var num_navs = Math.ceil(resp.data.data.length / num_per_page);
    setSummary(resp.data.data)
    setCurPage(0)
    setFetching(false)

    document.getElementById("tbl_analyse").style.display = "inline-grid";
    document.getElementById("tbl_transaction").style.display = "none";
    document.getElementById("div_time_range").style.display = "none";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div id="action_area">
        <div id="div_time_range">
          <label>Date Range: </label>
          <input type="calendar" id="txt_start"></input>
          <label> - </label>
          <input type="calendar" id="txt_end"></input>
          <input type="button" id="btn_get_result" onClick={() => fetchTransactions()} value="Get Result"></input>
        </div>
        <input type="button" id="btn_view_analyse" onClick={() => fetchAnalyze()} value="Analyse"></input>
      </div>

      <table className="main_table" id="tbl_analyse">
        <thead>
          <tr>
            <th width="3%">No</th>
            <th width="20%">Wallet</th>
            <th width="10%">Num Trades</th>
            <th width="7%">Num Tokens</th>
            <th width="9%">Total Spent</th>
            <th width="9%">Total Receive</th>
            <th width="10%">Profit</th>
            <th width="5%">Win Rate</th>
            <th width="7%">ROI</th>
            <th width="6%">Trd / Wallet</th>
            <th width="10%">Last Trade Time</th>
          </tr>
        </thead>
        <tbody>
          {
            fetching
              ? <h1>Fetching Data ...</h1>
              : summary.slice(
                curPage * num_per_page,
                (curPage + 1) * num_per_page > summary.length ? -1 : (curPage + 1) * num_per_page)
                .map((t: any, i: number) => {
                  return (<tr>
                    <td width="3%">{i + 1}</td>
                    <td width="20%">{t.wallet}</td>
                    <td width="10%">{t.numTrades}</td>
                    <td width="7%">{t.numTokens}</td>
                    <td width="9%">{t.totalSpent}</td>
                    <td width="9%">{t.totalReceive}</td>
                    <td width="10%">{t.profit}</td>
                    <td width="5%">{t.winRate}</td>
                    <td width="7%">{t.roi}</td>
                    <td width="6%">{t.tradesPerToken}</td>
                    <td width="10%">{t.lastTradeTime}</td>
                  </tr>
                  )
                })
          }
          <div></div>
          <tr class="navigation">
            <td colspan="11">
              <dl>
                {
                  ((new Array(Math.ceil(summary.length / num_per_page))).fill(0))
                    .map((a, i) =>
                      <dd key={i}
                        onClick={({ target }) => {
                          console.log(`[DAVID] ev =`, target.innerText)
                          setCurPage(Number(target.innerText))
                        }}>
                        {i}
                      </dd>)
                }
              </dl>
            </td>
          </tr>
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
