'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import NotificationSystem from '../../components/NotificationSystem'
import { useAuth } from '../../contexts/AuthContext'

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

type Periodo = 'all' | '7d' | '30d'

interface DistribuicaoItem {
  label: string
  value: number
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Periodo>('all')
  const [foco, setFoco] = useState<'status' | 'tipo' | 'bairro'>('status')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/requests')
        const data = await response.json()
        setSolicitacoes(data)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filtrarPorPeriodo = (items: Solicitacao[]): Solicitacao[] => {
    if (periodo === 'all') return items
    const agora = new Date()
    const limite = new Date()
    if (periodo === '7d') {
      limite.setDate(agora.getDate() - 7)
    } else if (periodo === '30d') {
      limite.setDate(agora.getDate() - 30)
    }
    return items.filter(item => {
      const data = new Date(item.createdAt)
      return data >= limite
    })
  }

  const construirDistribuicao = (
    items: Solicitacao[],
    chave: (item: Solicitacao) => string
  ): DistribuicaoItem[] => {
    const mapa = new Map<string, number>()
    items.forEach(item => {
      const key = chave(item)
      mapa.set(key, (mapa.get(key) ?? 0) + 1)
    })
    return Array.from(mapa.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }

  const solicitacoesFiltradas = filtrarPorPeriodo(solicitacoes)
  const totalSolicitacoes = solicitacoesFiltradas.length
  const concluidas = solicitacoesFiltradas.filter(s => s.status === 'Concluído').length
  const emAndamento = solicitacoesFiltradas.filter(s => s.status === 'Em andamento').length
  const pendentes = solicitacoesFiltradas.filter(s => s.status === 'Pendente').length

  const distribuicaoStatus = construirDistribuicao(solicitacoesFiltradas, item => item.status)
  const distribuicaoTipos = construirDistribuicao(
    solicitacoesFiltradas,
    item => item.serviceType.name
  )
  const distribuicaoBairros = construirDistribuicao(
    solicitacoesFiltradas,
    item => item.neighborhood.name
  )

  const maxStatus = distribuicaoStatus.reduce((max, item) => Math.max(max, item.value), 0)
  const maxTipos = distribuicaoTipos.reduce((max, item) => Math.max(max, item.value), 0)
  const maxBairros = distribuicaoBairros.reduce((max, item) => Math.max(max, item.value), 0)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando painel de insights...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                Visão analítica em tempo real
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Dashboard de Solicitações
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Explore visualmente os tipos de solicitações, serviços mais demandados e a
                distribuição por bairros para apoiar a gestão operacional.
              </p>
            </div>
            <div className="flex flex-col items-end space-y-3">
              <div className="flex items-center space-x-4">
                <NotificationSystem />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Administrador</p>
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm transition transform hover:-translate-y-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 14.707a1 1 0 01-1.414 0L4.586 11H17a1 1 0 110 2H4.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414l5.414-5.414a1 1 0 111.414 1.414L4.586 9H17a1 1 0 110 2H4.586l3.707 3.707z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Voltar ao painel
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm transition transform hover:-translate-y-0.5"
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPeriodo('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  periodo === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Todo o período
              </button>
              <button
                onClick={() => setPeriodo('7d')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  periodo === '7d'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Últimos 7 dias
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFoco('status')}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition ${
                  foco === 'status'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Foco em status
              </button>
              <button
                onClick={() => setFoco('tipo')}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition ${
                  foco === 'tipo'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Foco em serviços
              </button>
              <button
                onClick={() => setFoco('bairro')}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition ${
                  foco === 'bairro'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Foco em bairros
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -left-16 bottom-0 w-40 h-40 bg-white/5 rounded-full" />
              <div className="relative">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-100 mb-2">
                  Panorama geral
                </h2>
                <p className="text-3xl font-bold mb-1">{totalSolicitacoes}</p>
                <p className="text-blue-100 text-sm mb-6">
                  Solicitações no período selecionado
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-blue-100">Pendentes</p>
                    <p className="text-xl font-semibold">{pendentes}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-blue-100">Em andamento</p>
                    <p className="text-xl font-semibold">{emAndamento}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-blue-100">Concluídas</p>
                    <p className="text-xl font-semibold">{concluidas}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Status em destaque
                </p>
                {distribuicaoStatus[0] ? (
                  <>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {distribuicaoStatus[0].label}
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {distribuicaoStatus[0].value}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Sem dados no período selecionado.</p>
                )}
              </div>
              <span className="mt-4 inline-flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                Atualizado em tempo real
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Total por foco
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {foco === 'status'
                  ? distribuicaoStatus.length
                  : foco === 'tipo'
                  ? distribuicaoTipos.length
                  : distribuicaoBairros.length}
              </p>
              <p className="text-gray-500 text-sm">
                {foco === 'status' && 'Quantidade de status diferentes encontrados.'}
                {foco === 'tipo' && 'Quantidade de tipos de serviço diferentes encontrados.'}
                {foco === 'bairro' && 'Quantidade de bairros com solicitações registradas.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Distribuição por status
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  {totalSolicitacoes} solicitações
                </span>
              </div>
              <div className="space-y-4">
                {distribuicaoStatus.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Nenhuma solicitação encontrada para o período selecionado.
                  </p>
                )}
                {distribuicaoStatus.map(item => {
                  const porcentagem =
                    totalSolicitacoes > 0
                      ? Math.round((item.value / totalSolicitacoes) * 100)
                      : 0
                  const largura =
                    maxStatus > 0 ? Math.max((item.value / maxStatus) * 100, 8) : 0
                  
                  // Definir cores específicas por status
                  const statusColors: { [key: string]: string } = {
                    'Concluído': 'from-emerald-500 to-teal-600',
                    'Em andamento': 'from-amber-400 to-orange-500',
                    'Pendente': 'from-blue-500 to-indigo-600',
                    'Cancelado': 'from-red-500 to-rose-600'
                  }
                  
                  const gradientClass = statusColors[item.label] || 'from-gray-400 to-gray-600'

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.label === 'Concluído'
                                ? 'bg-emerald-500'
                                : item.label === 'Em andamento'
                                ? 'bg-amber-500'
                                : item.label === 'Pendente'
                                ? 'bg-blue-500'
                                : item.label === 'Cancelado'
                                ? 'bg-red-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.value} ({porcentagem}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-500`}
                          style={{ width: `${largura}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tipos de serviço mais demandados
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  Top 5
                </span>
              </div>
              {distribuicaoTipos.length === 0 && (
                <p className="text-sm text-gray-500">
                  Nenhum tipo de serviço encontrado para o período selecionado.
                </p>
              )}
              <div className="flex items-end space-x-3 h-56">
                {distribuicaoTipos.slice(0, 5).map(item => {
                  const altura =
                    maxTipos > 0 ? Math.max((item.value / maxTipos) * 100, 15) : 0
                  return (
                    <div
                      key={item.label}
                      className="flex-1 flex flex-col items-center group"
                      title={`${item.label}: ${item.value} solicitações`}
                    >
                      <div className="relative w-full flex-1 flex items-end">
                        <div className="w-full bg-gray-100 rounded-xl overflow-hidden">
                          <div
                            className="w-full rounded-xl bg-gradient-to-t from-indigo-600 via-blue-500 to-sky-400 transition-all duration-500 group-hover:from-indigo-500 group-hover:to-sky-300"
                            style={{ height: `${altura}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-gray-800 truncate max-w-[6rem]">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-gray-500">{item.value} req.</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Distribuição de solicitações por bairro
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                {distribuicaoBairros.length} bairros atendidos
              </span>
            </div>
            
            {distribuicaoBairros.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum bairro com solicitações para o período selecionado.
              </p>
            ) : (
              <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
                {/* Gráfico de Pizza SVG */}
                <div className="relative w-64 h-64 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {(() => {
                      let cumulativePercent = 0
                      const colors = [
                        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
                        '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
                      ]
                      
                      return distribuicaoBairros.map((item, index) => {
                        const percent = (item.value / totalSolicitacoes) * 100
                        const dashArray = `${percent} ${100 - percent}`
                        const dashOffset = -cumulativePercent
                        cumulativePercent += percent
                        
                        return (
                          <circle
                            key={item.label}
                            cx="50"
                            cy="50"
                            r="15.91549430918954" // Raio para que a circunferência seja exatamente 100
                            fill="transparent"
                            stroke={colors[index % colors.length]}
                            strokeWidth="32"
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-1000 ease-out hover:opacity-80 cursor-pointer"
                          >
                            <title>{item.label}: {item.value} ({Math.round(percent)}%)</title>
                          </circle>
                        )
                      })
                    })()}
                  </svg>
                  {/* Centro do gráfico */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 bg-white rounded-full shadow-inner flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-gray-800">{totalSolicitacoes}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Total</p>
                    </div>
                  </div>
                </div>

                {/* Legenda */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-h-80 overflow-y-auto pr-4">
                  {distribuicaoBairros.map((item, index) => {
                    const colors = [
                      '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
                      '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
                    ]
                    const percent = Math.round((item.value / totalSolicitacoes) * 100)
                    
                    return (
                      <div key={item.label} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-sm flex-shrink-0" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="text-sm text-gray-700 truncate max-w-[120px] group-hover:text-blue-600 transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                          <span className="text-[10px] text-gray-400">({percent}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

