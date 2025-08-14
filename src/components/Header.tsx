import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cleartx:theme')
    const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('cleartx:theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 dark:bg-gray-800/60 dark:border-gray-700">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="font-semibold text-lg tracking-tight">
              ClearTx
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/accounts"
              className={({ isActive }) =>
                classNames(
                  'text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400',
                  isActive && 'text-blue-600 dark:text-blue-400',
                )
              }
            >
              Accounts
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                classNames(
                  'text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400',
                  isActive && 'text-blue-600 dark:text-blue-400',
                )
              }
            >
              Transactions
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                classNames(
                  'text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400',
                  isActive && 'text-blue-600 dark:text-blue-400',
                )
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/plugins"
              className={({ isActive }) =>
                classNames(
                  'text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400',
                  isActive && 'text-blue-600 dark:text-blue-400',
                )
              }
            >
              Plugins
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              onClick={() => setDark((v) => !v)}
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M21.64 13.65A9 9 0 1 1 10.35 2.36 7 7 0 0 0 21.64 13.65z" />
                  </svg>
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10-5a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm14.071 6.071a1 1 0 0 1-1.414 0l-1.414-1.414a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 0 1 0 1.414zM7.757 7.757A1 1 0 0 1 6.343 6.343L4.929 4.929A1 1 0 1 1 6.343 3.515l1.414 1.414A1 1 0 0 1 7.757 7.757zm8.486 0a1 1 0 0 1 0-1.414l1.414-1.414A1 1 0 1 1 19.071 6.343L17.657 7.757a1 1 0 0 1-1.414 0zM7.757 16.243a1 1 0 0 1-1.414 0L4.929 14.83a1 1 0 1 1 1.414-1.415l1.414 1.415a1 1 0 0 1 0 1.414z" />
                  </svg>
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden pb-3">
            <nav className="flex flex-col gap-2">
              <NavLink to="/accounts" className="px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpen(false)}>Accounts</NavLink>
              <NavLink to="/transactions" className="px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpen(false)}>Transactions</NavLink>
              <NavLink to="/dashboard" className="px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpen(false)}>Dashboard</NavLink>
              <NavLink to="/plugins" className="px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpen(false)}>Plugins</NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}


