"use client"
import axios from "axios";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import "./style.css";
import { SERVER_URL } from "@/constants";
import useTrFetching from "@/hooks/tr-fetch";

function formatTimeFromMicroseconds(microseconds: number): string {
  // Convert microseconds to seconds
  const totalSeconds = Math.floor(microseconds / 1_000);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the result as hh:mm:ss
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export default function Home() {
  const [summary, setSummary] = useState([])
  const [fetching, setFetching] = useState(false)
  const [curPage, setCurPage] = useState(1)
  const [totalTrCount, setTotalTrCount] = useState(0)
  const { fetchedCount, resetFetchCount, transaction } = useTrFetching()
  const [searchWallet, setSearchWallet] = useState("")
  const [totalCount, setTotalCount] = useState(0)

  let countDownIntervalId: any
  var num_per_page = 100;

  const searchedResult = useMemo(() => {
    return searchWallet ? summary.filter((s: any) => s.wallet.includes(searchWallet)) : summary
  }, [searchWallet, summary])

  useEffect(() => {
    if (!fetchedCount || !totalTrCount)
      return
    if (fetchedCount === totalTrCount) {
      setFetching(false)
      clearInterval(countDownIntervalId)
    }
  }, [fetchedCount])

  async function fetchTransactions() {
    setFetching(true)
    resetFetchCount()
    setTotalTrCount(0)
    const resp = await axios.get(`${SERVER_URL}/fetch`)
    console.log(`[DAVID] (fetchTransactions) resp =`, resp)
    const trCount = resp.data.trCount
    setTotalTrCount(trCount)

    document.getElementById("tbl_analyse").style.display = "none";
    document.getElementById("div_time_range").style.display = "block";
  }

  async function fetchAnalyze(page: number = 1) {
    const end = new Date().getTime()
    const start = end - 3600 * 1000
    const resp = await axios.get(`${SERVER_URL}/summary?page=${page-1}&numPerPage=100&sortBy=winRate&isDecending=true`)
    console.log(`[DAVID] (fetchTransactions) totalCount =`, resp.data.totalCount)
    setTotalCount(resp.data.totalCount)

    setSummary(resp.data.data)
    setCurPage(page)

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
        <input type="button" id="btn_view_analyse" onClick={() => fetchAnalyze(1)} value="Analyse"></input>
        <input type="button" id="btn_back_trans" onClick={() => backToTransaction()} value="Back"></input>
      </div>

      <div id="search_area">
        <label>Wallet Address : </label>
        <input
          type="text"
          id="txt_wallet"
          value={searchWallet}
          onChange={({ target }) => {
            setSearchWallet(target.value)
          }}
        />
        <input
          type="button"
          id="btn_search_wallet"
          value="Search"
          onClick={() => {
            const searchResult = summary.filter((s: any) => s.wallet === searchWallet)
            console.log(searchResult)
          }}>

        </input>
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
            searchedResult.map((t: any, i: number) => {
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
                  ((new Array(Math.ceil(totalCount / num_per_page))).fill(0))
                    .map((a, i) =>
                      <dd key={i}
                        onClick={({ target }) => {
                          // console.log(`[DAVID] ev =`, target.innerText)
                          // console.log(target);

                          var prev_sel = document.getElementsByClassName("nav_selected");

                          if (prev_sel[0])
                            prev_sel[0].classList.remove("nav_selected");

                          target.classList.add("nav_selected");
                          const page = Number(target.innerText)
                          setCurPage(page)
                          fetchAnalyze(page)
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
                <span>Fetching : </span><span>{(fetchedCount * 100 / totalTrCount).toFixed(1)}% ({fetchedCount} / {totalTrCount})</span>
                <span id="label_remain_time">{formatTimeFromMicroseconds(totalTrCount ? (totalTrCount - fetchedCount) * 100 : 0)}</span>
              </div>
              {
                transaction
                  ? (<div>
                    <span>fetching {transaction.signature?.slice(0, 4) + "..." + transaction.signature?.slice(-4) + (transaction.platform ? " on " + transaction.platform : "")} ...</span>
                  </div>)
                  : <></>
              }
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
