import type { Account, Transaction } from './types'

const ACCOUNTS_KEY = 'cleartx:accounts'
const TRANSACTIONS_KEY = 'cleartx:transactions'

export function getAccounts(): Account[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Account[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function getTransactions(): Transaction[] {
  const raw = localStorage.getItem(TRANSACTIONS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Transaction[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`
}


