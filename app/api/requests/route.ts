import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET - Buscar solicitações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const neighborhoodId = searchParams.get('neighborhoodId')
    const serviceTypeId = searchParams.get('serviceTypeId')
    const userId = searchParams.get('userId')
    const protocol = searchParams.get('protocol')

    const where: any = {}

    if (status) where.status = status
    if (neighborhoodId) where.neighborhoodId = parseInt(neighborhoodId)
    if (serviceTypeId) where.serviceTypeId = parseInt(serviceTypeId)
    if (protocol) where.protocol = protocol
    if (userId) {
      // Buscar por email do usuário
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      if (user) {
        where.userId = user.id
      }
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        neighborhood: true,
        serviceType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateProtocol(): string {
  const part1 = Date.now().toString(36).toUpperCase()
  const part2 = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BT-${part1}-${part2}`
}

// POST - Criar nova solicitação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, description, userId, neighborhoodId, serviceTypeId } = body

    // Validação básica
    if (!address || !description || !userId || !neighborhoodId || !serviceTypeId) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const protocol = generateProtocol()

    const newRequest = await prisma.request.create({
      data: {
        address,
        description,
        userId,
        neighborhoodId,
        serviceTypeId,
        protocol
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        neighborhood: true,
        serviceType: true
      }
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}