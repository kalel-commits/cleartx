export const BANK_PATTERNS: Record<string, RegExp> = {
  SBI: /(sbi|state\s*bank).*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  HDFC: /hdfc.*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  ICICI: /icici.*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  AXIS: /(axis\s*bank|axis).*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  KOTAK: /(kotak|811).*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  YES: /(yes\s*bank|yesbank).*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  PNB: /(pnb|punjab\s*national).*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  BOB: /(bank\s*of\s*baroda|bob).*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  CANARA: /canara.*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
  UNION: /(union\s*bank|ubi).*?(?:a\/c|acct?|account|card|upi).*?(?:\*+|x+)?(\d{4})/i,
}

const GENERIC_LAST4 = /(?:a\/c|acct?|account|card|upi|vpa)[^\d]{0,20}(?:\*{0,6}|x{0,6})?(\d{4})/i;

export function detectSourceAccountFromText(text: string): { bank: string; last4: string | null } | null {
  if (!text) return null;
  for (const [bank, rx] of Object.entries(BANK_PATTERNS)) {
    const m = text.match(rx);
    if (m) return { bank, last4: (m[2] || m[1] || '').slice(-4) || null };
  }
  const g = text.match(GENERIC_LAST4);
  if (g) return { bank: 'UNKNOWN', last4: g[1] };
  return null;
}

export function extractHashtags(text: string): string[] {
  const tags = new Set<string>();
  if (!text) return [];
  const re = /#([A-Za-z0-9:_-]{2,32})/g;
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(text))) {
    tags.add(m[1].toLowerCase());
  }
  return Array.from(tags);
}

export type DetectedBank = { code: string; name: string } | null

const HANDLE_MAP: Record<string, string> = {
  // code -> canonical bank name
  okhdfc: 'HDFC', hdfc: 'HDFC', hdfcbank: 'HDFC',
  okicici: 'ICICI', icici: 'ICICI',
  oksbi: 'SBI', sbi: 'SBI', yono: 'SBI',
  okaxis: 'AXIS', axis: 'AXIS', axisbank: 'AXIS',
  ybl: 'YES', yes: 'YES', yesbank: 'YES',
  kotak: 'KOTAK', kmb: 'KOTAK', okkotak: 'KOTAK',
  idfc: 'IDFC', idfcbank: 'IDFC',
  pnb: 'PNB',
  bob: 'BOB', barodampay: 'BOB',
  canara: 'CANARA', canarabank: 'CANARA',
  ubi: 'UNION', unionbank: 'UNION',
  federal: 'FEDERAL', fbl: 'FEDERAL',
  paytm: 'PAYTM', ppb: 'PAYTM',
  airtel: 'AIRTEL', airtelpayments: 'AIRTEL',
}

export function detectBankFromUpiText(text: string): DetectedBank {
  if (!text) return null
  const lower = text.toLowerCase()
  // common separators in VPAs/refs
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean)
  for (const t of tokens) {
    if (HANDLE_MAP[t]) return { code: t, name: HANDLE_MAP[t] }
  }
  // also scan substrings (e.g., someone@okhdfc)
  for (const key of Object.keys(HANDLE_MAP)) {
    if (lower.includes('@' + key) || lower.includes(key)) {
      return { code: key, name: HANDLE_MAP[key] }
    }
  }
  return null
}

// Detect a UPI handle like name@okhdfc, mob123@ybl, abc.def@axis
export function detectUpiHandle(text: string): string | null {
  if (!text) return null
  const m = text.toLowerCase().match(/\b[\w.-]+@[a-z0-9.-]+\b/)
  return m ? m[0] : null
}


