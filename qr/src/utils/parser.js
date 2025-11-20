export const parseScannedContent = (raw) => {
  if (!raw || typeof raw !== 'string') {
    return { type: 'unknown', meta: {} };
  }

  const content = raw.trim();

  // URL
  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
  if (urlRegex.test(content)) {
    return { type: 'url', meta: { url: content } };
  }

  // Phone
  const phoneRegex = /^(\+?\d{6,15})$/;
  if (phoneRegex.test(content)) {
    return { type: 'phone', meta: { phone: content } };
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(content)) {
    return { type: 'email', meta: { email: content } };
  }

  // SMS
  if (content.toLowerCase().startsWith('sms:')) {
    try {
      const smsContent = content.replace(/sms:/i, '');
      const [number, query] = smsContent.split('?');

      let body = '';
      if (query && query.includes('body=')) {
        body = decodeURIComponent(query.split('body=')[1]);
      }

      return { type: 'sms', meta: { phone: number, body } };
    } catch (err) {
      console.log("SMS Parse Error:", err);
    }
  }

  // WiFi
  if (content.startsWith('WIFI:')) {
    const wifiData = content.substring(5);
    const parts = wifiData.split(';');
    const meta = {};

    parts.forEach((p) => {
      if (p.startsWith('T:')) meta.security = p.substring(2);
      if (p.startsWith('S:')) meta.ssid = p.substring(2);
      if (p.startsWith('P:')) meta.password = p.substring(2);
    });

    return { type: 'wifi', meta };
  }

  // vCard
  if (content.includes('BEGIN:VCARD')) {
    const lines = content.split('\n');
    const meta = {
      name: '',
      phone: '',
      email: '',
      organization: ''
    };

    lines.forEach((line) => {
      if (line.startsWith('N:')) meta.name = line.substring(2).trim();
      if (line.startsWith('TEL:')) meta.phone = line.substring(4).trim();
      if (line.startsWith('EMAIL:')) meta.email = line.substring(6).trim();
      if (line.startsWith('ORG:')) meta.organization = line.substring(4).trim();
    });

    return { type: 'vcard', meta };
  }

  // BTC
  if (content.toLowerCase().startsWith('bitcoin:')) {
    return { type: 'crypto', meta: { symbol: 'BTC', address: content.substring(8) } };
  }

  // ETH
  if (content.toLowerCase().startsWith('ethereum:')) {
    return { type: 'crypto', meta: { symbol: 'ETH', address: content.substring(9) } };
  }

  // BTC raw
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  if (btcRegex.test(content)) {
    return { type: 'crypto', meta: { symbol: 'BTC', address: content } };
  }

  // ETH raw
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  if (ethRegex.test(content)) {
    return { type: 'crypto', meta: { symbol: 'ETH', address: content } };
  }

  // Default text
  return { type: 'text', meta: { text: content } };
};
