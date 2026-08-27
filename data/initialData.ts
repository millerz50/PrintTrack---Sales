import { InventoryItem, User, SaleReceipt, DailyExpense, StockMovement, PrintingCategory, ChatMessage } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Sarah (Admin)',
    role: 'admin',
    pin: '1234',
    avatar: '👑'
  },
  {
    id: 'usr_teller1',
    name: 'David (Teller / Front Desk)',
    role: 'teller',
    pin: '0000',
    avatar: '🧑‍💼'
  },
  {
    id: 'usr_teller2',
    name: 'Grace (Workshop Operator)',
    role: 'teller',
    pin: '1111',
    avatar: '👩‍🎨'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_1',
    sku: 'TSH-WHT-100',
    name: 'Premium Cotton T-Shirt (White, L/XL)',
    category: 'T-Shirt Printing',
    unit: 'pieces',
    currentStock: 48,
    minThreshold: 20,
    unitCost: 3.20,
    sellingPrice: 12.00,
    location: 'Aisle A - Shelf 2',
    lastRestocked: '2026-08-20',
    depletionRatePerDay: 8.5
  },
  {
    id: 'inv_2',
    sku: 'TSH-BLK-100',
    name: 'Heavy Cotton T-Shirt (Black, M/L)',
    category: 'T-Shirt Printing',
    unit: 'pieces',
    currentStock: 14,
    minThreshold: 25,
    unitCost: 3.50,
    sellingPrice: 14.00,
    location: 'Aisle A - Shelf 1',
    lastRestocked: '2026-08-18',
    depletionRatePerDay: 9.2
  },
  {
    id: 'inv_3',
    sku: 'DTF-FLM-60',
    name: 'DTF Transfer Film Roll (60cm x 100m)',
    category: 'T-Shirt Printing',
    unit: 'rolls',
    currentStock: 3,
    minThreshold: 2,
    unitCost: 45.00,
    sellingPrice: 85.00,
    location: 'Print Room Cabinet',
    lastRestocked: '2026-08-10',
    depletionRatePerDay: 0.4
  },
  {
    id: 'inv_4',
    sku: 'PPR-A4-80G',
    name: 'A4 Copier & Printing Paper (80gsm Ream 500 sheets)',
    category: 'Paper Printing',
    unit: 'reams',
    currentStock: 82,
    minThreshold: 30,
    unitCost: 4.10,
    sellingPrice: 7.50,
    location: 'Paper Storage Bin 1',
    lastRestocked: '2026-08-22',
    depletionRatePerDay: 12.0
  },
  {
    id: 'inv_5',
    sku: 'PPR-A3-120G',
    name: 'A3 Premium Art Paper (120gsm Pack 250s)',
    category: 'Paper Printing',
    unit: 'packs',
    currentStock: 18,
    minThreshold: 10,
    unitCost: 8.80,
    sellingPrice: 16.00,
    location: 'Paper Storage Bin 2',
    lastRestocked: '2026-08-15',
    depletionRatePerDay: 2.1
  },
  {
    id: 'inv_6',
    sku: 'PPR-GLS-230',
    name: 'A4 High Glossy Photo Paper (230gsm)',
    category: 'Paper Printing',
    unit: 'packs',
    currentStock: 6,
    minThreshold: 12,
    unitCost: 6.50,
    sellingPrice: 13.50,
    location: 'Shelf C - Photo Studio',
    lastRestocked: '2026-08-05',
    depletionRatePerDay: 1.8
  },
  {
    id: 'inv_7',
    sku: 'BOK-SPRL-14',
    name: 'Spiral Wire Binding Coils (14mm / 100pk)',
    category: 'Book Printing',
    unit: 'packs',
    currentStock: 9,
    minThreshold: 5,
    unitCost: 11.00,
    sellingPrice: 22.00,
    location: 'Binding Station Rack',
    lastRestocked: '2026-08-12',
    depletionRatePerDay: 1.1
  },
  {
    id: 'inv_8',
    sku: 'BOK-HDC-A4',
    name: 'Hardcover Leatherette Book Casings (A4)',
    category: 'Book Printing',
    unit: 'pieces',
    currentStock: 24,
    minThreshold: 15,
    unitCost: 5.50,
    sellingPrice: 18.00,
    location: 'Binding Station Rack',
    lastRestocked: '2026-08-14',
    depletionRatePerDay: 3.4
  },
  {
    id: 'inv_9',
    sku: 'BAN-VIN-500',
    name: 'Heavy Duty PVC Flex Banner Roll (500gsm, 3.2m)',
    category: 'Banners & Signage',
    unit: 'rolls',
    currentStock: 2,
    minThreshold: 3,
    unitCost: 78.00,
    sellingPrice: 140.00,
    location: 'Large Format Bay',
    lastRestocked: '2026-08-02',
    depletionRatePerDay: 0.3
  },
  {
    id: 'inv_10',
    sku: 'MRG-MUG-WHT',
    name: 'Sublimation Ceramic Mugs 11oz (Box of 36)',
    category: 'Merchandise & Branding',
    unit: 'boxes',
    currentStock: 7,
    minThreshold: 4,
    unitCost: 28.00,
    sellingPrice: 55.00,
    location: 'Heat Press Corner',
    lastRestocked: '2026-08-19',
    depletionRatePerDay: 0.9
  },
  {
    id: 'inv_11',
    sku: 'LAM-POU-A4',
    name: 'Thermal Lamination Pouches (A4 150mic / 100pk)',
    category: 'Photocopy & Lamination',
    unit: 'packs',
    currentStock: 15,
    minThreshold: 8,
    unitCost: 7.20,
    sellingPrice: 15.00,
    location: 'Front Desk Counter',
    lastRestocked: '2026-08-21',
    depletionRatePerDay: 1.5
  },
  {
    id: 'inv_12',
    sku: 'INK-ECO-4CLR',
    name: 'Eco-Solvent Inks Set (CMYK 1L Bottles)',
    category: 'Other Services',
    unit: 'sets',
    currentStock: 4,
    minThreshold: 2,
    unitCost: 65.00,
    sellingPrice: 110.00,
    location: 'Chemical Storage Locker',
    lastRestocked: '2026-08-16',
    depletionRatePerDay: 0.2
  }
];

