import type { ReactNode } from 'react'
type Props = {
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>}
      {action}
    </div>
  )
}


