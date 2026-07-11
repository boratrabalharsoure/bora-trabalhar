'use client'

import React, { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'new_request' | 'status_change' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationSystemProps {
  onNewNotification?: (notification: Notification) => void
}

export default function NotificationSystem({ onNewNotification }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [lastRequestCount, setLastRequestCount] = useState(0)

  // Função para buscar contagem de solicitações
  const fetchRequestCount = async () => {
    try {
      const response = await fetch('/api/requests')
      if (response.ok) {
        const data = await response.json()
        const currentCount = data.length
        
        // Se há novas solicitações
        if (lastRequestCount > 0 && currentCount > lastRequestCount) {
          const newRequestsCount = currentCount - lastRequestCount
          const newNotification: Notification = {
            id: `new-request-${Date.now()}`,
            type: 'new_request',
            title: 'Nova Solicitação!',
            message: `${newRequestsCount} nova${newRequestsCount > 1 ? 's' : ''} solicitação${newRequestsCount > 1 ? 'ões' : ''} de serviço${newRequestsCount > 1 ? 's' : ''} recebida${newRequestsCount > 1 ? 's' : ''}`,
            timestamp: new Date(),
            read: false
          }
          
          setNotifications(prev => [newNotification, ...prev])
          onNewNotification?.(newNotification)
          
          // Reproduzir som de notificação (opcional)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            })
          }
        }
        
        setLastRequestCount(currentCount)
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error)
    }
  }

  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Polling para verificar novas solicitações a cada 30 segundos
  useEffect(() => {
    fetchRequestCount() // Busca inicial
    const interval = setInterval(fetchRequestCount, 30000) // 30 segundos
    
    return () => clearInterval(interval)
  }, [lastRequestCount])

  // Ouvir notificações imediatas via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !("BroadcastChannel" in window)) return
    console.log('[NotificationSystem] Iniciando escuta BroadcastChannel \'requests\'')
    const channel = new BroadcastChannel('requests')
    channel.onmessage = (event) => {
      console.log('[NotificationSystem] Mensagem recebida no canal \'requests\':', event.data)
      const data = event.data
      if (data?.type === 'new_request') {
        const newNotification: Notification = {
          id: `new-request-${Date.now()}`,
          type: 'new_request',
          title: 'Nova Solicitação!',
          message: 'Uma nova solicitação de serviço foi recebida',
          timestamp: new Date(),
          read: false
        }
        setNotifications(prev => [newNotification, ...prev])
        onNewNotification?.(newNotification)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico'
          })
        }
        // Atualiza contagem para manter consistência com polling
        fetchRequestCount()
      }
    }
    return () => {
      console.log('[NotificationSystem] Encerrando escuta BroadcastChannel \'requests\'')
      channel.close()
    }
  }, [])

  // Fallback: ouvir via localStorage (evento 'storage')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'bt.new_request' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue)
          console.log('[NotificationSystem] Evento storage recebido:', payload)
          if (payload?.type === 'new_request') {
            const newNotification: Notification = {
              id: `new-request-${Date.now()}`,
              type: 'new_request',
              title: 'Nova Solicitação!',
              message: 'Uma nova solicitação de serviço foi recebida',
              timestamp: new Date(),
              read: false
            }
            setNotifications(prev => [newNotification, ...prev])
            onNewNotification?.(newNotification)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/favicon.ico'
              })
            }
            fetchRequestCount()
          }
        } catch (err) {
          console.warn('Falha ao processar evento storage:', err)
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_request':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )
      case 'status_change':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        title="Notificações"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
        </svg>
        
        {/* Badge de contagem */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notificações</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpar todas
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
                </svg>
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}