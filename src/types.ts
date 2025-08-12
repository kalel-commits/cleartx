export type Account = {
  id: string
  nickname: string
  maskedNumber: string
}

export type Transaction = {
  id: string
  amount: number
  date: string // ISO string
  note?: string
  accountId: string
}


