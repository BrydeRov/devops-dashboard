import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const backendURL = import.meta.env.VITE_BACKEND_URL
const socket = io(backendURL, { transports: ['websocket'] })

export function useDockerLogs() {
    const [dockerLogs, setDockerLogs] = useState({})
    const [connected, setConnected] = useState(false)
    const liveContainerRef = useRef(null)

    useEffect(() => {
        socket.on('connect', () => setConnected(true))
        socket.on('disconnect', () => setConnected(false))

        socket.on('dockerlogs_update', (data) => {
            setConnected(true)
            setDockerLogs(data)
        })

        socket.on('live_log_line', (line) => {
        setDockerLogs(prev => {
            const containerLogs = prev[line.container] || []
            return {
            ...prev,
            [line.container]: [...containerLogs.slice(-300), line]
            }
        })
        })

        return () => {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('dockerlogs_update')
        socket.off('live_log_line')
        }
    }, [])

    const goLive = (containerName) => {
        if (liveContainerRef.current === containerName) return
        liveContainerRef.current = containerName
        socket.emit('subscribe_live_logs', { containerName })
    }

    const stopLive = () => {
        if (!liveContainerRef.current) return
        liveContainerRef.current = null
        socket.emit('unsubscribe_live_logs')
    }

    const dockerLogsArray = Object.entries(dockerLogs).map(([name, logs]) => ({
        name,
        logs,
    }))

    return { dockerLogs: dockerLogsArray, connected, goLive, stopLive }
}