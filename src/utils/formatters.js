// Price and date formatting utility functions

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatWhatsAppLink = (phoneNumber, message) => {
  const cleanNumber = String(phoneNumber || '').replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(String(message || ''));
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};

