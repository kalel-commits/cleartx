import { FormEvent, useMemo, useState } from 'react'
import { getAccounts, saveAccounts, generateId } from '../storage'
import type { Account } from '../types'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts())
  const [nickname, setNickname] = useState('')
  const [maskedNumber, setMaskedNumber] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      saveAccounts(updated)
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
    saveAccounts(next)
    resetForm()
  }

  function handleEdit(account: Account) {
    setEditingId(account.id)
    setNickname(account.nickname)
    setMaskedNumber(account.maskedNumber)
  }

  function handleDelete(id: string) {
    const next = accounts.filter((a) => a.id !== id)
    setAccounts(next)
    saveAccounts(next)
    if (editingId === id) resetForm()
  }

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
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
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
                  <td className="px-4 py-3 text-sm text-gray-500" colSpan={3}>No accounts yet. Add one above.</td>
                </tr>
              )}
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
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


