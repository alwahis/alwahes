/**
 * Validates if a phone number is exactly 11 digits
 * @param {string} number - The phone number to validate
 * @returns {boolean} - Whether the number is valid
 */
export function isValidPhoneNumber(number) {
  if (!number) return false;
  const cleaned = number.replace(/\D/g, '');
  return cleaned.length === 11;
}

/**
 * Formats a phone number for WhatsApp by ensuring it has the correct country code
 * @param {string} number - The phone number to format
 * @returns {string} - The formatted phone number
 */
export function formatWhatsAppNumber(number) {
  if (!number) return '';
  
  // Remove any non-digit characters
  let cleaned = number.replace(/\D/g, '');
  
  // Check if the number is valid (11 digits)
  if (cleaned.length !== 11) {
    throw new Error('Phone number must be exactly 11 digits');
  }
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');
  
  // If number starts with 7, add Iraq country code
  if (cleaned.startsWith('7')) {
    cleaned = '964' + cleaned;
  }
  // If number doesn't have country code, add Iraq country code
  else if (!cleaned.startsWith('964')) {
    cleaned = '964' + cleaned;
  }
  
  return cleaned;
}
