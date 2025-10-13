import { describe, it, expect, vi } from 'vitest';
import { render, userEvent } from '@/test/utils';
import { PaginationControls } from '../PaginationControls';

describe('PaginationControls', () => {
  const defaultProps = {
    currentPage: 2,
    totalPages: 5,
    startItem: 21,
    endItem: 40,
    totalItems: 100,
    onPageChange: vi.fn(),
    onNextPage: vi.fn(),
    onPreviousPage: vi.fn(),
  };

  it('deve renderizar informações de paginação', () => {
    const { getByText } = render(<PaginationControls {...defaultProps} />);
    expect(getByText(/Mostrando/i)).toBeInTheDocument();
    expect(getByText('21')).toBeInTheDocument();
    expect(getByText('40')).toBeInTheDocument();
  });

  it('deve chamar onNextPage ao clicar em "Próxima"', async () => {
    const user = userEvent.setup();
    const onNextPage = vi.fn();
    
    const { getByLabelText } = render(<PaginationControls {...defaultProps} onNextPage={onNextPage} />);
    
    await user.click(getByLabelText('Próxima página'));
    
    expect(onNextPage).toHaveBeenCalled();
  });

  it('deve desabilitar "Anterior" na primeira página', () => {
    const { getByLabelText } = render(<PaginationControls {...defaultProps} currentPage={1} startItem={1} endItem={20} />);
    expect(getByLabelText('Página anterior')).toBeDisabled();
  });

  it('deve desabilitar "Próxima" na última página', () => {
    const { getByLabelText } = render(<PaginationControls {...defaultProps} currentPage={5} startItem={81} endItem={100} />);
    expect(getByLabelText('Próxima página')).toBeDisabled();
  });

  it('não deve renderizar se totalPages <= 1', () => {
    const { container } = render(<PaginationControls {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });
});
