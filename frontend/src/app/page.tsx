"use client"
import axios from "axios";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [transactions, setTransactions] = useState([])
  const [fetching, setFetching] = useState(false)

  async function fetchTransactions() {
    setFetching(true)
    const resp = await axios.get(`http://localhost:5081/api/raydium`)
    // console.log(`[DAVID] (fetchTransactions) resp =`, resp)
    setTransactions(resp.data.data)
    setFetching(false)
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <button onClick={() => fetchTransactions()}>Get</button>
      </div>
      {
        fetching
          ? <h1>Fetching ...</h1>
          : <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
              <tr>
                <th>when</th>
                <th>who</th>
                <th>where</th>
                <th>what</th>
                <th>how</th>
                <th>spent</th>
                <th>recv</th>
              </tr>
            </thead>
            <tbody>
              {
                transactions.map((t: any) => {
                  return (<tr>
                    <td>{t.when}</td>
                    <td>{t.who}</td>
                    <td>{t.where}</td>
                    <td>{t.what}</td>
                    <td>{t.how}</td>
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