export const SERVICE_PRESETS: {
  title: string;
  category: PrintingCategory;
  defaultPrice: number;
  unit: string;
  inventoryItemId?: string;
}[] = [
  {
    title: 'Custom White T-Shirt Print (DTF Single Side)',
    category: 'T-Shirt Printing',
    defaultPrice: 14.50,
    unit: 'piece',
    inventoryItemId: 'inv_1'
  },
  {
    title: 'Black T-Shirt Full Front + Back Branding',
    category: 'T-Shirt Printing',
    defaultPrice: 19.00,
    unit: 'piece',
    inventoryItemId: 'inv_2'
  },
  {
    title: 'A4 Color Flyers (Double-Sided 130gsm)',
    category: 'Paper Printing',
    defaultPrice: 0.45,
    unit: 'sheet',
    inventoryItemId: 'inv_4'
  },
  {
    title: 'Business Cards (350gsm Matte Lam / 100pcs)',
    category: 'Paper Printing',
    defaultPrice: 22.00,
    unit: 'box',
    inventoryItemId: 'inv_5'
  },
  {
    title: 'Spiral Bound Project Report (50-100 pages)',
    category: 'Book Printing',
    defaultPrice: 12.50,
    unit: 'book',
    inventoryItemId: 'inv_7'
  },
  {
    title: 'Hardcover Thesis / Annual Report Binding',
    category: 'Book Printing',
    defaultPrice: 28.00,
    unit: 'book',
    inventoryItemId: 'inv_8'
  },
  {
    title: 'Roll-up Banner Stand (85cm x 200cm + Print)',
    category: 'Banners & Signage',
    defaultPrice: 65.00,
    unit: 'stand',
    inventoryItemId: 'inv_9'
  },
  {
    title: 'Branded Ceramic Coffee Mug (Sublimated)',
    category: 'Merchandise & Branding',
    defaultPrice: 7.50,
    unit: 'mug',
    inventoryItemId: 'inv_10'
  },
  {
    title: 'A4 Glossy Document Lamination',
    category: 'Photocopy & Lamination',
    defaultPrice: 1.50,
    unit: 'sheet',
    inventoryItemId: 'inv_11'
  },
  {
    title: 'High-Volume B&W Document Photocopying',
    category: 'Photocopy & Lamination',
    defaultPrice: 0.08,
    unit: 'page',
    inventoryItemId: 'inv_4'
  }
];

