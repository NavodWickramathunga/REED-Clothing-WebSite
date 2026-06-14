export type StockStatus = 'In Stock' | 'Few Left' | 'Out of Stock';

export interface ProductReview {
  id: string;
  rating: number; // 1 to 5
  comment: string;
  author: string;
  timestamp: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  priceUSD: number;
  priceLKR: number;
  description: string;
  colors: {
    name: string;
    value: string; // hex or color indicator
    imageUrl: string;
  }[];
  sizes: string[]; // e.g., ['S', 'M', 'L', 'XL', 'XXL']
  status: StockStatus;
  category: string; // e.g., 'Essentials', 'Signature', 'Limited'
  material: string; // e.g., '100% Organic Cotton, 240 GSM Heavyweight'
  features: string[];
  hoverImageUrl?: string;
  gender?: 'men' | 'women' | 'unisex';
  stock?: number;
  images?: string[];
  reviews?: ProductReview[];
  featured?: boolean;
  isOnSale?: boolean;
  createdAt?: string;
}

export interface CartItem {
  id: string; // combined product_id + color + size
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface OrderDetails {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  paymentMethod: 'Card' | 'BankTransfer' | 'COD';
  paymentReference?: string;
  paymentStatus: 'Pending' | 'Paid';
  fulfillmentStatus?: 'Pending' | 'Processing' | 'Shipped';
  items: {
    productId: string;
    productName: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  totalUSD: number;
  totalLKR: number;
  orderId: string;
  timestamp: string;
}
