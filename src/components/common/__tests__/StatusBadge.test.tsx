import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils';
import { StatusBadge, VISTORIA_STATUS_CONFIG } from '../StatusBadge';

describe('StatusBadge', () => {
  it('deve renderizar status "Pendente" corretamente', () => {
    const { getByText } = render(<StatusBadge status="pending" config={VISTORIA_STATUS_CONFIG} />);
    expect(getByText('Pendente')).toBeInTheDocument();
  });

  it('deve renderizar status "Em Andamento"', () => {
    const { getByText } = render(<StatusBadge status="in_progress" config={VISTORIA_STATUS_CONFIG} />);
    expect(getByText('Em Andamento')).toBeInTheDocument();
  });

  it('deve renderizar status "Concluída"', () => {
    const { getByText } = render(<StatusBadge status="completed" config={VISTORIA_STATUS_CONFIG} />);
    expect(getByText('Concluída')).toBeInTheDocument();
  });

  it('deve renderizar status desconhecido como outline', () => {
    const { getByText } = render(<StatusBadge status="unknown" config={VISTORIA_STATUS_CONFIG} />);
    expect(getByText('unknown')).toBeInTheDocument();
  });

  it('deve ter aria-label descritivo', () => {
    const { getByLabelText } = render(<StatusBadge status="pending" config={VISTORIA_STATUS_CONFIG} />);
    expect(getByLabelText('Status: Pendente')).toBeInTheDocument();
  });
});
