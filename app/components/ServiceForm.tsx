'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ServiceFormProps {
  serviceType: string
}

interface Neighborhood {
  id: number
  name: string
}

interface ServiceType {
  id: number
  name: string
}

export default function ServiceForm({ serviceType }: ServiceFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    neighborhoodId: '',
    description: '',
    phone: '',
  })
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [protocol, setProtocol] = useState<string | null>(null)
  const [showProtocolModal, setShowProtocolModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar bairros
        const neighborhoodsResponse = await fetch('/api/neighborhoods')
        const neighborhoodsData = await neighborhoodsResponse.json()
        setNeighborhoods(neighborhoodsData)

        // Buscar tipos de serviços
        const serviceTypesResponse = await fetch('/api/service-types')
        const serviceTypesData = await serviceTypesResponse.json()
        setServiceTypes(serviceTypesData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Encontrar o tipo de serviço pelo nome
      const selectedServiceType = serviceTypes.find(st => st.name === serviceType)
      if (!selectedServiceType) {
        alert('Tipo de serviço não encontrado')
        return
      }

      // Primeiro, criar ou encontrar o usuário
      let user = null
      try {
        const userResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: `${formData.name.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
            name: formData.name,
            phone: formData.phone
          }),
        })
        user = await userResponse.json()
      } catch (error) {
        console.error('Erro ao criar usuário:', error)
        alert('Erro ao processar dados do usuário')
        return
      }

      // Criar a solicitação
      const requestResponse = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          description: formData.description,
          userId: user.id,
          neighborhoodId: parseInt(formData.neighborhoodId),
          serviceTypeId: selectedServiceType.id
        }),
      })

      if (requestResponse.ok) {
        const requestData = await requestResponse.json()
        const generatedProtocol = requestData.protocol ?? null

        // Emite BroadcastChannel para acionar notificação imediata no Admin
        if (typeof window !== 'undefined' && ("BroadcastChannel" in window)) {
          try {
            console.log('[ServiceForm] Emitindo evento BroadcastChannel \'requests\' com protocolo:', generatedProtocol)
            const channel = new BroadcastChannel('requests')
            channel.postMessage({ type: 'new_request', protocol: generatedProtocol })
            channel.close()
          } catch (bcErr) {
            console.warn('Falha ao emitir BroadcastChannel:', bcErr)
          }
        }

        // Fallback: emitir via localStorage para acionar evento 'storage'
        try {
          localStorage.setItem('bt.new_request', JSON.stringify({ type: 'new_request', protocol: generatedProtocol, ts: Date.now() }))
          // Opcional: limpar depois de alguns segundos
          setTimeout(() => {
            try { localStorage.removeItem('bt.new_request') } catch {}
          }, 2000)
        } catch (lsErr) {
          console.warn('Falha ao emitir via localStorage:', lsErr)
        }

        setProtocol(generatedProtocol)
        setShowProtocolModal(true)
        // Resetar formulário
        setFormData({
          name: '',
          address: '',
          neighborhoodId: '',
          description: '',
          phone: '',
        })
      } else {
        const errorData = await requestResponse.json()
        alert(`Erro ao enviar solicitação: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      alert('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleConfirmProtocol = () => {
    setShowProtocolModal(false)
    setSubmitSuccess(true)
    router.push('/minhas-solicitacoes')
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">
              Solicitação Enviada com Sucesso!
            </h2>
            <p className="text-white/80">
              Sua solicitação de {serviceType} foi registrada e será processada em breve.
            </p>
            {protocol && (
              <div className="mt-4">
                <p className="text-sm text-white/90">Número do protocolo:</p>
                <p className="text-xl font-mono font-bold">{protocol}</p>
                <p className="text-white/80 mt-2">Guarde este número para acompanhar o andamento.</p>
              </div>
            )}
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">
              Redirecionando para Minhas Solicitações...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h2 className="text-2xl font-bold">
            Solicitar {serviceType}
          </h2>
          <p className="text-white/80 mt-1">
            Preencha os dados abaixo para solicitar o serviço
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                placeholder="Digite o endereço completo"
              />
            </div>

            <div>
              <label htmlFor="neighborhoodId" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <select
                id="neighborhoodId"
                name="neighborhoodId"
                value={formData.neighborhoodId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Selecione o bairro</option>
                {neighborhoods.map(neighborhood => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Problema
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              placeholder="Descreva detalhadamente o problema ou solicitação"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                'Enviar Solicitação'
              )}
            </button>
          </div>
        </div>
      </form>

      {showProtocolModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800">Protocolo gerado</h3>
            <p className="text-gray-600 mt-2">
              Seu número de protocolo é:
            </p>
            <p className="mt-3 text-2xl font-mono font-bold text-blue-700">{protocol}</p>
            <p className="text-gray-600 mt-3">
              Por favor, anote seu protocolo para acompanhar sua solicitação.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleConfirmProtocol}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Confirmar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}