import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// PUT - Atualizar solicitação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { status, executionDate } = body

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (executionDate !== undefined) {
      updateData.executionDate = executionDate ? new Date(executionDate) : null
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar solicitação (método alternativo)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar se a solicitação existe
    const existingRequest = await prisma.request.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar apenas os campos fornecidos
    const updateData: any = {}
    
    if (body.executionDate !== undefined) {
      updateData.executionDate = body.executionDate ? new Date(body.executionDate) : null
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar solicitação específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const requestData = await prisma.request.findUnique({
      where: { id },
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

    if (!requestData) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(requestData)
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar existência antes de excluir
    const existingRequest = await prisma.request.findUnique({ where: { id } })
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    await prisma.request.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}