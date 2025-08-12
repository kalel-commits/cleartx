import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getAccounts, getTransactions, saveTransactions, generateId } from '../storage'
import type { Account, Transaction } from '../types'

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16)) // yyyy-MM-ddTHH:mm
  const [note, setNote] = useState('')
  const [accountId, setAccountId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accts = getAccounts()
    setAccounts(accts)
    setAccountId((prev) => (prev || (accts[0]?.id ?? '')))
    setTransactions(getTransactions())
  }, [])

  const canSubmit = useMemo(() => {
    return accounts.length > 0 && amount.trim() !== '' && !Number.isNaN(Number(amount))
  }, [accounts.length, amount])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (accounts.length === 0) {
      setError('Please add an account first on the Accounts page')
      return
    }
    const parsedAmount = Number(amount)
    if (Number.isNaN(parsedAmount)) {
      setError('Amount must be a valid number')
      return
    }
    if (!accountId) {
      setError('Please select an account')
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
    saveTransactions(next)
    setAmount('')
    setDate(new Date().toISOString().slice(0, 16))
    setNote('')
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">Amount</label>
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
            <label className="text-sm text-gray-600 dark:text-gray-300">Date/Time</label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">UPI Ref / Notes</label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ABC123XYZ"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">Account</label>
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
          {error && <div className="md:col-span-2 lg:col-span-4 text-sm text-red-600">{error}</div>}
          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300">Transactions can be viewed on the Dashboard.</p>
    </div>
  )
}


