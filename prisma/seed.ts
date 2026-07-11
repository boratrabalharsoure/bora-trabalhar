import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar bairros
  const neighborhoods = [
    'Bairro Novo',
    'Macacheira', 
    'Centro',
    'Pacoval',
    'Umirizal',
    'S. Pedro',
    'Matinha',
    'Tucumanduba',
    'Bom Futuro',
    'Puá',
    'Pedral',
    'Pesqueiro',
    'Caju-Una',
    'Vila do Céu'
  ]

  console.log('📍 Criando bairros...')
  for (const name of neighborhoods) {
    await prisma.neighborhood.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // Criar tipos de serviços
  const serviceTypes = [
    { name: 'Roçagem', description: 'Serviço de roçagem em áreas públicas', icon: '🌿' },
    { name: 'Iluminação Pública', description: 'Manutenção e reparo de iluminação pública', icon: '💡' },
    { name: 'Retirada de Entulho', description: 'Remoção de entulho e detritos', icon: '🗑️' },
    { name: 'Limpeza Urbana', description: 'Limpeza de vias e espaços públicos', icon: '🧹' },
    { name: 'Poda de Árvores', description: 'Poda e manutenção de árvores', icon: '🌳' },
    { name: 'Eliminação de Poças', description: 'Eliminação de poças d\'água parada', icon: '💧' }
  ]

  console.log('🛠️ Criando tipos de serviços...')
  for (const serviceType of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { name: serviceType.name },
      update: {},
      create: serviceType
    })
  }

  // Criar usuário administrador
  console.log('👤 Criando usuário administrador...')
  await prisma.user.upsert({
    where: { email: 'admin@soure.pa.gov.br' },
    update: {},
    create: {
      email: 'admin@soure.pa.gov.br',
      name: 'Administrador',
      role: 'admin',
      phone: '(91) 99999-0000'
    }
  })

  // Criar alguns usuários de exemplo
  console.log('👥 Criando usuários de exemplo...')
  const users = [
    { email: 'joao.silva@email.com', name: 'João Silva', phone: '(91) 99999-9999' },
    { email: 'maria.santos@email.com', name: 'Maria Santos', phone: '(91) 98888-8888' },
    { email: 'pedro.oliveira@email.com', name: 'Pedro Oliveira', phone: '(91) 97777-7777' },
    { email: 'ana.costa@email.com', name: 'Ana Costa', phone: '(91) 96666-6666' }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
  }

  // Buscar dados para criar solicitações
  const createdUsers = await prisma.user.findMany({ where: { role: 'user' } })
  const createdNeighborhoods = await prisma.neighborhood.findMany()
  const createdServiceTypes = await prisma.serviceType.findMany()

  // Criar solicitações de exemplo
  console.log('📋 Criando solicitações de exemplo...')
  const requests = [
    {
      address: 'Rua Principal, 123',
      description: 'Solicitação de roçagem em área pública',
      status: 'Em andamento',
      executionDate: new Date('2024-02-20'),
      userId: createdUsers[0].id,
      neighborhoodId: createdNeighborhoods.find(n => n.name === 'Centro')?.id || 1,
      serviceTypeId: createdServiceTypes.find(s => s.name === 'Roçagem')?.id || 1
    },
    {
      address: 'Av. Central, 456',
      description: 'Poste de luz quebrado',
      status: 'Concluído',
      executionDate: new Date('2024-02-16'),
      userId: createdUsers[1].id,
      neighborhoodId: createdNeighborhoods.find(n => n.name === 'Macacheira')?.id || 2,
      serviceTypeId: createdServiceTypes.find(s => s.name === 'Iluminação Pública')?.id || 2
    },
    {
      address: 'Rua das Flores, 789',
      description: 'Entulho acumulado em terreno baldio',
      status: 'Pendente',
      userId: createdUsers[2].id,
      neighborhoodId: createdNeighborhoods.find(n => n.name === 'Bairro Novo')?.id || 1,
      serviceTypeId: createdServiceTypes.find(s => s.name === 'Retirada de Entulho')?.id || 3
    },
    {
      address: 'Rua do Comércio, 321',
      description: 'Limpeza de via pública',
      status: 'Em andamento',
      executionDate: new Date('2024-02-22'),
      userId: createdUsers[3].id,
      neighborhoodId: createdNeighborhoods.find(n => n.name === 'Umirizal')?.id || 5,
      serviceTypeId: createdServiceTypes.find(s => s.name === 'Limpeza Urbana')?.id || 4
    }
  ]

  for (const request of requests) {
    await prisma.request.create({
      data: request
    })
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })