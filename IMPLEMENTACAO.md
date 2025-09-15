# Plano de Implementação

## Objetivo
Configurar e rodar a aplicação localmente para permitir desenvolvimento e testes mais rápidos.

## Etapas

1.  **Verificar dependências**
    *   Certificar-se de que `node` e `npm` (ou `yarn`/`pnpm`) estão instalados.
    *   Versões recomendadas: Node >= 18, npm >= 9.

2.  **Instalar dependências do projeto**
    *   Executar `npm install` (ou `yarn install`/`pnpm install`) na raiz do projeto para instalar todas as bibliotecas listadas em `package.json`.

3.  **Configurar variáveis de ambiente**
    *   Criar um arquivo `.env` na raiz do projeto com base no `.env.example`.
    *   Preencher as variáveis necessárias, especialmente as relacionadas ao Supabase (URL e chave de acesso). Para desenvolvimento inicial, valores mockados podem ser suficientes.

4.  **Rodar a aplicação em modo de desenvolvimento**
    *   Executar `npm run dev` (ou `yarn dev`/`pnpm dev`).
    *   A aplicação deve iniciar e estar disponível em `http://localhost:8080` (ou a porta configurada no `vite.config.ts`).

5.  **Verificar funcionamento**
    *   Acessar `http://localhost:8080` no navegador.
    *   Navegar pelas diferentes páginas da aplicação (Login, Dashboard, Funcionárias, etc.) para garantir que os componentes estão carregando corretamente.
    *   Testar a funcionalidade atual de cadastro de funcionárias (que está usando dados mockados).

6.  **Próximos passos**
    *   Integrar com o backend Supabase para persistência real dos dados.
    *   Implementar autenticação.
    *   Desenvolver as funcionalidades subsequentes do fluxo (questionário, sociograma, relatórios).