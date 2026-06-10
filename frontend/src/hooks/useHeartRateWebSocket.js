import { useState, useEffect, useRef, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

export const useHeartRateWebSocket = () => {
  const [heartRateData, setHeartRateData] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef(null)

  const connect = useCallback(() => {
    if (clientRef.current?.active) return

    const socket = new SockJS('/ws-heartrate')
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket 连接成功')
        setIsConnected(true)
        client.subscribe('/topic/heartrate', (message) => {
          try {
            const data = JSON.parse(message.body)
            setHeartRateData(data)
          } catch (e) {
            console.error('解析心率数据失败:', e)
          }
        })
      },
      onDisconnect: () => {
        console.log('WebSocket 连接断开')
        setIsConnected(false)
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP 错误:', frame.headers['message'])
        setIsConnected(false)
      },
      onWebSocketError: (error) => {
        console.error('WebSocket 错误:', error)
        setIsConnected(false)
      },
    })

    clientRef.current = client
    client.activate()
  }, [])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
    }
    setIsConnected(false)
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { heartRateData, isConnected, connect, disconnect }
}

export default useHeartRateWebSocket