// Helper to get today's date formatted as YYYY-MM-DD
export const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const INITIAL_SALES: SaleReceipt[] = [
  {
    id: 'rec_1001',
    receiptNumber: 'RCP-2026-0826-001',
    date: '2026-08-26T09:15',
    customerName: 'Acme Media Agency',
    customerPhone: '+1 555-0192',
    items: [
      {
        id: 'item_1',
        inventoryItemId: 'inv_1',
        description: 'Custom White T-Shirt Print (DTF)',
        category: 'T-Shirt Printing',
        quantity: 20,
        unitPrice: 14.00,
        totalPrice: 280.00,
        stockDeductionQty: 20
      },
      {
        id: 'item_2',
        inventoryItemId: 'inv_9',
        description: 'Roll-up Banner Stand (85x200cm)',
        category: 'Banners & Signage',
        quantity: 1,
        unitPrice: 65.00,
        totalPrice: 65.00,
        stockDeductionQty: 1
      }
    ],
    subtotal: 345.00,
    discount: 15.00,
    tax: 0,
    totalAmount: 330.00,
    paymentMethod: 'Mobile Money (M-Pesa)',
    tellerId: 'usr_teller1',
    tellerName: 'David (Teller)',
    notes: 'Rush order delivered for morning conference',
    synced: true,
    createdAt: '2026-08-26T09:15:22.000Z'
  },
  {
    id: 'rec_1002',
    receiptNumber: 'RCP-2026-0826-002',
    date: '2026-08-26T10:40',
    customerName: 'St. Jude High School',
    customerPhone: '+1 555-0348',
    items: [
      {
        id: 'item_3',
        inventoryItemId: 'inv_7',
        description: 'Spiral Bound Exam Booklets (50pgs)',
        category: 'Book Printing',
        quantity: 45,
        unitPrice: 6.50,
        totalPrice: 292.50,
        stockDeductionQty: 45
      }
    ],
    subtotal: 292.50,
    discount: 0,
    tax: 0,
    totalAmount: 292.50,
    paymentMethod: 'Bank Transfer',
    tellerId: 'usr_teller1',
    tellerName: 'David (Teller)',
    notes: 'Official academic prints',
    synced: true,
    createdAt: '2026-08-26T10:40:15.000Z'
  },
  {
    id: 'rec_1003',
    receiptNumber: 'RCP-2026-0826-003',
    date: '2026-08-26T11:20',
    customerName: 'Apex Law Chambers',
    customerPhone: '+1 555-8921',
    items: [
      {
        id: 'item_4',
        inventoryItemId: 'inv_8',
        description: 'Hardcover Gold-Foil Legal Binding',
        category: 'Book Printing',
        quantity: 4,
        unitPrice: 28.00,
        totalPrice: 112.00,
        stockDeductionQty: 4
      },
      {
        id: 'item_5',
        inventoryItemId: 'inv_5',
        description: 'Executive Business Cards (200 cards)',
        category: 'Paper Printing',
        quantity: 2,
        unitPrice: 22.00,
        totalPrice: 44.00,
        stockDeductionQty: 2
      }
    ],
    subtotal: 156.00,
    discount: 6.00,
    tax: 0,
    totalAmount: 150.00,
    paymentMethod: 'Card',
    tellerId: 'usr_teller2',
    tellerName: 'Grace (Workshop)',
    synced: true,
    createdAt: '2026-08-26T11:20:00.000Z'
  },
  {
    id: 'rec_1004',
    receiptNumber: 'RCP-2026-0826-004',
    date: '2026-08-26T13:05',
    customerName: 'Cafe Mocha Lounge',
    customerPhone: '+1 555-4490',
    items: [
      {
        id: 'item_6',
        inventoryItemId: 'inv_10',
        description: 'Branded Sublimation Coffee Mugs',
        category: 'Merchandise & Branding',
        quantity: 12,
        unitPrice: 7.50,
        totalPrice: 90.00,
        stockDeductionQty: 1
      },
      {
        id: 'item_7',
        inventoryItemId: 'inv_4',
        description: 'A4 Laminated Food Menus (Full Color)',
        category: 'Paper Printing',
        quantity: 15,
        unitPrice: 2.20,
        totalPrice: 33.00,
        stockDeductionQty: 15
      }
    ],
    subtotal: 123.00,
    discount: 3.00,
    tax: 0,
    totalAmount: 120.00,
    paymentMethod: 'Cash',
    tellerId: 'usr_teller1',
    tellerName: 'David (Teller)',
    synced: true,
    createdAt: '2026-08-26T13:05:00.000Z'
  },
  {
    id: 'rec_1005',
    receiptNumber: 'RCP-2026-0826-005',
    date: '2026-08-26T14:30',
    customerName: 'Walk-in Client',
    items: [
      {
        id: 'item_8',
        inventoryItemId: 'inv_2',
        description: 'Black Heavyweight T-Shirt Single Print',
        category: 'T-Shirt Printing',
        quantity: 2,
        unitPrice: 16.00,
        totalPrice: 32.00,
        stockDeductionQty: 2
      },
      {
        id: 'item_9',
        inventoryItemId: 'inv_11',
        description: 'Certificate Lamination (Gloss)',
        category: 'Photocopy & Lamination',
        quantity: 5,
        unitPrice: 1.50,
        totalPrice: 7.50,
        stockDeductionQty: 5
      }
    ],
    subtotal: 39.50,
    discount: 0,
    tax: 0,
    totalAmount: 39.50,
    paymentMethod: 'Cash',
    tellerId: 'usr_teller1',
    tellerName: 'David (Teller)',
    synced: true,
    createdAt: '2026-08-26T14:30:00.000Z'
  }
];

