import { detectSourceAccountFromText, detectBankFromUpiText, detectUpiHandle } from '../accountMatcher'

// Mock account data for testing
const mockAccounts = [
  { id: 'acct_1', nickname: 'HDFC Savings', maskedNumber: '****1234' },
  { id: 'acct_2', nickname: 'ICICI Current', maskedNumber: '****5678' },
  { id: 'acct_3', nickname: 'SBI Account', maskedNumber: '****9876' },
  { id: 'acct_4', nickname: 'Unlinked - HDFC', maskedNumber: '****0000' }, // placeholder
]

describe('Bank Assignment Logic Fix', () => {
  describe('UPI Handle Detection', () => {
    it('should detect UPI handle from transaction note', () => {
      const note = 'Payment to user@okhdfc via UPI'
      const upiHandle = detectUpiHandle(note)
      expect(upiHandle).toBe('user@okhdfc')
    })

    it('should return null if no UPI handle found', () => {
      const note = 'Regular transaction without UPI'
      const upiHandle = detectUpiHandle(note)
      expect(upiHandle).toBeNull()
    })
  })

  describe('Bank Detection from UPI Text', () => {
    it('should detect HDFC bank from UPI handle', () => {
      const note = 'Payment to user@okhdfc'
      const bankFromUpi = detectBankFromUpiText(note)
      expect(bankFromUpi).toEqual({ code: 'okhdfc', name: 'HDFC' })
    })

    it('should detect YES bank from UPI handle', () => {
      const note = 'Transaction via mobile@ybl'
      const bankFromUpi = detectBankFromUpiText(note)
      expect(bankFromUpi).toEqual({ code: 'ybl', name: 'YES' })
    })

    it('should return null for unknown bank codes', () => {
      const note = 'Payment to user@unknownbank'
      const bankFromUpi = detectBankFromUpiText(note)
      expect(bankFromUpi).toBeNull()
    })
  })

  describe('Account Matching by Last 4 Digits', () => {
    it('should detect account from last 4 digits in text', () => {
      const note = 'Payment from HDFC account ending ****1234'
      const detection = detectSourceAccountFromText(note)
      expect(detection).toEqual({ bank: 'HDFC', last4: '1234' })
    })

    it('should handle generic last 4 pattern', () => {
      const note = 'Payment from card ****9999'
      const detection = detectSourceAccountFromText(note)
      expect(detection).toEqual({ bank: 'UNKNOWN', last4: '9999' })
    })
  })

  describe('Bank Matching Logic', () => {
    const findAccountByLast4 = (last4: string) => {
      return mockAccounts.find(a => a.maskedNumber.endsWith(last4))
    }

    const findAccountsByBankName = (bankName: string) => {
      return mockAccounts.filter(a => 
        a.nickname.toLowerCase().includes(bankName.toLowerCase())
      )
    }

    it('should match account by exact last 4 digits', () => {
      const account = findAccountByLast4('1234')
      expect(account?.nickname).toBe('HDFC Savings')
    })

    it('should find single account by bank name', () => {
      const accounts = findAccountsByBankName('SBI')
      expect(accounts).toHaveLength(1)
      expect(accounts[0].nickname).toBe('SBI Account')
    })

    it('should find multiple accounts for same bank', () => {
      const accounts = findAccountsByBankName('HDFC')
      expect(accounts).toHaveLength(2) // Regular HDFC and Unlinked HDFC
    })

    it('should handle no matching accounts', () => {
      const accounts = findAccountsByBankName('AXIS')
      expect(accounts).toHaveLength(0)
    })
  })

  describe('Placeholder Account Creation', () => {
    it('should create placeholder account name correctly', () => {
      const bankFromUpi = 'AXIS'
      const placeholderName = `Unlinked - ${bankFromUpi}`
      expect(placeholderName).toBe('Unlinked - AXIS')
    })

    it('should use generic masked number for placeholder', () => {
      const placeholderMaskedNumber = '****0000'
      expect(placeholderMaskedNumber).toBe('****0000')
    })
  })

  describe('Transaction Validation', () => {
    it('should require UPI handle in transaction note', () => {
      const noteWithUpi = 'Payment to user@okhdfc'
      const noteWithoutUpi = 'Just a regular note'
      
      expect(detectUpiHandle(noteWithUpi)).toBeTruthy()
      expect(detectUpiHandle(noteWithoutUpi)).toBeNull()
    })

    it('should detect bank even without exact account match', () => {
      const note = 'Payment via user@okaxis'
      const bankDetection = detectBankFromUpiText(note)
      expect(bankDetection?.name).toBe('AXIS')
    })
  })

  describe('Error Scenarios', () => {
    it('should handle empty or invalid notes', () => {
      expect(detectUpiHandle('')).toBeNull()
      expect(detectBankFromUpiText('')).toBeNull()
      expect(detectSourceAccountFromText('')).toBeNull()
    })

    it('should handle malformed UPI handles', () => {
      const validHandles = [
        'user@okhdfc',  // valid
        '123@ybl', // valid
      ]
      
      const invalidHandles = [
        'userhdfc', // missing @
        'user@', // missing domain
      ]
      
      validHandles.forEach(handle => {
        const detected = detectUpiHandle(handle)
        expect(detected).toBeTruthy()
      })
      
      invalidHandles.forEach(handle => {
        const detected = detectUpiHandle(handle)
        expect(detected).toBeNull()
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle transaction with existing account match', () => {
      const note = 'UPI payment to user@okhdfc from HDFC account ****1234'
      
      const upiHandle = detectUpiHandle(note)
      const bankFromUpi = detectBankFromUpiText(note)
      const accountFromText = detectSourceAccountFromText(note)
      
      expect(upiHandle).toBe('user@okhdfc')
      expect(bankFromUpi?.name).toBe('HDFC')
      expect(accountFromText?.last4).toBe('1234')
    })

    it('should handle transaction requiring placeholder creation', () => {
      const note = 'Payment via user@okaxis - new bank'
      
      const upiHandle = detectUpiHandle(note)
      const bankFromUpi = detectBankFromUpiText(note) 
      const accountFromText = detectSourceAccountFromText(note)
      
      expect(upiHandle).toBe('user@okaxis')
      expect(bankFromUpi?.name).toBe('AXIS')
      expect(accountFromText).toBeNull() // No account info in text
    })
  })
})
