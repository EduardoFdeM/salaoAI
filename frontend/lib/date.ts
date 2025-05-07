/**
 * Formata uma data relativa a hoje (ex: "em 30 dias", "há 2 dias")
 */
export function formatRelativeDate(date: Date): string {
  // Retorna 'Inválido' se a data for inválida
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Data inválida';
  }

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Para datas no passado
  if (diffDays < 0) {
    if (diffDays === -1) return 'ontem';
    if (diffDays > -7) return `há ${Math.abs(diffDays)} dias`;
    if (diffDays > -30) return `há ${Math.ceil(Math.abs(diffDays) / 7)} semanas`;
    if (diffDays > -365) return `há ${Math.ceil(Math.abs(diffDays) / 30)} meses`;
    return `há ${Math.ceil(Math.abs(diffDays) / 365)} anos`;
  }
  
  // Para datas no futuro
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'amanhã';
  if (diffDays < 7) return `em ${diffDays} dias`;
  if (diffDays < 30) return `em ${Math.ceil(diffDays / 7)} semanas`;
  if (diffDays < 365) return `em ${Math.ceil(diffDays / 30)} meses`;
  return `em ${Math.ceil(diffDays / 365)} anos`;
}

/**
 * Formata uma data e hora
 */
export function formatDateTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

/**
 * Formata apenas a data
 */
export function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
} 