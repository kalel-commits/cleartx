import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  getAccounts,
  getTransactions,
  saveTransactions,
  saveAccounts,
  generateId,
} from '../storage'
import type { Account, Transaction } from '../types'
import { detectSourceAccountFromText, extractHashtags, detectBankFromUpiText, detectUpiHandle } from '../core/accountMatcher'

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions())

  // Form state
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16))
  const [note, setNote] = useState('')
  const [accountId, setAccountId] = useState('')
  const [autoDetected, setAutoDetected] = useState<{ bank?: string; last4?: string } | null>(null)
  const [bankFromUpi, setBankFromUpi] = useState<string | null>(null)
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
    // Remove automatic default assignment - user must explicitly choose account
    // if (!accountId && accts[0]) setAccountId(accts[0].id)
  }, [])

  const isValidAmount = useMemo(() => {
    const num = Number(amount)
    return amount.trim() !== '' && !Number.isNaN(num) && num > 0
  }, [amount])

  const canSubmit = useMemo(() => {
    // Allow submission even without existing accounts - we'll create placeholder accounts
    return isValidAmount && !!date
  }, [isValidAmount, date])

  function resetForm() {
    setAmount('')
    setDate(new Date().toISOString().slice(0, 16))
    setNote('')
    setAccountId('') // Don't default to first account, let auto-detection work
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

    // Ensure we have an accountId via auto-detection before saving
    let resolvedAccountId = accountId
    // Require a UPI handle present in the note for integrity when no account is pre-selected
    const upi = detectUpiHandle(note)
    if (!resolvedAccountId && !upi) {
      setError('UPI ID not found in reference. Please include a UPI handle like name@okhdfc or mob@ybl in the note.')
      return
    }
    if (!resolvedAccountId) {
      const hit = detectSourceAccountFromText(note)
      if (hit?.last4) {
        const acct = accounts.find((a) => a.maskedNumber.endsWith(hit.last4!))
        if (acct) resolvedAccountId = acct.id
      }
    if (!resolvedAccountId && bankFromUpi) {
        const matches = accounts.filter((a) => a.nickname.toLowerCase().includes(bankFromUpi!.toLowerCase()))
        if (matches.length === 1) resolvedAccountId = matches[0].id
        
        // If no matching account found for the detected bank, create a placeholder
        if (matches.length === 0) {
          const placeholderAccount = {
            id: generateId('acct'),
            nickname: `Unlinked - ${bankFromUpi}`,
            maskedNumber: '****0000'
          }
          const updatedAccounts = [...accounts, placeholderAccount]
          setAccounts(updatedAccounts)
          saveAccounts(updatedAccounts) // Persist the new placeholder account
          resolvedAccountId = placeholderAccount.id
          setError(`Created placeholder account for ${bankFromUpi}. Please update account details in the Accounts page.`)
        }
      }
    }
    if (!resolvedAccountId) {
      setError('Could not auto-detect account from UPI reference. Please include bank hints or last 4 digits (e.g., ****1234), or visit Accounts page to add your bank account first.')
      return
    }

    if (editingId) {
      const updated = transactions.map((t) =>
        t.id === editingId
          ? {
              ...t,
              amount: parsedAmount,
              date: new Date(date).toISOString(),
              note: note.trim() || undefined,
              accountId: resolvedAccountId,
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
      accountId: resolvedAccountId,
    }

    const next = [tx, ...transactions]
    setTransactions(next)
    setHighlightId(tx.id)
    setTimeout(() => setHighlightId(null), 1200)
    setSuccess('Transaction added')
    setTimeout(() => setSuccess(null), 1800)
    resetForm()
  }

  // Auto-detect account from note (UPI ref/SMS-like text) and show tag chips
  useEffect(() => {
    if (!note) {
      setAutoDetected(null)
      setBankFromUpi(null)
      return
    }
    const b = detectBankFromUpiText(note)
    setBankFromUpi(b?.name ?? null)
    const hit = detectSourceAccountFromText(note)
    if (hit?.last4) {
      const acct = accounts.find((a) => a.maskedNumber.endsWith(hit.last4!))
      if (acct) {
        setAccountId((prev) => prev || acct.id)
        setAutoDetected({ bank: hit.bank, last4: hit.last4 })
        return
      }
    }
    setAutoDetected(null)
  }, [note, accounts])

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
            {(autoDetected || bankFromUpi || extractHashtags(note).length > 0) && (
              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                {autoDetected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    Auto: {autoDetected.bank ?? 'Bank'} • ****{autoDetected.last4}
                  </span>
                )}
                {bankFromUpi && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                    UPI: {bankFromUpi}
                  </span>
                )}
                {extractHashtags(note).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={() => setFilterKeyword('#' + t)}
                    title="Filter by tag"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">Detected Account</label>
            {(() => {
              const acctByLast4 = autoDetected?.last4
                ? accounts.find((a) => a.maskedNumber.endsWith(autoDetected.last4!))
                : null
              const bankMatches = bankFromUpi
                ? accounts.filter((a) => a.nickname.toLowerCase().includes(bankFromUpi!.toLowerCase()))
                : []
              const resolved = acctByLast4 || (bankMatches.length === 1 ? bankMatches[0] : null)

              let tone = 'border-gray-300 dark:border-gray-600'
              let icon = (
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/></svg>
              )
              let text: string

              if (resolved) {
                tone = 'border-emerald-500/60'
                icon = (
                  <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                )
                text = `${resolved.nickname} (${resolved.maskedNumber})` + (bankFromUpi ? ` • ${bankFromUpi}` : '')
              } else if (bankFromUpi && bankMatches.length > 1) {
                tone = 'border-amber-500/60'
                icon = (
                  <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
                )
                text = `${bankFromUpi} • multiple accounts found. Add ****last4 to disambiguate.`
              } else if (bankFromUpi && bankMatches.length === 0 && !autoDetected?.last4) {
                tone = 'border-red-500/60'
                icon = (
                  <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
                )
                text = `No saved ${bankFromUpi} account found. Add ****last4 in note.`
              } else {
                text = 'Add bank hint (OKHDFC, YBL) or last 4 (****1234) in UPI ref.'
              }

              return (
                <div className={`mt-1 flex items-center gap-2 rounded-md border bg-white px-2 py-1 text-sm dark:bg-gray-700 ${tone}`}>
                  {icon}
                  <span className="text-gray-700 dark:text-gray-200">{text}</span>
                </div>
              )
            })()}
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
