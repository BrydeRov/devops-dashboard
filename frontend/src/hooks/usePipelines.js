import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const backendURL = import.meta.env.VITE_BACKEND_URL
const socket = io(backendURL, { transports: ['websocket'] })

export function usePipelines() {
    const [pipelines, setPipelines] = useState([])
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        socket.on('connect', () => {
            // console.log('WebSocket Connected')
            setConnected(true)
        })

        socket.on('disconnect', () => {
            // console.log('WebSocket disconnected')
            setConnected(false)
        })

        socket.on('pipelines_update', (data) => {
            setConnected(true)
            setPipelines(Array.isArray(data) ? data : [])  // ← guard
        })

        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.off('pipelines_update')
        }
    },[])

    return { pipelines, connected }
}
