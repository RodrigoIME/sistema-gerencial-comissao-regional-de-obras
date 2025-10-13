import { describe, it, expect, vi } from 'vitest';
import { handleError } from '../errorHandler';
import { AppError, ErrorType } from '../';

describe('errorHandler', () => {
  it('deve converter Error genérico em AppError', () => {
    const error = new Error('Test error');
    const result = handleError(error, { showToast: false, logToConsole: false });
    
    expect(result).toBeInstanceOf(AppError);
    expect(result.type).toBe(ErrorType.UNKNOWN);
  });

  it('deve preservar AppError existente', () => {
    const appError = new AppError('Test', ErrorType.VALIDATION);
    const result = handleError(appError, { showToast: false, logToConsole: false });
    
    expect(result).toBe(appError);
  });

  it('deve rethrow quando rethrow=true', () => {
    const error = new Error('Test');
    
    expect(() => {
      handleError(error, { rethrow: true, showToast: false, logToConsole: false });
    }).toThrow(AppError);
  });

  it('deve tratar erros PostgreSQL duplicados', () => {
    const pgError = {
      code: '23505',
      message: 'duplicate key violation',
      details: 'Key already exists',
      hint: 'Try different value',
    };
    
    const result = handleError(pgError, { showToast: false, logToConsole: false });
    
    expect(result.type).toBe(ErrorType.DB_DUPLICATE);
    expect(result.userMessage).toBe('Este registro já existe no sistema');
  });
});
