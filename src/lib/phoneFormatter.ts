export const formatarTelefone = (value: string): string => {
  // Remove tudo que não é dígito
  const cleaned = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = cleaned.substring(0, 11);
  
  // Aplica a máscara
  const match = limited.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  
  if (!match) return value;
  
  const [, ddd, parte1, parte2] = match;
  
  if (parte2) {
    return `(${ddd}) ${parte1}-${parte2}`;
  } else if (parte1) {
    return `(${ddd}) ${parte1}`;
  } else if (ddd) {
    return `(${ddd}`;
  }
  
  return '';
};

export const limparTelefone = (value: string): string => {
  return value.replace(/\D/g, '');
};
