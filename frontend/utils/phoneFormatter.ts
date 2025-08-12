/**
 * Phone number formatting utilities
 * Formats phone numbers to (XXX) XXX-XXXX format
 */

/**
 * Formats a phone number string to (XXX) XXX-XXXX format
 * @param value - The input phone number (can include letters, spaces, dashes, etc.)
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Don't format if we don't have enough digits
  if (digits.length < 4) {
    return digits;
  }
  
  // Handle different lengths
  if (digits.length <= 6) {
    // Format as XXX-XXX
    return digits.replace(/(\d{3})(\d{1,3})/, '$1-$2');
  } else if (digits.length <= 10) {
    // Format as (XXX) XXX-XXXX
    return digits.replace(/(\d{3})(\d{3})(\d{1,4})/, '($1) $2-$3');
  } else {
    // Handle 11+ digits (assume country code)
    const countryCode = digits.slice(0, digits.length - 10);
    const areaCode = digits.slice(-10, -7);
    const exchange = digits.slice(-7, -4);
    const number = digits.slice(-4);
    
    if (countryCode === '1') {
      // US number with country code
      return `(${areaCode}) ${exchange}-${number}`;
    } else {
      // International number - just format the last 10 digits
      return `+${countryCode} (${areaCode}) ${exchange}-${number}`;
    }
  }
};

/**
 * Validates if a phone number is complete and properly formatted
 * @param phoneNumber - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // A valid US phone number should have exactly 10 digits
  // Or 11 digits if it includes country code (1)
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
};

/**
 * Extracts just the digits from a phone number
 * @param phoneNumber - The formatted phone number
 * @returns String of digits only
 */
export const getPhoneDigits = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};

/**
 * Phone number input change handler
 * Use this in onChange events for phone number inputs
 * @param value - The input value
 * @param maxLength - Maximum length (default 14 for (XXX) XXX-XXXX format)
 * @returns Formatted phone number
 */
export const handlePhoneChange = (value: string, maxLength: number = 14): string => {
  // Don't format if we're deleting and the last character would be formatting
  const formatted = formatPhoneNumber(value);
  
  // Limit the length
  if (formatted.length <= maxLength) {
    return formatted;
  }
  
  return formatted.slice(0, maxLength);
};
