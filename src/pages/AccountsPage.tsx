import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getAccounts, saveAccounts, generateId } from '../storage'
import type { Account } from '../types'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts())
  const [nickname, setNickname] = useState('')
  const [maskedNumber, setMaskedNumber] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const isValidMasked = useMemo(() => /^\*{4}\d{4}$/.test(maskedNumber), [maskedNumber])

  function resetForm() {
    setNickname('')
    setMaskedNumber('')
    setEditingId(null)
    setError(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) {
      setError('Nickname is required')
      return
    }
    if (!isValidMasked) {
      setError('Masked number must be in the format ****1234')
      return
    }
    if (editingId) {
      const updated = accounts.map((a) => (a.id === editingId ? { ...a, nickname: nickname.trim(), maskedNumber } : a))
      setAccounts(updated)
      setSuccess('Account updated')
      setTimeout(() => setSuccess(null), 1800)
      resetForm()
      return
    }

    const newAccount: Account = {
      id: generateId('acct'),
      nickname: nickname.trim(),
      maskedNumber,
    }
    const next = [newAccount, ...accounts]
    setAccounts(next)
    setHighlightId(newAccount.id)
    setTimeout(() => setHighlightId(null), 1200)
    setSuccess('Account added')
    setTimeout(() => setSuccess(null), 1800)
    resetForm()
  }

  function handleEdit(account: Account) {
    setEditingId(account.id)
    setNickname(account.nickname)
    setMaskedNumber(account.maskedNumber)
  }

  function handleDelete(id: string) {
    setRemovingId(id)
    // Allow CSS transition to play before removing from state
    setTimeout(() => {
      const next = accounts.filter((a) => a.id !== id)
      setAccounts(next)
      setRemovingId(null)
      setSuccess('Account deleted')
      setTimeout(() => setSuccess(null), 1800)
      if (editingId === id) resetForm()
    }, 200)
  }

  // Persist accounts to LocalStorage whenever they change
  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold">{editingId ? 'Edit Account' : 'Add Bank Account'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">Nickname</label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Savings – SBI"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 dark:text-gray-300">Masked Account #</label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="****1234"
              value={maskedNumber}
              onChange={(e) => setMaskedNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500">Format: ****1234</p>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={!nickname.trim() || !isValidMasked}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingId ? 'Save Changes' : 'Add Account'}
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
          {error && <div className="sm:col-span-2 lg:col-span-3 text-sm text-red-600">{error}</div>}
          {success && <div className="sm:col-span-2 lg:col-span-3 text-sm text-green-600">{success}</div>}
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-base font-semibold">Accounts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/40">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Nickname</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Masked Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {accounts.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500" colSpan={3}>
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 4h.01M5.07 19h13.86A2 2 0 0 0 21 17.07V6.93A2 2 0 0 0 18.93 5.07L13.41 3.2a2 2 0 0 0-2.82 0L5.07 5.07A2 2 0 0 0 3 6.93v10.14A2 2 0 0 0 5.07 19z" />
                      </svg>
                      No accounts yet. Add one above.
                    </span>
                  </td>
                </tr>
              )}
              {accounts.map((a) => (
                <tr
                  key={a.id}
                  className={
                    [
                      'transition-all duration-200',
                      'hover:bg-gray-50 dark:hover:bg-gray-700/30',
                      highlightId === a.id && 'bg-green-50 dark:bg-green-900/20',
                      removingId === a.id && 'opacity-0 -translate-y-1',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  <td className="px-4 py-2 text-sm">{a.nickname}</td>
                  <td className="px-4 py-2 text-sm font-mono">{a.maskedNumber}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleEdit(a)}
                      >
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


