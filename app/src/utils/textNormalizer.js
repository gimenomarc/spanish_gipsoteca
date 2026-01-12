/**
 * Normaliza texto eliminando acentos y convirtiendo a minúsculas
 * Útil para búsquedas que no distinguen acentos
 * 
 * @param {string} text - Texto a normalizar
 * @returns {string} - Texto normalizado sin acentos y en minúsculas
 * 
 * @example
 * normalizeText('México') // 'mexico'
 * normalizeText('José') // 'jose'
 * normalizeText('Niño') // 'nino'
 */
export function normalizeText(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos)
}

/**
 * Verifica si un texto contiene un término de búsqueda (sin acentos)
 * 
 * @param {string} text - Texto donde buscar
 * @param {string} searchTerm - Término de búsqueda
 * @returns {boolean} - true si el texto contiene el término
 * 
 * @example
 * textContains('México', 'mexico') // true
 * textContains('José', 'jose') // true
 */
export function textContains(text, searchTerm) {
  if (!text || !searchTerm) return false;
  return normalizeText(text).includes(normalizeText(searchTerm));
}

/**
 * Busca un término en múltiples campos de un objeto
 * 
 * @param {Object} item - Objeto donde buscar
 * @param {string[]} fields - Array de nombres de campos donde buscar
 * @param {string} searchTerm - Término de búsqueda
 * @returns {boolean} - true si el término se encuentra en alguno de los campos
 * 
 * @example
 * searchInFields(
 *   { name: 'México', code: 'MX', artist: 'José' },
 *   ['name', 'code', 'artist'],
 *   'mexico'
 * ) // true
 */
export function searchInFields(item, fields, searchTerm) {
  if (!searchTerm || !item) return false;
  
  const normalizedSearch = normalizeText(searchTerm);
  
  return fields.some(field => {
    const fieldValue = item[field];
    if (!fieldValue) return false;
    return normalizeText(fieldValue).includes(normalizedSearch);
  });
}
