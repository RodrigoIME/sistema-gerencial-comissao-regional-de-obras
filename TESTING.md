# Sistema de Logging e Testes

## Logging

### Como usar o Logger

```typescript
import { logger } from '@/lib/logger/init';

// Debug (apenas em desenvolvimento)
logger.debug('Dados carregados', {
  module: 'DashboardPage',
  metadata: { count: 42 }
});

// Info
logger.info('Usuário fez login', {
  module: 'AuthService',
  userId: user.id
});

// Warning
logger.warn('Cache expirado', {
  module: 'CacheService'
});

// Error
logger.error('Falha ao salvar', error, {
  module: 'ProjetosService',
  action: 'create'
});

// Performance tracking
const endTimer = logger.startTimer('Fetch projetos');
await fetchProjetos();
endTimer(); // Log: "⏱️ Fetch projetos { duration: '234ms' }"
```

## Testes

### Rodar testes

```bash
npm test              # Rodar todos os testes
npm run test:ui       # Interface visual
npm run test:coverage # Gerar relatório de cobertura
```

### Estrutura de Testes

- `src/test/setup.ts` - Configuração global
- `src/test/utils.tsx` - Helpers (render customizado)
- `**/__tests__/*.test.ts(x)` - Arquivos de teste

### Exemplo de Teste

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils';
import { MeuComponente } from '../MeuComponente';

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    const { getByText } = render(<MeuComponente />);
    expect(getByText('Olá')).toBeInTheDocument();
  });
});
```

## Cobertura Atual

- ✅ Utilitários: formatters, errorHandler
- ✅ Hooks: usePagination, useDebounce
- ✅ Componentes: StatusBadge, PaginationControls, LoadingSpinner
- ✅ Sistema de logging integrado

## Próximos Passos

1. Adicionar testes para services (ProjetosService, SolicitacoesService)
2. Adicionar testes para páginas principais
3. Configurar CI/CD para rodar testes automaticamente