export const INITIAL_EXPENSES: DailyExpense[] = [
  {
    id: 'exp_201',
    date: '2026-08-26',
    category: 'Inks & Toners',
    description: 'Refill Cyan & Black Eco-Solvent Ink Bottling',
    amount: 54.00,
    paymentMethod: 'Mobile Money',
    recordedBy: 'Sarah (Admin)',
    tellerRole: 'admin',
    receiptRef: 'SUP-INK-889',
    createdAt: '2026-08-26T08:30:00.000Z',
    synced: true
  },
  {
    id: 'exp_202',
    date: '2026-08-26',
    category: 'Electricity & Utilities',
    description: 'Heat-press generator daily diesel top-up & power token',
    amount: 22.50,
    paymentMethod: 'Cash',
    recordedBy: 'David (Teller)',
    tellerRole: 'teller',
    receiptRef: 'FUEL-092',
    createdAt: '2026-08-26T09:00:00.000Z',
    synced: true
  },
  {
    id: 'exp_203',
    date: '2026-08-26',
    category: 'Logistics & Transport',
    description: 'Courier dispatch for paper supplies from warehouse',
    amount: 14.00,
    paymentMethod: 'Cash',
    recordedBy: 'David (Teller)',
    tellerRole: 'teller',
    receiptRef: 'RIDER-44',
    createdAt: '2026-08-26T11:50:00.000Z',
    synced: true
  },
  {
    id: 'exp_204',
    date: '2026-08-26',
    category: 'Machine Maintenance',
    description: 'Roland cutter blade replacement and calibration lubricant',
    amount: 18.00,
    paymentMethod: 'Card',
    recordedBy: 'Grace (Workshop)',
    tellerRole: 'teller',
    receiptRef: 'SRV-8812',
    createdAt: '2026-08-26T12:15:00.000Z',
    synced: true
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov_1',
    inventoryItemId: 'inv_1',
    itemName: 'Premium Cotton T-Shirt (White, L/XL)',
    type: 'restock',
    quantity: 50,
    date: '2026-08-20T10:00',
    notes: 'Batch intake from Prime Textiles Ltd',
    performedBy: 'Sarah (Admin)'
  },
  {
    id: 'mov_2',
    inventoryItemId: 'inv_1',
    itemName: 'Premium Cotton T-Shirt (White, L/XL)',
    type: 'sale_deduction',
    quantity: -20,
    date: '2026-08-26T09:15',
    notes: 'Order RCP-2026-0826-001 (Acme Media)',
    performedBy: 'David (Teller)'
  },
  {
    id: 'mov_3',
    inventoryItemId: 'inv_2',
    itemName: 'Heavy Cotton T-Shirt (Black, M/L)',
    type: 'waste_damage',
    quantity: -1,
    date: '2026-08-25T16:00',
    notes: 'Heat press misalignment burn test',
    performedBy: 'Grace (Workshop)'
  }
];

