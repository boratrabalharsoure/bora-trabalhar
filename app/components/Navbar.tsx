import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            <Image 
              src="/logo.png" 
              alt="Bora Trabalhar Logo" 
              width={40} 
              height={40}
              className="rounded-lg shadow-sm"
            />
            <span>Bora Trabalhar</span>
          </Link>
          
          <div className="flex space-x-4 items-center">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
              title="Página Inicial"
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              <span className="hidden sm:inline">Início</span>
            </Link>
            <Link 
              href="/minhas-solicitacoes"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Solicitações
            </Link>
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}