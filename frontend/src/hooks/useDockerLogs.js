import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const backendURL = import.meta.env.VITE_BACKEND_URL
const socket = io(backendURL, { transports: ['websocket'] })

function parseDockerLogs(logsObject) {
    const parsedResult = {};

    for (const [containerName, logString] of Object.entries(logsObject)) {
        // 1. Dividir el string por saltos de línea
        const lines = logString.split('\n');
        
        parsedResult[containerName] = lines
        .map(line => {
            if (!line) return null;

            // 2. Remover los 8 bytes del encabezado de Docker
            const cleanLine = line.substring(8);

            // 3. Opcional: Separar el Timestamp del mensaje (Formato ISO: YYYY-MM-DDTHH:mm:ss...)
            // Las marcas de tiempo de Docker ocupan los primeros 30 caracteres
            const timestamp = cleanLine.substring(0, 30).trim();
            const message = cleanLine.substring(30);

            return {
            timestamp: timestamp,
            message: message
            };
        })
        .filter(Boolean); // Filtrar líneas vacías
    }

    return parsedResult;
}


export function useDockerLogs() {
    const [dockerLogs, setDockerLogs] = useState([])
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        socket.on('connect', () => {
            console.log('WebSocket Connected')
            setConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected')
            setConnected(false)
        })

        socket.on('dockerlogs_update', (data) => {
            const parsedResult = parseDockerLogs(data)
            console.log('Reading Update DOCKER LOGS')
            console.log(parsedResult)


            setDockerLogs(parsedResult)  // ← guard
        })

        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.off('dockerlogs_update')
        }
    },[])

    return { dockerLogs, connected }
}
