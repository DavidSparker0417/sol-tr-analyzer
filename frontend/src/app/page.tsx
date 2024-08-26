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
    // const resp = await axios.get(`https://dev.sonexdigital.com/backend/api/raydium`)
    // console.log(`[DAVID] (fetchTransactions) resp =`, resp)
    setTransactions(resp.data.data)
    setFetching(false)

    document.getElementById("tbl_analyse").style.display = "none";
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

    document.getElementById("search_area").style.display = "block";
    document.getElementById("tbl_analyse").style.display = "inline-grid";

    document.getElementById("div_transaction").style.display = "none";
    document.getElementById("div_time_range").style.display = "none";

    document.getElementById("btn_view_analyse").style.display = "none";
    document.getElementById("btn_back_trans").style.display = "block";
  }

  async function backToTransaction() {
    document.getElementById("btn_view_analyse").style.display = "block";
    document.getElementById("btn_back_trans").style.display = "none";
    document.getElementById("search_area").style.display = "none";

    document.getElementById("tbl_analyse").style.display = "none";
    document.getElementById("div_time_range").style.display = "block";
    document.getElementById("div_transaction").style.display = "block";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div id="action_area">
        <div id="div_time_range">
          <label>Date Range: </label>
          <input type="calendar" id="txt_start"></input>
          <label> - </label>
          <input type="calendar" id="txt_end"></input>
          <input type="button" id="btn_get_result" onClick={() => fetchTransactions()} value="Fetch Data"></input>
        </div>
        <input type="button" id="btn_view_analyse" onClick={() => fetchAnalyze()} value="Analyse"></input>
        <input type="button" id="btn_back_trans" onClick={() => backToTransaction()} value="Back"></input>
      </div>

      <div id="search_area">
        <label>Wallet Address : </label>
        <input type="text" id="txt_wallet"></input>
        <input type="button" id="btn_search_wallet" value="Search"></input>
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
                          console.log(target);

                          var prev_sel = document.getElementsByClassName("nav_selected");

                          if(prev_sel[0])
                            prev_sel[0].classList.remove("nav_selected");

                          target.classList.add("nav_selected");
                          setCurPage(Number(target.innerText))
                        }}>
                        {i + 1}
                      </dd>)
                }
              </dl>
            </td>
          </tr>
        </tbody>
      </table>
      <div id="div_transaction">
      {
        fetching
        ? <div id="status_area">
          <div id="detail_info">
            <span>Fetching : </span><span>35% (5,305 / 123,506)</span> 
            <span id="label_remain_time">12:23:52</span>
          </div>
          <div id="progress_fetching">
            <div id="progress_fill"></div>
          </div>
        </div>
        : <h1>Please click on Fetch button to get data</h1>
      }
      </div>
    </main>
  )
}
