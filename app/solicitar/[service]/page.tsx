import React from 'react'
import ServiceForm from '../../components/ServiceForm'

interface ServicePageProps {
  params: {
    service: string
  }
}

const serviceTitles: { [key: string]: string } = {
  rocagem: 'Roçagem',
  entulho: 'Retirada de Entulho',
  iluminacao: 'Iluminação Pública',
  pocas: 'Eliminação de Poças',
  poda: 'Poda de Árvores',
  limpeza: 'Limpeza Urbana'
}

export default function ServicePage({ params }: ServicePageProps) {
  const serviceTitle = serviceTitles[params.service] || 'Serviço'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Solicitar {serviceTitle}
          </h1>
          <p className="text-gray-600">
            Preencha o formulário abaixo para solicitar o serviço
          </p>
        </header>

        <ServiceForm serviceType={serviceTitle} />
      </div>
    </div>
  )
}