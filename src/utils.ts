export function formatCurrency(amount: number, currency: 'USD' | 'LKR'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  } else {
    return 'LKR ' + new Intl.NumberFormat('en-LK').format(amount);
  }
}

export function generateWhatsAppMessage(
  orderId: string,
  customer: { name: string; phone: string; email: string; address: string; city: string },
  items: { productName: string; color: string; size: string; quantity: number; price: string }[],
  totalPrice: string,
  paymentMethod: string,
  paymentRef?: string,
  notes?: string
): string {
  const line = '━'.repeat(20);
  let message = `🔴 *NEW REED ORDER* - #${orderId}\n`;
  message += `${line}\n\n`;
  
  message += `👤 *Customer Details:*\n`;
  message += `  • Name: ${customer.name}\n`;
  message += `  • Phone: ${customer.phone}\n`;
  message += `  • Email: ${customer.email}\n`;
  message += `  • Address: ${customer.address}, ${customer.city}\n\n`;
  
  message += `🛒 *Ordered Items:*\n`;
  items.forEach((item, index) => {
    message += `  ${index + 1}. *${item.productName}*\n`;
    message += `     Color: ${item.color} | Size: ${item.size}\n`;
    message += `     Qty: ${item.quantity} × ${item.price}\n`;
  });
  message += `\n`;
  
  message += `💵 *Total Bill:* ${totalPrice}\n`;
  message += `💳 *Payment Method:* ${paymentMethod}\n`;
  if (paymentRef) {
    message += `🧾 *Transaction Ref:* ${paymentRef}\n`;
  }
  
  if (notes && notes.trim() !== '') {
    message += `📝 *Special Delivery Instructions:* ${notes}\n`;
  }
  
  message += `\n${line}\n`;
  message += `Please confirm my order and share the dispatch timeline! Thank you.`;
  
  return encodeURIComponent(message);
}
