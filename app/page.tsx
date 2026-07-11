import React from 'react'
import Link from 'next/link'

const services = [
  {
    id: 1,
    title: 'Roçagem',
    description: 'Solicite a roçagem de áreas públicas',
    icon: '🌿',
    slug: 'rocagem',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 2,
    title: 'Retirada de Entulho',
    description: 'Solicite a remoção de entulhos e materiais descartados',
    icon: '🗑️',
    slug: 'entulho',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 3,
    title: 'Iluminação Pública',
    description: 'Reporte problemas com postes de luz',
    icon: '💡',
    slug: 'iluminacao',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 4,
    title: 'Eliminação de Poças',
    description: 'Solicite a drenagem de poças d\'água',
    icon: '💧',
    slug: 'pocas',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 5,
    title: 'Poda de Árvores',
    description: 'Solicite a poda de árvores em áreas públicas',
    icon: '🌳',
    slug: 'poda',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 6,
    title: 'Limpeza Urbana',
    description: 'Solicite a limpeza de vias e espaços públicos',
    icon: '🧹',
    slug: 'limpeza',
    color: 'from-purple-500 to-purple-600'
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-600 mb-4 animate-fade-in">
            Bora Trabalhar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Serviços Públicos da Prefeitura de Soure - Soluções rápidas e eficientes para nossa cidade
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service) => (
            <Link 
              href={`/solicitar/${service.slug}`}
              key={service.id}
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-br ${service.color} rounded-2xl shadow-xl overflow-hidden`}>
                <div className="p-8 text-white">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {service.title}
                  </h2>
                  <p className="text-white/90">
                    {service.description}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 text-center">
                  <span className="text-white font-medium">
                    Solicitar Serviço →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/minhas-solicitacoes"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">Acompanhar Solicitações</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}