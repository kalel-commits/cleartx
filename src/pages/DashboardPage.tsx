import { useEffect, useMemo, useState } from 'react'
import { getAccounts, getTransactions } from '../storage'
import type { Account, Transaction } from '../types'
import config from '../config'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function toLocalDateTimeString(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  // Removed AI and Transit UI/state
	const [pluginStatus, setPluginStatus] = useState<any | null>(null)
	const [showPluginStatus, setShowPluginStatus] = useState(false)

  useEffect(() => {
    setAccounts(getAccounts())
    setTransactions(getTransactions())
  }, [])

  const accountById = useMemo(() => {
    const map = new Map<string, Account>()
    for (const a of accounts) map.set(a.id, a)
    return map
  }, [accounts])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    return transactions.filter((t) => {
      if (accountFilter !== 'all' && t.accountId !== accountFilter) return false
      const d = new Date(t.date)
      if (start && d < start) return false
      if (end && d > new Date(new Date(end).setHours(23, 59, 59, 999))) return false
      if (s && !(t.note?.toLowerCase().includes(s))) return false
      return true
    })
  }, [transactions, accountFilter, startDate, endDate, search])

  // Removed AI and Transit effects

  function exportCsv() {
    const header = ['Amount', 'Date', 'UPI Ref/Note', 'Account']
    const rows = filtered.map((t) => [
      t.amount,
      new Date(t.date).toISOString(),
      t.note ?? '',
      accountById.get(t.accountId)?.nickname ?? '',
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cleartx-transactions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
		<div className="space-y-4">

      {/* AI Insights and Transit cards removed */}

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">Account</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <option value="all">All</option>
              {accounts.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.nickname} ({a.maskedNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">End Date</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Search</label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="UPI ref or notes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="lg:col-span-5 flex gap-3">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
              onClick={exportCsv}
            >
              Export CSV
            </button>
            
				{/* Show Plugin Status */}
				<button
					className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
					onClick={() => {
						if (showPluginStatus) {
							setShowPluginStatus(false)
							return
						}
						const mgr: any = (window as any).pluginManager
						if (mgr && typeof mgr.getSystemStatus === 'function') {
							const status = mgr.getSystemStatus()
							setPluginStatus(status)
							setShowPluginStatus(true)
						}
					}}
				>
					{showPluginStatus ? 'Hide Plugin Status' : 'Show Plugin Status'}
				</button>
          </div>
        </div>

		{pluginStatus && showPluginStatus && (
			<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<h2 className="mb-2 text-lg font-semibold">Plugin Status</h2>
				<pre className="whitespace-pre-wrap text-sm">{JSON.stringify(pluginStatus, null, 2)}</pre>
			</div>
		)}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-0 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/40">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">UPI Ref/Note</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>No transactions.</td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-2 text-sm">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-2 text-sm">{toLocalDateTimeString(t.date)}</td>
                  <td className="px-4 py-2 text-sm">{t.note ?? ''}</td>
                  <td className="px-4 py-2 text-sm">{accountById.get(t.accountId)?.nickname ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



