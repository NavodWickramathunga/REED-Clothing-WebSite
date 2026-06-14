import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

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
  message += `📎 *ACTION REQUIRED:* Please reply to this message with a *screenshot or photo of your bank transfer receipt* so we can verify your payment and confirm your order. Thank you! 🙏`;
  
  return encodeURIComponent(message);
}

export function isLightColor(hex: string): boolean {
  if (!hex) return true;
  const color = hex.startsWith('#') ? hex.slice(1) : hex;
  
  const lower = hex.toLowerCase().trim();
  if (lower === 'white' || lower === 'lightgray' || lower === 'grey' || lower === 'gray' || lower === '#fff') return true;
  if (lower === 'black' || lower === 'navy' || lower === '#000' || lower === 'darkblue') return false;

  if (color.length === 3) {
    const r = parseInt(color[0] + color[0], 16);
    const g = parseInt(color[1] + color[1], 16);
    const b = parseInt(color[2] + color[2], 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 185;
  } else if (color.length === 6) {
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 185;
  }
  return true;
}

export function compressImage(base64Str: string, maxWidth = 600, maxHeight = 600): Promise<string> {
  if (typeof base64Str !== 'string' || !base64Str.startsWith('data:')) {
    return Promise.resolve(base64Str);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
}

export async function uploadImageToStorage(file: File): Promise<string> {
  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `product-images/${filename}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Converts a base64 data URI to a file and uploads it to Firebase Storage.
 * Returns the permanent cloud download URL.
 * Used to rescue images that are still in base64 format before Firestore saves.
 */
export async function uploadBase64ToStorage(base64DataUri: string, hint = 'image'): Promise<string> {
  // Convert base64 data URI to Blob
  const response = await fetch(base64DataUri);
  const blob = await response.blob();

  // Determine file extension from mime type
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${Date.now()}_${hint.replace(/[^a-zA-Z0-9._-]/g, '_')}.${ext}`;

  const storageRef = ref(storage, `product-images/${filename}`);
  const snapshot = await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

