"use client"
import axios from "axios";
import Image from "next/image";
import { useEffect, useCallback, useMemo, useState } from "react";
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
  const [numPerPage, setNumPerPage] = useState(100)

  const [sortProfit, setSortProfit] = useState("")
  const [sortWinRate, setSortWinRate] = useState("desc")
  const [sortNumTrades, setSortNumTrades] = useState("")
  const [sortNumTokens, setSortNumTokens] = useState("")
  const [sortTotalSpent, setSortTotalSpent] = useState("")
  const [sortTotalReceive, setSortTotalReceive] = useState("")
  const [sortTradesPerToken, setSortTradesPerToken] = useState("")
  const [sortLastTradeTime, setSortLastTradeTime] = useState("")
  const [sortROI, setSortROI] = useState("")

  let countDownIntervalId: any
  let dispNumPerPage = 100;
  
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

  useEffect(() => {fetchAnalyze();}, [sortWinRate, sortProfit, sortNumTrades, sortNumTokens, sortTotalSpent, sortTotalReceive, sortTradesPerToken, sortROI, sortLastTradeTime])
  
  const fetchAnalyze = useCallback(async (page: number = 1) => {
    const end = new Date().getTime()
    const start = end - 3600 * 1000
    var query = "numPerPage=100";

    if(sortWinRate != "")
      query = query + "&sortBy=winRate&isDecending=" + (sortWinRate == "desc");
    else if(sortProfit != "")
      query = query + "&sortBy=profit&isDecending=" + (sortProfit == "desc");
    else if(sortNumTrades != "")
      query = query + "&sortBy=numTrades&isDecending=" + (sortNumTrades == "desc");
    else if(sortNumTokens != "")
      query = query + "&sortBy=numTokens&isDecending=" + (sortNumTokens == "desc");
    else if(sortTotalSpent != "")
      query = query + "&sortBy=totalSpent&isDecending=" + (sortTotalSpent == "desc");
    else if(sortTotalReceive != "")
      query = query + "&sortBy=totalReceive&isDecending=" + (sortTotalReceive == "desc");
    else if(sortTradesPerToken != "")
      query = query + "&sortBy=tradesPerToken&isDecending=" + (sortTradesPerToken == "desc");
    else if(sortROI != "")
      query = query + "&sortBy=roi&isDecending=" + (sortROI == "desc");
    else if(sortLastTradeTime != "")
      query = query + "&sortBy=lastTradeTime&isDecending=" + (sortLastTradeTime == "desc");

console.log(query);

    const resp = await axios.get(`${SERVER_URL}/summary?page=${page-1}&${query}`)

    setTotalCount(resp.data.totalCount)

    setSummary(resp.data.data)
    setCurPage(page)

    document.getElementById("search_area").style.display = "block";
    document.getElementById("tbl_analyse").style.display = "inline-grid";

    document.getElementById("div_transaction").style.display = "none";
    document.getElementById("div_time_range").style.display = "none";

    document.getElementById("btn_view_analyse").style.display = "none";
    document.getElementById("btn_back_trans").style.display = "block";
  }, [summary, curPage, sortWinRate, sortProfit, sortNumTrades, sortNumTokens, sortTotalSpent, sortTotalReceive, sortTradesPerToken, sortROI, sortLastTradeTime])

  async function backToTransaction() {
    document.getElementById("btn_view_analyse").style.display = "block";
    document.getElementById("btn_back_trans").style.display = "none";
    document.getElementById("search_area").style.display = "none";

    document.getElementById("tbl_analyse").style.display = "none";
    document.getElementById("div_time_range").style.display = "block";
    document.getElementById("div_transaction").style.display = "block";
  }

  function changeClassSort(target)
  {
    var prev_asc  = document.getElementsByClassName("asc");
    var prev_desc = document.getElementsByClassName("desc");
    var new_class = "";

    if(target.classList[0])
    {
      new_class = (target.classList[0] == "desc") ? "asc" : "desc"
    }
    else
    {
      if(prev_asc[0])
      {
        prev_asc[0].removeAttribute("class");
      }
      else if(prev_desc[0])
      {
        prev_desc[0].removeAttribute("class");
      }

      new_class = "asc";
    }

    if(!target.className)
      target.className = "asc";

    return new_class;
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
            <th width="10%" class={sortNumTrades} onClick= {({ target }) => { 
                setSortNumTrades(changeClassSort(target));
                setSortProfit(""); 
                setSortWinRate(""); 
                setSortNumTokens("");
                setSortTotalSpent("");
                setSortTotalReceive("");
                setSortTradesPerToken("");
                setSortROI("");
                setSortLastTradeTime("");
            }}>Num Trades</th>
            <th width="7%" class={sortNumTokens} onClick= {({ target }) => { 
                setSortNumTrades("");
                setSortProfit(""); 
                setSortWinRate(""); 
                setSortNumTokens(changeClassSort(target));
                setSortTotalSpent("");
                setSortTotalReceive("");
                setSortTradesPerToken("");
                setSortROI("");
                setSortLastTradeTime("");
            }}>Num Tokens</th>
            <th width="9%" class={sortTotalSpent} onClick= {({ target }) => { 
                setSortNumTrades("");
                setSortProfit(""); 
                setSortWinRate(""); 
                setSortNumTokens("");
                setSortTotalSpent(changeClassSort(target));
                setSortTotalReceive("");
                setSortTradesPerToken("");
                setSortROI("");
                setSortLastTradeTime("");
            }}>Total Spent</th>
            <th width="9%" class={sortTotalReceive} onClick= {({ target }) => { 
                setSortNumTrades("");
                setSortProfit(""); 
                setSortWinRate(""); 
                setSortNumTokens("");
                setSortTotalSpent("");
                setSortTotalReceive(changeClassSort(target));
                setSortTradesPerToken("");
                setSortROI("");
                setSortLastTradeTime("");
            }}>Total Receive</th>
            <th width="10%" class={sortProfit} onClick= {({ target }) => { 
                setSortProfit(changeClassSort(target)); 
                setSortWinRate(""); 
                setSortNumTrades("");
                setSortNumTokens("");
                setSortTotalSpent("");
                setSortTotalReceive("");
                setSortTradesPerToken("");
                setSortROI("");
                setSortLastTradeTime("");
            }}>Profit</th>
            <th width="5%" class={sortWinRate} onClick= {({ target }) => { 
              setSortWinRate(changeClassSort(target)); 
              setSortProfit(""); 
              setSortNumTrades("");
              setSortNumTokens("");
              setSortTotalSpent("");
              setSortTotalReceive("");
              setSortTradesPerToken("");
              setSortROI("");
              setSortLastTradeTime("");
            }}>Win Rate</th>
            <th width="7%" class={sortROI} onClick= {({ target }) => { 
              setSortWinRate(""); 
              setSortProfit(""); 
              setSortNumTrades("");
              setSortNumTokens("");
              setSortTotalSpent("");
              setSortTotalReceive("");
              setSortTradesPerToken("");
              setSortROI(changeClassSort(target));
              setSortLastTradeTime("");
            }}>ROI</th>
            <th width="6%" class={sortTradesPerToken} onClick= {({ target }) => { 
              setSortWinRate(""); 
              setSortProfit(""); 
              setSortNumTrades("");
              setSortNumTokens("");
              setSortTotalSpent("");
              setSortTotalReceive("");
              setSortTradesPerToken(changeClassSort(target));
              setSortROI("");
              setSortLastTradeTime("");
            }}>Trd / Token</th>
            <th width="10%" class={sortLastTradeTime} onClick= {({ target }) => { 
              setSortWinRate(""); 
              setSortProfit(""); 
              setSortNumTrades("");
              setSortNumTokens("");
              setSortTotalSpent("");
              setSortTotalReceive("");
              setSortTradesPerToken("");
              setSortROI("");
              setSortLastTradeTime(changeClassSort(target));
            }}>Last Trade Time</th>
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
              <label>Page Number: </label>
              <select onChange={({ target }) => {
                          // console.log(`[DAVID] ev =`, target.innerText)
                    // console.log(target);

                    var prev_sel = document.getElementsByClassName("nav_selected");

                    if (prev_sel[0])
                      prev_sel[0].classList.remove("nav_selected");

                    target.classList.add("nav_selected");

                    const page = Number(target.value)
                    setCurPage(page)
                    fetchAnalyze(page)
                  }}>
                {
                  ((new Array(Math.ceil(totalCount / numPerPage))).fill(0))
                    .map((a, i) =>
                      <option key={i}>
                        {i + 1}
                      </option>)
                }
              </select>
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
            : <h1>Data is Loading now. Please wait ...</h1>
        }
      </div>
    </main>
  )
}
