'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import NotificationSystem from '../components/NotificationSystem'
import { useAuth } from '../contexts/AuthContext'

interface Solicitacao {
  id: number
  address: string
  description: string
  status: string
  createdAt: string
  executionDate: string | null
  protocol?: string
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

const statusOptions = ['Pendente', 'Em andamento', 'Concluído', 'Cancelado']

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedBairro, setSelectedBairro] = useState('')
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [bairroOptions, setBairroOptions] = useState<string[]>([])
  const [tipoOptions, setTipoOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingDate, setEditingDate] = useState('')
  const [editingStatus, setEditingStatus] = useState('')
  const [saving, setSaving] = useState<number | null>(null)

  // Carregar dados do banco
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Buscar solicitações
        const requestsResponse = await fetch('/api/requests')
        const requestsData = await requestsResponse.json()
        setSolicitacoes(requestsData)

        // Buscar bairros
        const neighborhoodsResponse = await fetch('/api/neighborhoods')
        const neighborhoodsData = await neighborhoodsResponse.json()
        setBairroOptions(neighborhoodsData.map((n: any) => n.name))

        // Buscar tipos de serviços
        const serviceTypesResponse = await fetch('/api/service-types')
        const serviceTypesData = await serviceTypesResponse.json()
        setTipoOptions(serviceTypesData.map((s: any) => s.name))

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Estatísticas
  const totalSolicitacoes = solicitacoes.length
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'Pendente').length
  const solicitacoesEmAndamento = solicitacoes.filter(s => s.status === 'Em andamento').length
  const solicitacoesConcluidas = solicitacoes.filter(s => s.status === 'Concluído').length

  // Filtros
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    if (selectedStatus && solicitacao.status !== selectedStatus) return false
    if (selectedTipo && solicitacao.serviceType.name !== selectedTipo) return false
    if (selectedBairro && solicitacao.neighborhood.name !== selectedBairro) return false
    return true
  })

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedRequest = await response.json()
        setSolicitacoes(prev => 
          prev.map(s => s.id === id ? updatedRequest : s)
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleDataExecucaoChange = async (id: number, newDate: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ executionDate: newDate || null }),
      })

      if (response.ok) {
        const updatedRequest = await response.json()
        setSolicitacoes(prev => 
          prev.map(s => s.id === id ? updatedRequest : s)
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar data de execução:', error)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmado = window.confirm('Tem certeza que deseja excluir esta solicitação?')
    if (!confirmado) return

    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir solicitação')
      }

      setSolicitacoes(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Erro ao excluir solicitação:', error)
      alert('Erro ao excluir. Tente novamente.')
    }
  }

  // Função para iniciar edição
  const startEditing = (id: number, currentDate: string | null, currentStatus: string) => {
    setEditingId(id)
    setEditingDate(currentDate ? new Date(currentDate).toISOString().split('T')[0] : '')
    setEditingStatus(currentStatus)
  }

  // Função para cancelar edição
  const cancelEditing = () => {
    setEditingId(null)
    setEditingDate('')
    setEditingStatus('')
  }

  // Função para salvar alterações
  const saveChanges = async (id: number) => {
    setSaving(id)
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          executionDate: editingDate || null,
          status: editingStatus
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar alterações')
      }

      const updatedRequest = await response.json()
      setSolicitacoes(prev => 
        prev.map(s => s.id === id ? updatedRequest : s)
      )

      setEditingId(null)
      setEditingDate('')
      setEditingStatus('')
      alert('Alterações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar alterações. Tente novamente.')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
              <p className="text-gray-600">Gerencie as solicitações de serviços públicos</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem />
              <div className="text-right">
                <p className="text-sm text-gray-600">Bem-vindo,</p>
                <p className="font-semibold text-gray-800">{user?.name}</p>
              </div>
              <Link
                href="/admin/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </header>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total de Solicitações</h3>
              <p className="text-3xl font-bold text-blue-600">{totalSolicitacoes}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Pendentes</h3>
              <p className="text-3xl font-bold text-yellow-600">{solicitacoesPendentes}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Em Andamento</h3>
              <p className="text-3xl font-bold text-orange-600">{solicitacoesEmAndamento}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Concluídas</h3>
              <p className="text-3xl font-bold text-green-600">{solicitacoesConcluidas}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos os status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Serviço
                </label>
                <select
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos os tipos</option>
                  {tipoOptions.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <select
                  value={selectedBairro}
                  onChange={(e) => setSelectedBairro(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos os bairros</option>
                  {bairroOptions.map(bairro => (
                    <option key={bairro} value={bairro}>{bairro}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Solicitações */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Solicitações ({solicitacoesFiltradas.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Protocolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endereço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bairro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Solicitação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Execução
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitacoesFiltradas.map((solicitacao) => (
                    <tr key={solicitacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{solicitacao.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {solicitacao.protocol ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitacao.serviceType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitacao.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {solicitacao.neighborhood.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{solicitacao.user.name}</div>
                          <div className="text-gray-500">{solicitacao.user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === solicitacao.id ? (
                          <input
                            type="date"
                            value={editingDate}
                            onChange={(e) => setEditingDate(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            placeholder="Selecionar data"
                          />
                        ) : (
                          <span>
                            {solicitacao.executionDate 
                              ? new Date(solicitacao.executionDate).toLocaleDateString('pt-BR')
                              : 'Não definida'
                            }
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === solicitacao.id ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            solicitacao.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                            solicitacao.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                            solicitacao.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {solicitacao.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === solicitacao.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveChanges(solicitacao.id)}
                              disabled={saving === solicitacao.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              {saving === solicitacao.id ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={saving === solicitacao.id}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(solicitacao.id, solicitacao.executionDate, solicitacao.status)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(solicitacao.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
