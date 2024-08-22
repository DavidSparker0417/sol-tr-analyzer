"use client"
import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import "./style.css";

export default function Home() {
  const [transactions, setTransactions] = useState([])
  const [fetching, setFetching] = useState(false)

  async function fetchTransactions() {
    setFetching(true)
    const resp = await axios.get(`https://dev.sonexdigital.com/backend/api/raydium`)
    // console.log(`[DAVID] (fetchTransactions) resp =`, resp)
    setTransactions(resp.data.data)
    setFetching(false)
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div id="action_area">
        <label>Date Range: </label>
        <input type="calendar" id="txt_start"></input>
        <label> - </label>
        <input type="calendar" id="txt_end"></input>
        <input type="button" id="btn_get_result" onClick={() => fetchTransactions()} value="Get Result"></input>
        <input type="button" id="btn_view_analyse" value="Analyse"></input>
      </div>
      {
        <table className="main_table">
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
                transactions.map((t: any, i: number) => 
                {
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
      }
    </main>
  )
}