export const INITIAL_CHATS: ChatMessage[] = [
  // Team Workshop Channel
  {
    id: 'msg_1',
    channel: 'team_workshop',
    senderId: 'usr_admin',
    senderName: 'Sarah (Admin)',
    senderRole: 'admin',
    senderAvatar: '👑',
    text: 'Good morning team! We have a rush order for Acme Media: 20 DTF White T-Shirts and 1 Roll-up banner stand. Please prioritize the heat press.',
    timestamp: '2026-08-26T08:45:00.000Z',
    isUrgent: true,
    orderRef: 'RCP-2026-0826-001'
  },
  {
    id: 'msg_2',
    channel: 'team_workshop',
    senderId: 'usr_teller1',
    senderName: 'David (Front Desk)',
    senderRole: 'teller',
    senderAvatar: '🧑‍💼',
    text: 'Received! Customer has paid in full via M-Pesa ($330.00). Film roll is loaded on the Mutoh printer now.',
    timestamp: '2026-08-26T09:16:00.000Z',
    orderRef: 'RCP-2026-0826-001'
  },
  {
    id: 'msg_3',
    channel: 'team_workshop',
    senderId: 'usr_teller2',
    senderName: 'Grace (Workshop)',
    senderRole: 'teller',
    senderAvatar: '👩‍🎨',
    text: 'Banner stand assembled and tested. T-shirts are cured and packed into boxes ready for pickup! Notice: Heavy Cotton Black T-shirts are down to 14 pcs.',
    timestamp: '2026-08-26T10:15:00.000Z',
    stockAlert: {
      itemName: 'Heavy Cotton T-Shirt (Black, M/L)',
      currentStock: 14,
      unit: 'pieces'
    }
  },
  {
    id: 'msg_4',
    channel: 'team_workshop',
    senderId: 'usr_admin',
    senderName: 'Sarah (Admin)',
    senderRole: 'admin',
    senderAvatar: '👑',
    text: 'Awesome work Grace! I placed a supplier restock inquiry for 50 black tees and 2 packs of high gloss photo paper.',
    timestamp: '2026-08-26T10:30:00.000Z'
  },

  // AI Print & Inventory Advisor Channel
  {
    id: 'msg_ai_1',
    channel: 'ai_advisor',
    senderId: 'ai_copilot',
    senderName: 'PrintTrack AI Advisor',
    senderRole: 'ai',
    senderAvatar: '🤖',
    text: 'Hello Sarah! I am your real-time Print Shop Business & Stock Copilot. I analyze live sales receipts, monitor stock depletion rates, compute profit margins, and calculate custom job quotes. How can I assist you today?',
    timestamp: '2026-08-26T08:00:00.000Z'
  },
  {
    id: 'msg_ai_2',
    channel: 'ai_advisor',
    senderId: 'usr_admin',
    senderName: 'Sarah (Admin)',
    senderRole: 'admin',
    senderAvatar: '👑',
    text: 'What items are at critical stock level today, and what is our daily burn rate?',
    timestamp: '2026-08-26T08:15:00.000Z'
  },
  {
    id: 'msg_ai_3',
    channel: 'ai_advisor',
    senderId: 'ai_copilot',
    senderName: 'PrintTrack AI Advisor',
    senderRole: 'ai',
    senderAvatar: '🤖',
    text: '📊 **Stock Depletion Analysis (Live):**\n\n1. **A4 Glossy Photo Paper (230gsm)**: 6 packs left (Threshold: 12). Depletion rate is **1.8 packs/day** — estimated runout in **3 days**.\n2. **Heavy Cotton Black T-Shirts (M/L)**: 14 pcs left (Threshold: 25). Depletion rate is **9.2 pcs/day** — estimated runout in **1.5 days**.\n3. **PVC Flex Banner Roll (500gsm)**: 2 rolls left (Threshold: 3). Depletion rate is **0.3 rolls/day** — estimated runout in **6 days**.\n\n💡 *Recommendation:* Reorder 50 Black T-shirts and 10 packs of Glossy photo paper today to avoid production downtime.',
    timestamp: '2026-08-26T08:15:15.000Z'
  }
];
