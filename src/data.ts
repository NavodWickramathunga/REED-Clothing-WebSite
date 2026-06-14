import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'reed-navy-crewneck',
    sku: 'RED-CN-NV-01',
    name: 'REED Signature Heavyweight Crewneck - Admiral Navy',
    priceUSD: 18.00,
    priceLKR: 5400,
    description: 'Our signature heavy-knit crewneck t-shirt featuring bespoke tone-on-tone centered "ReeD" embroidery. Designed for an elegant boxy fit, crafted with pre-shrunk premium combed cotton.',
    colors: [
      {
        name: 'Admiral Navy',
        value: '#1A2942',
        imageUrl: '/input_file_1.png'
      }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    status: 'In Stock',
    category: 'Signature',
    material: '100% Premium Combed Cotton, 240 GSM Heavyweight Double Knit',
    features: [
      'Bespoke embroidered logo with double-backing reinforcement',
      'Ultra-dense rib-knit collar that retains shape after washing',
      'Dropped shoulder seams for an optimized drape and premium silhouette',
      'Pre-shrunk fabric preserving precise measurements'
    ],
    hoverImageUrl: '/input_file_2.png',
    gender: 'men',
    stock: 18,
    createdAt: '2026-05-15T00:00:00Z',
    featured: true,
    reviews: [
      { id: 'rev-1', rating: 5, comment: 'Hands down the best fitting crewneck I have ever bought. Extreme fabric density.', author: 'Dilshan M.', timestamp: '2026-05-15T12:00:00Z' },
      { id: 'rev-2', rating: 4, comment: 'Very boxy and premium draping. Slightly snug around the neck, but holds shape perfectly.', author: 'Kasun P.', timestamp: '2026-05-18T15:20:00Z' }
    ]
  },
  {
    id: 'reed-black-crewneck',
    sku: 'RED-CN-BK-02',
    name: 'REED Signature Heavyweight Crewneck - Onyx Black',
    priceUSD: 18.00,
    priceLKR: 5400,
    description: 'An essential luxury staple. Featuring a luxurious deep black wash with low-profile centered embroidery. The ultimate streetwear or minimalist piece.',
    colors: [
      {
        name: 'Onyx Black',
        value: '#121212',
        imageUrl: '/input_file_0.png'
      }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    status: 'Few Left',
    category: 'Signature',
    material: '100% Premium Combed Cotton, 240 GSM Heavyweight Double Knit',
    features: [
      'Matte black high-density embroidery thread',
      'Signature thick collar detailing',
      'Relaxed architectural fit',
      'Reinforced twin-needle stitching on cuffs and hem'
    ],
    hoverImageUrl: '/input_file_0.png',
    gender: 'men',
    stock: 3,
    createdAt: '2026-05-16T00:00:00Z',
    featured: true,
    reviews: [
      { id: 'rev-3', rating: 5, comment: 'Absolute perfection. A true heavyweight t-shirt. Buying in green too.', author: 'Senura K.', timestamp: '2026-05-20T08:12:00Z' }
    ]
  },
  {
    id: 'reed-green-crewneck',
    sku: 'RED-CN-GR-03',
    name: 'REED Signature Heavyweight Crewneck - Forest Green',
    priceUSD: 18.00,
    priceLKR: 5400,
    description: 'A deep, organic jewel tone green with complementary embroidered details. Adds a refined, confident color statement to your minimalist rotation.',
    colors: [
      {
        name: 'Forest Green',
        value: '#1B3B2B',
        imageUrl: '/input_file_3.png'
      }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    status: 'In Stock',
    category: 'Signature',
    material: '100% Premium Combed Cotton, 240 GSM Heavyweight Double Knit',
    features: [
      'Rich organic plant-derived dye process',
      'Satin embroidery detailing',
      'Breathable, premium warmth-insulating weave'
    ],
    hoverImageUrl: '/input_file_3.png',
    gender: 'men',
    stock: 22,
    createdAt: '2026-05-17T00:00:00Z',
    featured: true,
    reviews: []
  },
  {
    id: 'reed-white-crewneck',
    sku: 'RED-CN-WH-04',
    name: 'REED Signature Heavyweight Crewneck - Arctic White',
    priceUSD: 18.00,
    priceLKR: 5400,
    description: 'Pure, crisp white heavy t-shirt with signature high-density chest branding. Opaque structure that holds its clean, boxy silhouette flawlessly.',
    colors: [
      {
        name: 'Arctic White',
        value: '#F5F5F7',
        imageUrl: '/input_file_4.png'
      }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    status: 'In Stock',
    category: 'Essentials',
    material: '100% Premium Combed Cotton, 240 GSM Heavyweight Double Knit',
    features: [
      'Crisp high-opaque optical white shade',
      'Contrast-optimized chest embroidery',
      'Ribbed seamless hem structure'
    ],
    hoverImageUrl: '/input_file_4.png',
    gender: 'men',
    createdAt: '2026-05-18T00:00:00Z',
    featured: true,
  },
  {
    id: 'reed-women-sculpt-leggings',
    sku: 'RED-LG-BK-05',
    name: 'REED Contour Sculpt High-Waist Leggings',
    priceUSD: 24.00,
    priceLKR: 7200,
    description: 'Envisioned for pure physical performance. Designed with a buttery soft, high-performance compressed nylon blend that fits like a second skin. Completely squat-proof with an upper waist compression band.',
    colors: [
      {
        name: 'Slate Black',
        value: '#1A1A1A',
        imageUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800&auto=format&fit=crop&q=80'
      }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    status: 'In Stock',
    category: 'Signature',
    material: '78% Compressed Nylon, 22% Breathable Spandex Elite Weave',
    features: [
      'Elastic anti-roll high waistband structure',
      'Reinforced interlock flatlock seam tailoring',
      'Contouring side structural line detailing',
      'Hidden key/card pocket built secure into the back band'
    ],
    hoverImageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    gender: 'women',
    createdAt: '2026-05-19T00:00:00Z',
    featured: false,
  },
  {
    id: 'reed-women-cross-bra',
    sku: 'RED-BR-WH-06',
    name: 'REED Apex Cross-Back Sports Bra',
    priceUSD: 16.00,
    priceLKR: 4800,
    description: 'Designed to offer medium-to-high support during intensive workouts. Featuring an elegant cross-back micro strap geometry with moisture-wicking technology.',
    colors: [
      {
        name: 'Cloud White',
        value: '#ECECEC',
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80'
      }
    ],
    sizes: ['S', 'M', 'L'],
    status: 'Few Left',
    category: 'Limited',
    material: '80% Regenerated Polyester, 20% Flexible Elastane fiber',
    features: [
      'Removable structural contour padding cups',
      'Dual multi-strap configuration back geometry',
      'Wide supportive brushed underband for stay-put fit',
      'High ventilation sweat-wicking knit structure'
    ],
    hoverImageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&auto=format&fit=crop&q=80',
    gender: 'women',
    createdAt: '2026-05-20T00:00:00Z',
    featured: false,
  },
  {
    id: 'reed-women-crop-top',
    sku: 'RED-CT-AM-07',
    name: 'REED Ribbed Seamless crop top - Rust Amber',
    priceUSD: 14.00,
    priceLKR: 4200,
    description: 'A cropped silhouette cut from a luxurious ribbed seamless knit. Perfect for styling both inside the gym and outer street casuals. Soft-to-touch with dynamic four-way stretch capability.',
    colors: [
      {
        name: 'Rust Amber',
        value: '#A05A3C',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80'
      }
    ],
    sizes: ['XS', 'S', 'M'],
    status: 'In Stock',
    category: 'Essentials',
    material: '92% Nylon Seamless Microfiber, 8% Extra Stretch Spandex',
    features: [
      'Engineered seamless ribbing with beautiful visual contouring',
      'High crewneck collar with elegant minimalist sleeves',
      'Stitch-free friction-free fitment'
    ],
    hoverImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    gender: 'women',
    createdAt: '2026-05-21T00:00:00Z',
    featured: false,
  },
  {
    id: 'reed-mens-training-hoodie',
    sku: 'RED-HD-GR-08',
    name: 'REED Pro-Series Training Hoodie - Slate Gray',
    priceUSD: 24.00,
    priceLKR: 7200,
    description: 'An athletic heavy-cotton training hoodie built for movement. Designed with raglan sleeves and dynamic side panel stretch panels, maintaining perfect comfort and temperature regulation.',
    colors: [
      {
        name: 'Slate Gray',
        value: '#5C5D64',
        imageUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    status: 'In Stock',
    category: 'Signature',
    material: '80% Heavy Terry Cotton, 20% Breathable Tech Fleece',
    features: [
      'Signature deep hood with flat braided drawstrings',
      'Side zippered media pocket with inner route for headphones',
      'Cuffed athletic wrists and shape-memory hem ribbing'
    ],
    hoverImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
    gender: 'men',
    createdAt: '2026-05-22T00:00:00Z',
    featured: false,
  }
];

export const VIVA_WHATSAPP_NUMBER = '+94710761266'; // Default number - editable in Admin panel
