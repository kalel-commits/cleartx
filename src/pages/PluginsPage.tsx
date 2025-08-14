import { useEffect, useMemo, useState } from 'react'
import config from '../config'

type SystemStatus = {
	initialized: boolean
	totalPlugins: number
	availablePlugins: string[]
	pluginStatuses: Record<string, any>
}

export default function PluginsPage() {
	const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
	const [capabilities, setCapabilities] = useState<Record<string, any>>({})
	const [isLoading, setIsLoading] = useState(false)
	const manager = (typeof window !== 'undefined' ? (window as any).pluginManager : null)

	async function refreshStatus() {
		try {
			setIsLoading(true)
			if (manager?.initialize) {
				await manager.initialize()
			}
			if (manager?.getSystemStatus) {
				const status = manager.getSystemStatus()
				setSystemStatus(status)
			}
			if (manager?.getPluginCapabilities) {
				const caps = manager.getPluginCapabilities()
				setCapabilities(caps || {})
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		refreshStatus()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const rows = useMemo(() => {
		const list: Array<{ name: string; status: any; caps: any }> = []
		const statuses = systemStatus?.pluginStatuses || {}
		for (const name of Object.keys(statuses)) {
			list.push({ name, status: statuses[name], caps: (capabilities as any)[name] })
		}
		return list
	}, [systemStatus, capabilities])

	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Plugins</h2>
					<div className="flex items-center gap-2">
						<button
							className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
							onClick={refreshStatus}
							disabled={isLoading}
						>
							{isLoading ? 'Refreshing…' : 'Refresh'}
						</button>
					</div>
				</div>

				<div className="mt-3 grid gap-3 sm:grid-cols-2">
					<div className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700">
						<div className="mb-1 font-medium">System Status</div>
						<div>Initialized: {systemStatus?.initialized ? 'Yes' : 'No'}</div>
						<div>Total Plugins: {systemStatus?.totalPlugins ?? 0}</div>
						<div>Available: {(systemStatus?.availablePlugins || []).join(', ') || 'None'}</div>
					</div>
					<div className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700">
						<div className="mb-1 font-medium">Config Flags</div>
						<ul className="list-disc pl-4 space-y-0.5">
							<li>Tor: {String(config.TOR_ENABLED)}</li>
							<li>FOSSASIA: {String(config.FOSSASIA_ENABLED)}</li>
							<li>Transit: {String(config.TRANSIT_ENABLED)}</li>
							<li>CCExtractor: {String(config.CCEXTRACTOR_ENABLED)}</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<h3 className="mb-3 text-base font-semibold">Available Plugins</h3>
				<div className="grid gap-3 md:grid-cols-2">
					{rows.length === 0 && (
						<div className="text-sm text-gray-500">No plugins initialized.</div>
					)}
					{rows.map((p) => (
						<div key={p.name} className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700">
							<div className="mb-1 flex items-center justify-between">
								<div className="font-medium capitalize">{p.name}</div>
								<span className={"inline-flex h-2 w-2 rounded-full " + (p.status?.status?.enabled ? 'bg-green-500' : 'bg-gray-400')} />
							</div>
							<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(p.status?.status ?? p.status, null, 2)}</pre>
							{p.caps && (
								<div className="mt-2">
									<div className="mb-1 font-medium">Capabilities</div>
									<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(p.caps, null, 2)}</pre>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}


