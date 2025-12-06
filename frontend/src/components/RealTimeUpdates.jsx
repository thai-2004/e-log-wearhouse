import React, { useEffect, useState, useRef } from 'react'
import { FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi'

const RealTimeUpdates = ({ 
  onDataUpdate, 
  refreshInterval = 30000,
  enabled = true,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  // Simulate connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine)
    }

    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)

    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!enabled || !isConnected || refreshInterval === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(async () => {
      await handleRefresh()
    }, refreshInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, isConnected, refreshInterval])

  const handleRefresh = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await onDataUpdate()
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Real-time update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatLastUpdate = (date) => {
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (seconds < 60) return `${seconds} giây trước`
    if (minutes < 60) return `${minutes} phút trước`
    return date.toLocaleTimeString()
  }

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500'
    if (isUpdating) return 'text-blue-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (!isConnected) return FiWifiOff
    if (isUpdating) return FiRefreshCw
    return FiWifi
  }

  const StatusIcon = getStatusIcon()

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <StatusIcon 
        className={`h-4 w-4 ${getStatusColor()} ${isUpdating ? 'animate-spin' : ''}`} 
      />
      <span className={`text-xs ${getStatusColor()}`}>
        {!isConnected ? 'Ngoại tuyến' : 
         isUpdating ? 'Đang cập nhật...' : 
         'Trực tiếp'}
      </span>
      <span className="text-gray-400 text-xs">
        • {formatLastUpdate(lastUpdate)}
      </span>
      {enabled && refreshInterval > 0 && (
        <span className="text-gray-400 text-xs">
          • Auto-refresh: {Math.floor(refreshInterval / 1000)}s
        </span>
      )}
    </div>
  )
}

// WebSocket hook for real-time updates
export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return

    const ws = new WebSocket(url)
    
    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
      if (options.onOpen) options.onOpen()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
        if (options.onMessage) options.onMessage(data)
      } catch (err) {
        setLastMessage(event.data)
        if (options.onMessage) options.onMessage(event.data)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      if (options.onClose) options.onClose()
    }

    ws.onerror = (err) => {
      setError(err)
      if (options.onError) options.onError(err)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message))
    }
  }

  return {
    socket,
    isConnected,
    lastMessage,
    error,
    sendMessage
  }
}

// Dashboard real-time provider
export const DashboardRealTimeProvider = ({ children, refreshInterval = 30000 }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    refreshInterval,
    lastUpdate: new Date()
  })

  const handleSettingsChange = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      lastUpdate: new Date()
    }))
  }

  const handleDataUpdate = async () => {
    // This would typically trigger a refetch of dashboard data
    // For now, we'll just update the timestamp
    setSettings(prev => ({
      ...prev,
      lastUpdate: new Date()
    }))
  }

  return (
    <div className="space-y-4">
      {/* Real-time Status Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <RealTimeUpdates
              onDataUpdate={handleDataUpdate}
              refreshInterval={settings.refreshInterval}
              enabled={settings.enabled}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingsChange({ enabled: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span>Tự động làm mới</span>
            </label>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {children}
    </div>
  )
}

export default RealTimeUpdates
