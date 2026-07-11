import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET - Buscar todos os bairros
export async function GET() {
  try {
    const neighborhoods = await prisma.neighborhood.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(neighborhoods)
  } catch (error) {
    console.error('Erro ao buscar bairros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}