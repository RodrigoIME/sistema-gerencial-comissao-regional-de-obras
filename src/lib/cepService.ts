import { createValidationError, createNetworkError } from '@/lib/errors';

export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const buscarEnderecoPorCEP = async (cep: string): Promise<EnderecoViaCEP | null> => {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length !== 8) {
    throw createValidationError("CEP deve ter 8 dígitos", {
      module: 'cep',
      action: 'buscar',
    });
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      throw createNetworkError('Erro ao buscar CEP', {
        module: 'cep',
        metadata: { statusCode: response.status },
      });
    }
    
    const data = await response.json();
    
    if (data.erro) {
      throw createValidationError("CEP não encontrado", {
        module: 'cep',
        action: 'buscar',
        metadata: { cep: cepLimpo },
      });
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const formatarCEP = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.substring(0, 8);
  
  const match = limited.match(/^(\d{0,5})(\d{0,3})$/);
  
  if (!match) return value;
  
  const [, parte1, parte2] = match;
  
  if (parte2) {
    return `${parte1}-${parte2}`;
  }
  
  return parte1;
};
