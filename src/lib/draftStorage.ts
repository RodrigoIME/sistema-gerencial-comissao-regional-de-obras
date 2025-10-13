const DRAFT_KEY = 'novaSolicitacaoDraft';
const DRAFT_TIMESTAMP_KEY = 'novaSolicitacaoDraftTimestamp';

export const salvarRascunho = (data: any): void => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString());
  } catch (error) {
    // localStorage cheio ou desabilitado
    const isQuotaExceeded = error instanceof DOMException && 
      (error.name === 'QuotaExceededError' || error.code === 22);
    
    if (isQuotaExceeded) {
      console.error('[draftStorage] LocalStorage quota exceeded');
      throw new Error('Espaço de armazenamento local cheio. Limpe o cache do navegador.');
    }
    
    console.error('[draftStorage] Erro ao salvar rascunho:', error);
    throw new Error('Erro ao salvar rascunho localmente');
  }
};

export const carregarRascunho = (): { data: any; timestamp: string } | null => {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
    
    if (draft && timestamp) {
      return {
        data: JSON.parse(draft),
        timestamp
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
    return null;
  }
};

export const limparRascunho = (): void => {
  try {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Erro ao limpar rascunho:', error);
  }
};

export const temRascunho = (): boolean => {
  return localStorage.getItem(DRAFT_KEY) !== null;
};

// Funções para rascunhos de projetos
const PROJETO_DRAFT_KEY = 'novoProjetoDraft';
const PROJETO_DRAFT_TIMESTAMP_KEY = 'novoProjetoDraftTimestamp';

export const salvarRascunhoProjeto = (data: any): void => {
  try {
    localStorage.setItem(PROJETO_DRAFT_KEY, JSON.stringify(data));
    localStorage.setItem(PROJETO_DRAFT_TIMESTAMP_KEY, new Date().toISOString());
  } catch (error) {
    // localStorage cheio ou desabilitado
    const isQuotaExceeded = error instanceof DOMException && 
      (error.name === 'QuotaExceededError' || error.code === 22);
    
    if (isQuotaExceeded) {
      console.error('[draftStorage] LocalStorage quota exceeded (projeto)');
      throw new Error('Espaço de armazenamento local cheio. Limpe o cache do navegador.');
    }
    
    console.error('[draftStorage] Erro ao salvar rascunho de projeto:', error);
    throw new Error('Erro ao salvar rascunho localmente');
  }
};

export const carregarRascunhoProjeto = (): { data: any; timestamp: string } | null => {
  try {
    const draft = localStorage.getItem(PROJETO_DRAFT_KEY);
    const timestamp = localStorage.getItem(PROJETO_DRAFT_TIMESTAMP_KEY);
    
    if (draft && timestamp) {
      return {
        data: JSON.parse(draft),
        timestamp
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao carregar rascunho de projeto:', error);
    return null;
  }
};

export const limparRascunhoProjeto = (): void => {
  try {
    localStorage.removeItem(PROJETO_DRAFT_KEY);
    localStorage.removeItem(PROJETO_DRAFT_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Erro ao limpar rascunho de projeto:', error);
  }
};

export const temRascunhoProjeto = (): boolean => {
  return localStorage.getItem(PROJETO_DRAFT_KEY) !== null;
};
