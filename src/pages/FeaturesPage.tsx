import config from '../config'

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold">Features</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          ClearTx focuses on privacy-first, local-only finance tracking with optional add-ons. Below are high-impact use cases and what powers them.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <FeatureCard title="Medical Expense Tracking" 
          desc="Scan pharmacy receipts → auto-categorize as Medical → insurance-ready summaries." 
          example="₹12,850/month on diabetes meds (Apollo Pharmacy scans)" />

        <FeatureCard title="Split Bills Like a Pro" 
          desc="Tag transactions as Split:RoomRent → export to settle who owes what." 
          example="Amit pays ₹8k rent, split 4 ways → ₹2k per person" />

        <FeatureCard title="Cash Expense Logging" 
          desc="Record cash spends; attach video/photo receipts; tag like Cash: Vegetable Market." 
          example="Tracked ₹5,700/month in cash at local markets" />

        <FeatureCard title="Freelancer GST Ready" 
          desc="Scan invoices, extract GST numbers, generate quarterly tax reports." 
          example="Flagged 18% GST on ₹50k design project (GST: 27ABC...)" />

        <FeatureCard title="Crypto Tax Helper" 
          desc="Log P2P UPI trades, tag Crypto: WazirX, compute FIFO tax summaries." 
          example="₹1.2L Bitcoin purchase via UPI to Binance (Ref: SBI****7890)" />

        <FeatureCard title="Wedding Budget Boss" 
          desc="Create labels like Wedding:Decorator and track multi-vendor payments and budgets." 
          example="Alert when wedding spend crosses ₹5L" />

        <FeatureCard title="Protest Expense Safeguard" 
          desc="Use Tor mode + aliases (Donation: ****) with optional encrypted onion backups." 
          example="₹20k logistics hidden behind onion service" />

        <FeatureCard title="Pet Parent Budgeting" 
          desc="Scan vet bills and track Pet:Vaccination spends monthly." 
          example="₹3k/month avg on Bruno’s vet visits (HDFC****3456)" />

        <FeatureCard title="Reimbursement Wizard" 
          desc="Flag as Company Reimbursable → auto-generate claim-ready CSV/PDF." 
          example="₹2,800 Uber rides → HR-ready report with trip dates" />

        <FeatureCard title="Black Friday Guard" 
          desc="Set Amazon/Flipkart alerts and day limits; optional soft lock after threshold." 
          example="Stopped at ₹9,850 – saved from impulse buys!" />
      </section>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-base font-semibold">Tech Behind It</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Dynamic Tagging: use hashtags like <code>#medical</code>, <code>#split</code>, <code>#crypto</code></li>
          <li>Smart Alerts: optional local notifications (e.g., weekly food spend)</li>
          <li>Stealth Mode: redact merchant names in exported notes</li>
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-base font-semibold">Privacy & Optional Add‑ons</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Local‑only storage by default (browser storage)</li>
          <li>Optional Tor encrypted backups (when enabled): {String(config.TOR_ENABLED)}</li>
          <li>Receipt OCR (video/image) and SUSI auto‑tagging are optional toggles</li>
        </ul>
      </div>
    </div>
  )
}

function FeatureCard({ title, desc, example }: { title: string; desc: string; example?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <h4 className="text-base font-semibold">{title}</h4>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
      {example && (
        <div className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-700 dark:bg-gray-700/40 dark:text-gray-200">
          <span className="font-medium">Example:</span> {example}
        </div>
      )}
    </div>
  )
}


