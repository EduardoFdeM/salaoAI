import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaAdminHelpers {
  /**
   * Verifica se um valor é um objeto
   */
  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Verifica se um valor é uma data
   */
  isDate(value: any): boolean {
    return value instanceof Date;
  }

  /**
   * Verifica se um valor é um booleano
   */
  isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }

  /**
   * Verifica se um valor é um número
   */
  isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Verifica se um valor é uma string
   */
  isString(value: any): boolean {
    return typeof value === 'string';
  }

  /**
   * Verifica se um valor é um array
   */
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * Verifica se um valor é null
   */
  isNull(value: any): boolean {
    return value === null;
  }

  /**
   * Verifica se um valor é undefined
   */
  isUndefined(value: any): boolean {
    return value === undefined;
  }

  /**
   * Verifica se um valor é vazio
   */
  isEmpty(value: any): boolean {
    if (this.isString(value)) return value.trim() === '';
    if (this.isArray(value)) return value.length === 0;
    if (this.isObject(value)) return Object.keys(value).length === 0;
    return this.isNull(value) || this.isUndefined(value);
  }

  /**
   * Formata uma data para exibição
   */
  formatDate(date: Date): string {
    if (!this.isDate(date)) return '';
    return date.toISOString();
  }

  /**
   * Trunca uma string para um comprimento máximo
   */
  truncateString(str: string, length: number = 50): string {
    if (!this.isString(str)) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  /**
   * Verifica se um tipo é um campo JSON
   */
  isJsonField(type: string): boolean {
    return type === 'Json';
  }

  /**
   * Verifica se um tipo é um campo de texto
   */
  isTextField(type: string): boolean {
    return type === 'String' && type.indexOf('Text') >= 0;
  }

  /**
   * Verifica se um tipo é um campo de data
   */
  isDateField(type: string): boolean {
    return type === 'DateTime';
  }

  /**
   * Verifica se um tipo é um campo booleano
   */
  isBooleanField(type: string): boolean {
    return type === 'Boolean';
  }
}
