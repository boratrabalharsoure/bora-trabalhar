import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET - Buscar todos os tipos de serviços
export async function GET() {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(serviceTypes)
  } catch (error) {
    console.error('Erro ao buscar tipos de serviços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}