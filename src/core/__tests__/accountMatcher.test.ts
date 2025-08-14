import { 
  detectSourceAccountFromText, 
  extractHashtags, 
  detectBankFromUpiText, 
  detectUpiHandle 
} from '../accountMatcher'

describe('accountMatcher', () => {
  describe('detectSourceAccountFromText', () => {
    it('should detect HDFC bank with last 4 digits', () => {
      const text = 'Payment to ABC123 via HDFC account ****1234'
      const result = detectSourceAccountFromText(text)
      
      expect(result).toEqual({
        bank: 'HDFC',
        last4: '1234'
      })
    })

    it('should detect ICICI bank with last 4 digits', () => {
      const text = 'Transaction from ICICI card ****5678'
      const result = detectSourceAccountFromText(text)
      
      expect(result).toEqual({
        bank: 'ICICI',
        last4: '5678'
      })
    })

    it('should return null for text without bank patterns', () => {
      const text = 'Just a regular note without bank info'
      const result = detectSourceAccountFromText(text)
      
      expect(result).toBeNull()
    })

    it('should detect bank without last 4 digits', () => {
      const text = 'Payment via SBI account 1234'
      const result = detectSourceAccountFromText(text)
      
      expect(result).toEqual({
        bank: 'SBI',
        last4: '1234'
      })
    })
  })

  describe('extractHashtags', () => {
    it('should extract hashtags from text', () => {
      const text = 'Lunch payment #food #daily #expense'
      const result = extractHashtags(text)
      
      expect(result).toEqual(['food', 'daily', 'expense'])
    })

    it('should return empty array for text without hashtags', () => {
      const text = 'Regular transaction note'
      const result = extractHashtags(text)
      
      expect(result).toEqual([])
    })

    it('should handle multiple hashtags', () => {
      const text = '#work #transport #monthly #recurring'
      const result = extractHashtags(text)
      
      expect(result).toEqual(['work', 'transport', 'monthly', 'recurring'])
    })
  })

  describe('detectBankFromUpiText', () => {
    it('should detect HDFC from UPI handle', () => {
      const text = 'Payment to john@okhdfc'
      const result = detectBankFromUpiText(text)
      
      expect(result).toEqual({ code: 'okhdfc', name: 'HDFC' })
    })

    it('should detect Yes Bank from UPI handle', () => {
      const text = 'Transaction via mob@ybl'
      const result = detectBankFromUpiText(text)
      
      expect(result).toEqual({ code: 'ybl', name: 'YES' })
    })

    it('should detect Axis Bank from UPI handle', () => {
      const text = 'Payment to abc@axis'
      const result = detectBankFromUpiText(text)
      
      expect(result).toEqual({ code: 'axis', name: 'AXIS' })
    })

    it('should return null for text without UPI handles', () => {
      const text = 'Regular transaction note'
      const result = detectBankFromUpiText(text)
      
      expect(result).toBeNull()
    })
  })

  describe('detectUpiHandle', () => {
    it('should detect valid UPI handle', () => {
      const text = 'Payment to john@okhdfc'
      const result = detectUpiHandle(text)
      
      expect(result).toBe('john@okhdfc')
    })

    it('should detect UPI handle with numbers', () => {
      const text = 'Transaction via 9876543210@ybl'
      const result = detectUpiHandle(text)
      
      expect(result).toBe('9876543210@ybl')
    })

    it('should return null for text without UPI handle', () => {
      const text = 'Regular transaction note'
      const result = detectUpiHandle(text)
      
      expect(result).toBeNull()
    })

    it('should detect UPI handle with special characters', () => {
      const text = 'Payment to user.name@axis'
      const result = detectUpiHandle(text)
      
      expect(result).toBe('user.name@axis')
    })
  })
})
