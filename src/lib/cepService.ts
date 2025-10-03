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
    throw new Error("CEP deve ter 8 dígitos");
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error("CEP não encontrado");
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
