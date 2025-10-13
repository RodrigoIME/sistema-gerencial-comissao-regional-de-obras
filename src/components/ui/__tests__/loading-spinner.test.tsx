import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils';
import { LoadingSpinner } from '../loading-spinner';

describe('LoadingSpinner', () => {
  it('deve renderizar com mensagem padrão', () => {
    const { getByLabelText } = render(<LoadingSpinner />);
    expect(getByLabelText('Carregando')).toBeInTheDocument();
  });

  it('deve renderizar com mensagem customizada', () => {
    const { getByLabelText } = render(<LoadingSpinner message="Carregando projetos" />);
    expect(getByLabelText('Carregando projetos')).toBeInTheDocument();
  });

  it('deve aplicar classe de tamanho correto para sm', () => {
    const { getByLabelText } = render(<LoadingSpinner size="sm" />);
    const spinner = getByLabelText('Carregando');
    expect(spinner.querySelector('.h-4')).toBeInTheDocument();
  });

  it('deve aplicar classe de tamanho correto para lg', () => {
    const { getByLabelText } = render(<LoadingSpinner size="lg" />);
    const spinner = getByLabelText('Carregando');
    expect(spinner.querySelector('.h-12')).toBeInTheDocument();
  });
});
