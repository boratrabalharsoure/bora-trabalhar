import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone } = await request.json()

    if (!email || !name || !phone) {
      return NextResponse.json(
        { error: 'Email, nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      // Atualizar dados do usuário existente
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          phone
        }
      })
    } else {
      // Criar novo usuário
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          role: 'USER'
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao processar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}