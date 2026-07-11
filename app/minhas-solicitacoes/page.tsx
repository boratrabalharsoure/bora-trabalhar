'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Solicitacao {
  id: number
  address: string
  description: string
  status: string
  createdAt: string
  executionDate: string | null
  protocol?: string | null
  user: {
    name: string
    phone: string
    email: string
  }
  neighborhood: {
    name: string
  }
  serviceType: {
    name: string
    icon?: string
  }
}

const statusColors = {
  'Em andamento': 'bg-yellow-100 text-yellow-800',
  'Concluído': 'bg-green-100 text-green-800',
  'Pendente': 'bg-blue-100 text-blue-800',
  'Cancelado': 'bg-red-100 text-red-800'
}

const serviceIcons: { [key: string]: string } = {
  'Roçagem': '🌿',
  'Iluminação Pública': '💡',
  'Retirada de Entulho': '🚛',
  'Limpeza Urbana': '🧹',
  'Poda de Árvores': '🌳',
  'Eliminação de Poças': '💧'
}

const serviceColors: { [key: string]: string } = {
  'Roçagem': 'bg-green-500 hover:bg-green-600 text-white',
  'Iluminação Pública': 'bg-yellow-500 hover:bg-yellow-600 text-white',
  'Retirada de Entulho': 'bg-orange-500 hover:bg-orange-600 text-white',
  'Limpeza Urbana': 'bg-blue-500 hover:bg-blue-600 text-white',
  'Poda de Árvores': 'bg-emerald-500 hover:bg-emerald-600 text-white',
  'Eliminação de Poças': 'bg-cyan-500 hover:bg-cyan-600 text-white'
}

export default function MinhasSolicitacoes() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAtivo, setFiltroAtivo] = useState('Todos')
  const [protocolSearch, setProtocolSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        setLoading(true)
        // Buscar solicitações do usuário logado
        if (!user?.email) {
          setSolicitacoes([])
          return
        }
        
        const response = await fetch(`/api/requests?userId=${encodeURIComponent(user.email)}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setSolicitacoes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error)
        setSolicitacoes([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSolicitacoes()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleSearchProtocol = async () => {
    if (!protocolSearch.trim()) return
    try {
      setSearchLoading(true)
      const response = await fetch(`/api/requests?protocol=${encodeURIComponent(protocolSearch.trim())}`)
      const data = await response.json()
      setSolicitacoes(Array.isArray(data) ? data : [])
      setFiltroAtivo('Todos')
    } catch (error) {
      console.error('Erro ao buscar por protocolo:', error)
      setSolicitacoes([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Função para filtrar solicitações
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    if (filtroAtivo === 'Todos') {
      return true
    }
    return solicitacao.serviceType.name === filtroAtivo
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando suas solicitações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Minhas Solicitações
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Acompanhe o status das suas solicitações de serviços públicos
          </p>
        </header>

        {/* Busca por Protocolo */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Buscar por Número de Protocolo
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <input
                type="text"
                placeholder="Digite o número do protocolo (ex: BT-ABC... )"
                value={protocolSearch}
                onChange={(e) => setProtocolSearch(e.target.value)}
                className="w-full sm:w-2/3 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSearchProtocol}
                disabled={searchLoading}
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {searchLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {/* Filtros de Serviços */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Filtrar por Tipo de Serviço
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {/* Botão Todos */}
              <button
                onClick={() => setFiltroAtivo('Todos')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  filtroAtivo === 'Todos'
                    ? 'bg-gray-800 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="mr-2">📋</span>
                Todos
              </button>
              
              {/* Botões para cada tipo de serviço */}
              {Object.keys(serviceIcons).map((serviceName) => (
                <button
                  key={serviceName}
                  onClick={() => setFiltroAtivo(serviceName)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    filtroAtivo === serviceName
                      ? `${serviceColors[serviceName]} shadow-lg ring-2 ring-white ring-opacity-50`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{serviceIcons[serviceName]}</span>
                  {serviceName}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {solicitacoesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filtroAtivo === 'Todos' 
                  ? 'Nenhuma solicitação encontrada'
                  : `Nenhuma solicitação de ${filtroAtivo} encontrada`
                }
              </h3>
              <p className="text-gray-500">
                {filtroAtivo === 'Todos'
                  ? 'Você ainda não fez nenhuma solicitação de serviço.'
                  : `Você ainda não fez nenhuma solicitação de ${filtroAtivo}.`
                }
              </p>
            </div>
          ) : (
            solicitacoesFiltradas.map((solicitacao) => (
              <div
                key={solicitacao.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-4xl mr-4">
                        {serviceIcons[solicitacao.serviceType.name] || '🔧'}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {solicitacao.serviceType.name}
                        </h2>
                        <p className="text-gray-600">{solicitacao.address}</p>
                        <p className="text-sm text-blue-600 font-medium">
                          📍 {solicitacao.neighborhood.name}
                        </p>
                        {solicitacao.protocol && (
                          <p className="text-sm text-gray-500 mt-1">
                            Protocolo: <span className="font-mono">{solicitacao.protocol}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[solicitacao.status as keyof typeof statusColors]}`}>
                      {solicitacao.status}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>Solicitado em: {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        {solicitacao.executionDate ? (
                          <div className="flex items-center text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Execução: {new Date(solicitacao.executionDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-orange-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>Aguardando agendamento</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {solicitacao.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}