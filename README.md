# Bora Trabalhar - Serviços Públicos Soure

Aplicativo web moderno para solicitação de serviços públicos da prefeitura de Soure.

## Funcionalidades

- Solicitação de roçagem
- Retirada de entulho
- Reporte de problemas com iluminação pública
- Solicitação de eliminação de poças d'água
- Solicitação de poda de árvores

## Tecnologias Utilizadas

- Next.js 13
- TypeScript
- Tailwind CSS
- React

## Requisitos

- Node.js 18.0.0 ou superior
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/boratrabalharsoure/bora-trabalhar.git
cd bora-trabalhar
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Acesse o aplicativo em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
bora-trabalhar/
├── app/
│   ├── components/
│   │   └── ServiceForm.tsx
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── styles/
├── tailwind.config.ts
└── package.json
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 
# Bora Trabalhar
## Deploy no Netlify

Este projeto usa Prisma e atualmente está configurado para desenvolvimento com SQLite. Em produção no Netlify, utilize PostgreSQL.

### Passo a passo

1. Criar um banco PostgreSQL (Neon, Supabase, Railway):
   - Crie uma conta e um projeto.
   - Copie a `DATABASE_URL` (formato: `postgresql://usuario:senha@host:port/dbname?schema=public`).

2. Configuração do projeto (já aplicada):
   - `prisma/schema.postgresql.prisma`: schema de produção com `provider = "postgresql"` e `binaryTargets = ["windows", "linux-x64"]`.
   - `netlify.toml`: build executa `npx prisma generate --schema prisma/schema.postgresql.prisma && npm run build` e publica `.next`.

3. Variáveis de ambiente no Netlify:
   - No painel: Site settings → Environment variables → adicione `DATABASE_URL` com a URL do seu banco.

4. Deploy:
   - Via Git: Conecte o repositório, o Netlify lerá `netlify.toml` e fará o build.
   - Via CLI: `netlify login`, `netlify init`, `netlify env:set DATABASE_URL "postgresql://..."`, `netlify deploy --prod --build`.

5. Migração/Seed local (opcional):
   - Antes do deploy, você pode apontar sua `.env` para o Postgres e rodar:
     - `npm run db:generate`
     - `npm run db:push`
     - `npm run db:seed`

### Observações

- SQLite não é suportado em produção no Netlify (FS efêmero). Use Postgres.
- O schema padrão (`prisma/schema.prisma`) continua com SQLite para desenvolvimento local. Em produção, o build usa `schema.postgresql.prisma`.
- Se desejar unificar dev e prod em Postgres, basta ajustar sua `.env` local para o Postgres e usar `schema.postgresql.prisma` também no desenvolvimento.