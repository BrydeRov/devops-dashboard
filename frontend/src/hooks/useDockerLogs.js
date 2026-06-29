import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const backendURL = import.meta.env.VITE_BACKEND_URL
const socket = io(backendURL, { transports: ['websocket'] })

export function useDockerLogs() {
    const [dockerLogs, setDockerLogs] = useState({})
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        socket.on('connect', (data) => {
            setConnected(true)
            console.log('CONNECTED TO SOCKET.IO SERVER')
        })
        socket.on('disconnect', () => setConnected(false))
        
        socket.on('dockerlogs_update', (data) => {
            setConnected(true)
            console.log('UPDATE DATA SOCKET.IO SERVER')
            setDockerLogs(data)
        })

        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.off('dockerlogs_update')
        }
    }, [])

    // Convertir a array para que el componente pueda hacer .map()
    const dockerLogsArray = Object.entries(dockerLogs).map(([name, logs]) => ({
        name,
        logs,
    }))

    return { dockerLogs: dockerLogsArray, connected }
}