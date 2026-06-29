import { useEffect, useRef } from "react"

export default function TerminalLogs({ logs = [], containerName = "" }) {
  const bottomRef = useRef(null)

  // // Auto-scroll al último log
  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }, [logs])

  const getColor = (stream, message) => {
    if (stream === 'stderr') return 'text-red-400'
    if (message.includes('ERROR') || message.includes('error')) return 'text-red-400'
    if (message.includes('WARN') || message.includes('warn')) return 'text-yellow-400'
    if (message.includes('LOG') || message.includes('ready')) return 'text-green-400'
    return 'text-gray-300'
  }

  return (
    <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 overflow-hidden">
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border-b border-gray-800">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-gray-500 font-mono">{containerName}</span>
      </div>

      {/* Log content */}
      <div className="max-h-100 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
        {logs?.length === 0 ? (
          <span className="text-gray-600">No logs available...</span>
        ) : (
          logs?.map((log, i) => (
            <div key={i} className="flex gap-3 leading-5">
              <span className="text-gray-600 shrink-0 select-none">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`${getColor(log.stream, log.message)} break-all`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}