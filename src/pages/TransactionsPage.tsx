import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  getAccounts,
  getTransactions,
  saveTransactions,
  generateId,
} from '../storage'
import type { Account, Transaction } from '../types'

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Form state
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16))
  const [note, setNote] = useState('')
  const [accountId, setAccountId] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Messages
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filters
  const [filterAccount, setFilterAccount] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')

  useEffect(() => {
    const accts = getAccounts()
    setAccounts(accts)
    if (!accountId && accts[0]) setAccountId(accts[0].id)
    setTransactions(getTransactions())
  }, [])

  const isValidAmount = useMemo(() => {
    const num = Number(amount)
    return amount.trim() !== '' && !Number.isNaN(num) && num > 0
  }, [amount])

  const canSubmit = useMemo(() => {
    return accounts.length > 0 && isValidAmount && !!accountId && !!date
  }, [accounts.length, isValidAmount, accountId, date])

  function resetForm() {
    setAmount('')
    setDate(new Date().toISOString().slice(0, 16))
    setNote('')
    setAccountId(accounts[0]?.id || '')
    setEditingId(null)
    setError(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      setError('Please fill in all required fields')
      return
    }

    const parsedAmount = Number(amount)

    if (editingId) {
      const updated = transactions.map((t) =>
        t.id === editingId
          ? {
              ...t,
              amount: parsedAmount,
              date: new Date(date).toISOString(),
              note: note.trim() || undefined,
              accountId,
            }
          : t
      )
      setTransactions(updated)
      setSuccess('Transaction updated')
      setTimeout(() => setSuccess(null), 1800)
      resetForm()
      return
    }

    const tx: Transaction = {
      id: generateId('txn'),
      amount: parsedAmount,
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
      accountId,
    }

    const next = [tx, ...transactions]
    setTransactions(next)
    setHighlightId(tx.id)
    setTimeout(() => setHighlightId(null), 1200)
    setSuccess('Transaction added')
    setTimeout(() => setSuccess(null), 1800)
    resetForm()
  }

  function handleEdit(tx: Transaction) {
    setEditingId(tx.id)
    setAmount(String(tx.amount))
    setDate(new Date(tx.date).toISOString().slice(0, 16))
    setNote(tx.note || '')
    setAccountId(tx.accountId)
  }

  function handleDelete(id: string) {
    setRemovingId(id)
    setTimeout(() => {
      const next = transactions.filter((t) => t.id !== id)
      setTransactions(next)
      setRemovingId(null)
      setSuccess('Transaction deleted')
      setTimeout(() => setSuccess(null), 1800)
      if (editingId === id) resetForm()
    }, 200)
  }

  // Persist transactions whenever they change
  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const start = filterStart ? new Date(filterStart) : null
    const end = filterEnd ? new Date(`${filterEnd}T23:59:59.999`) : null
    return transactions.filter((t) => {
      const acct = accounts.find((a) => a.id === t.accountId)
      const matchesAccount = !filterAccount || t.accountId === filterAccount
      const matchesKeyword =
        !filterKeyword ||
        (t.note?.toLowerCase().includes(filterKeyword.toLowerCase()) ||
          acct?.nickname.toLowerCase().includes(filterKeyword.toLowerCase()))
      const d = new Date(t.date)
      const matchesStart = !start || d >= start
      const matchesEnd = !end || d <= end
      return matchesAccount && matchesKeyword && matchesStart && matchesEnd
    })
  }, [transactions, accounts, filterAccount, filterKeyword, filterStart, filterEnd])

  function exportCSV() {
    const headers = ['Date', 'Account', 'Amount', 'Note']
    const escapeCsv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = filteredTransactions.map((t) => {
      const acct = accounts.find((a) => a.id === t.accountId)
      return [
        new Date(t.date).toLocaleString(),
        acct?.nickname || '',
        t.amount.toFixed(2),
        t.note || '',
      ]
    })
    const csvContent = [headers, ...rows]
      .map((r) => r.map(escapeCsv).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'transactions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold">
          {editingId ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Amount
            </label>
            <div className="flex items-center rounded-md border border-gray-300 bg-white pl-2 pr-3 dark:border-gray-600 dark:bg-gray-700">
              <span className="text-gray-500">₹</span>
              <input
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Date/Time
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              UPI Ref / Notes
            </label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ABC123XYZ"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Account
            </label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={accounts.length === 0}
            >
              {accounts.length === 0 ? (
                <option value="">Add an account first</option>
              ) : (
                accounts.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.nickname} ({a.maskedNumber})
                  </option>
                ))
              )}
            </select>
          </div>
          {error && (
            <div className="md:col-span-2 lg:col-span-4 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="md:col-span-2 lg:col-span-4 text-sm text-green-600">
              {success}
            </div>
          )}
          <div className="md:col-span-2 lg:col-span-4 flex gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {editingId ? 'Save Changes' : 'Add Transaction'}
            </button>
            {editingId && (
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => (
            <option value={a.id} key={a.id}>
              {a.nickname}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
        />
        <input
          type="date"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search notes/account"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)}
        />
        <button
          onClick={exportCSV}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-base font-semibold">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/40">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Date/Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Account
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Note
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-3 text-sm text-gray-500"
                    colSpan={5}
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
              {filteredTransactions.map((t) => {
                const acct = accounts.find((a) => a.id === t.accountId)
                return (
                  <tr
                    key={t.id}
                    className={[
                      'transition-all duration-200',
                      'hover:bg-gray-50 dark:hover:bg-gray-700/30',
                      highlightId === t.id && 'bg-green-50 dark:bg-green-900/20',
                      removingId === t.id && 'opacity-0 -translate-y-1',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <td className="px-4 py-2 text-sm">
                      {new Date(t.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {acct?.nickname || 'Unknown'}
                    </td>
                    <td className="px-4 py-2 text-sm font-mono">
                      ₹{t.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm">{t.note || ''}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleEdit(t)}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          onClick={() => handleDelete(t.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
