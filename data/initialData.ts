import { InventoryItem, User, SaleReceipt, DailyExpense, StockMovement, PrintingCategory, ChatMessage, ServiceItem, Quotation } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Sarah (Admin)',
    role: 'admin',
    pin: '1234',
    avatar: '👑'
  },
  {
    id: 'usr_manager',
    name: 'Michael (Operations Manager)',
    role: 'manager',
    pin: '2222',
    avatar: '💼'
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

export const INITIAL_SERVICES: ServiceItem[] = [
  { id: 'svc_001', code: 'SVC-001', name: 'T-Shirt Printing (General)', category: 'T-Shirt Printing', unit: 'shirt', price: 3, active: true },
  { id: 'svc_002', code: 'SVC-002', name: 'Paper Printing - Black & White', category: 'Paper Printing', unit: 'page', price: 0.20, active: true },
  { id: 'svc_003', code: 'SVC-003', name: 'Paper Printing - Colour', category: 'Paper Printing', unit: 'page', price: 0.25, active: true },
  { id: 'svc_004', code: 'SVC-004', name: 'Bulk Printing (30 copies / 200+ pages)', category: 'Paper Printing', unit: '30 copies', price: 1, active: true },
  { id: 'svc_005', code: 'SVC-005', name: 'Modules - BET / Commerce', category: 'Book Printing', unit: 'module', price: 10, active: true },
  { id: 'svc_006', code: 'SVC-006', name: 'Modules - History / FRS / Science', category: 'Book Printing', unit: 'module', price: 6, active: true },
  { id: 'svc_007', code: 'SVC-007', name: 'Schemes of Work', category: 'Book Printing', unit: 'set', price: 6, active: true },
  { id: 'svc_008', code: 'SVC-008', name: 'Spiral Binding', category: 'Book Printing', unit: 'book', price: 2, active: true },
  { id: 'svc_009', code: 'SVC-009', name: 'A4 Photo Printing - Without Frame', category: 'Photocopy & Lamination', unit: 'photo', price: 2, active: true },
  { id: 'svc_010', code: 'SVC-010', name: 'A4 Photo Printing - With Picture Frame', category: 'Photocopy & Lamination', unit: 'photo', price: 5, active: true },
  { id: 'svc_011', code: 'SVC-011', name: 'Shona Novels / Set Books - O Level', category: 'Other Services', unit: 'book', price: 5, active: true },
  { id: 'svc_012', code: 'SVC-012', name: 'Shona Novels / Set Books - A Level (Option 1)', category: 'Other Services', unit: 'book', price: 6, active: true },
  { id: 'svc_013', code: 'SVC-013', name: 'Shona Novels / Set Books - A Level (Option 2)', category: 'Other Services', unit: 'book', price: 7, active: true },
  { id: 'svc_014', code: 'SVC-014', name: 'Typing', category: 'Other Services', unit: 'page', price: 1, active: true },
  { id: 'svc_015', code: 'SVC-015', name: 'Academic Reports - Primary', category: 'Other Services', unit: 'report', price: 3, active: true },
  { id: 'svc_016', code: 'SVC-016', name: 'Academic Reports - Secondary', category: 'Other Services', unit: 'report', price: 3, active: true },
  { id: 'svc_017', code: 'SVC-017', name: 'Thesis Printing - Black & White', category: 'Book Printing', unit: '100 pages', price: 16, active: true },
  { id: 'svc_018', code: 'SVC-018', name: 'Thesis Printing - Colour', category: 'Book Printing', unit: '100 pages', price: 18, active: true },
  { id: 'svc_019', code: 'SVC-019', name: 'School ID', category: 'Other Services', unit: 'card', price: 3, active: true },
  { id: 'svc_020', code: 'SVC-020', name: 'Report Book', category: 'Other Services', unit: 'book', price: 0, active: false, notes: 'Price is not clearly visible on the handwritten list; activate after admin enters the confirmed price.' },
  { id: 'svc_021', code: 'SVC-021', name: 'Passport Size Photos', category: 'Photocopy & Lamination', unit: 'set', price: 2, active: true },
  { id: 'svc_022', code: 'SVC-022', name: 'Business Cards', category: 'Paper Printing', unit: '100 cards', price: 7, active: true },
  { id: 'svc_023', code: 'SVC-023', name: 'Scanning', category: 'Other Services', unit: 'page', price: 0.50, active: true },
  { id: 'svc_024', code: 'SVC-024', name: 'A4 Photocopying - Black & White (10 pages)', category: 'Photocopy & Lamination', unit: '10 pages', price: 1, active: true },
  { id: 'svc_025', code: 'SVC-025', name: 'A4 Photocopying - Colour (10 pages)', category: 'Photocopy & Lamination', unit: '10 pages', price: 2, active: true },
  { id: 'svc_026', code: 'SVC-026', name: 'A3 Paper Printing', category: 'Paper Printing', unit: 'page', price: 0, active: false, notes: 'Price was not clearly visible on the handwritten list; enter the price from Services.' },
  { id: 'svc_027', code: 'SVC-027', name: 'Laminating', category: 'Photocopy & Lamination', unit: 'copy', price: 1, active: true },
  { id: 'svc_028', code: 'SVC-028', name: 'Prospectus Report - Documentation (4 copies) Including Printing', category: 'Book Printing', unit: 'job', price: 120, active: true },
  { id: 'svc_029', code: 'SVC-029', name: 'Prospectus Report - Binding Only', category: 'Book Printing', unit: 'job', price: 20, active: true },
  { id: 'svc_030', code: 'SVC-030', name: 'Prospectus Report - Printing Only', category: 'Paper Printing', unit: 'job', price: 40, active: true },
  { id: 'svc_031', code: 'SVC-031', name: 'Quarterly Progress Report - Quarterly', category: 'Paper Printing', unit: 'quarter', price: 50, active: true },
  { id: 'svc_032', code: 'SVC-032', name: 'Quarterly Progress Report - Annual', category: 'Paper Printing', unit: 'annual', price: 190, active: true },
  { id: 'svc_033', code: 'SVC-033', name: 'End-of-Term Report Binding + Printing', category: 'Book Printing', unit: 'job', price: 90, active: true },
  { id: 'svc_034', code: 'SVC-034', name: 'Prospectus Amendments', category: 'Other Services', unit: 'job', price: 120, active: true },
  { id: 'svc_035', code: 'SVC-035', name: 'Academic Report Binding', category: 'Book Printing', unit: 'report', price: 0, active: false, notes: 'Price not shown clearly on the handwritten list; admin can enter it.' },
  // Graphic Design, Logo Design & Creative Artwork Services
  { id: 'svc_036', code: 'DSG-001', name: 'Logo Design & Vector Brand Identity', category: 'Graphic Design & Branding', unit: 'job', price: 25, active: true, notes: 'Includes 3 concepts, transparent PNG, SVG vector masters, full-color and monochrome' },
  { id: 'svc_037', code: 'DSG-002', name: 'Corporate Brand Identity Kit', category: 'Graphic Design & Branding', unit: 'kit', price: 60, active: true, notes: 'Vector logo, executive business card artwork, official letterhead, and color palette system' },
  { id: 'svc_038', code: 'DSG-003', name: 'Commercial Flyer & Social Media Poster Design', category: 'Graphic Design & Branding', unit: 'design', price: 10, active: true, notes: 'High-conversion marketing layout optimized for WhatsApp flyers, Facebook, and 300 DPI print' },
  { id: 'svc_039', code: 'DSG-004', name: 'DTF Apparel & Uniform Artwork Separation', category: 'Graphic Design & Branding', unit: 'design', price: 15, active: true, notes: 'Vector redraw, color separation, and gang-sheet prep for direct-to-film apparel heat pressing' },
  { id: 'svc_040', code: 'DSG-005', name: 'Book Cover, Syllabus & Module Typesetting', category: 'Graphic Design & Branding', unit: 'book', price: 20, active: true, notes: 'Curriculum layout, spine width calculation, front/back artwork and print-ready imposition' },
  { id: 'svc_041', code: 'DSG-006', name: 'EIA Environmental Document Graphic Formatting', category: 'Graphic Design & Branding', unit: 'dossier', price: 35, active: true, notes: 'Cartography maps, statutory project diagrams, and environmental audit layout formatting' },
  { id: 'svc_042', code: 'DSG-007', name: 'Executive Business Card Layout & Artwork', category: 'Graphic Design & Branding', unit: 'design', price: 8, active: true, notes: 'Custom double-sided design with print bleed margins and high-res vector output' },
  { id: 'svc_043', code: 'DSG-008', name: 'PVC Banner & Large Format Signboard Artwork', category: 'Graphic Design & Branding', unit: 'design', price: 15, active: true, notes: 'Large-scale high-resolution vector artwork configured for outdoor flex banners & billboards' }
];

// Kept as a compatibility alias for older code. New receipts should read from storage.getServices().
export const SERVICE_PRESETS = INITIAL_SERVICES.map(service => ({
  title: service.name,
  category: service.category,
  defaultPrice: service.price,
  unit: service.unit,
  inventoryItemId: service.inventoryItemId
}));

// Helper to get today's date formatted as YYYY-MM-DD
export const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Production Clean State: No dummy sales receipts; ready for live teller POS records
export const INITIAL_SALES: SaleReceipt[] = [];

// Production Clean State: No dummy expenses; records start fresh on production launch
export const INITIAL_EXPENSES: DailyExpense[] = [];

// Production Clean State: Stock movement history begins from live intakes and receipts
export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export const INITIAL_CHATS: ChatMessage[] = [
  // Team Workshop Channel
  {
    id: 'msg_1',
    channel: 'team_workshop',
    senderId: 'usr_admin',
    senderName: 'Sarah (Admin)',
    senderRole: 'admin',
    senderAvatar: '👑',
    text: 'Good morning team! Welcome to the MIBS Live Workshop & Production Terminal. Chiramba Complex Stand 448 is open for commercial print, DTF apparel, educational modules, and design studio orders.',
    timestamp: new Date().toISOString(),
    isUrgent: false
  },
  {
    id: 'msg_2',
    channel: 'team_workshop',
    senderId: 'usr_teller1',
    senderName: 'David (Front Desk)',
    senderRole: 'teller',
    senderAvatar: '🧑‍💼',
    text: 'Front desk teller POS is online. Ready to process walk-in clients, invoice quotes, and issue receipts.',
    timestamp: new Date().toISOString()
  },

  // AI Print & Inventory Advisor Channel
  {
    id: 'msg_ai_1',
    channel: 'ai_advisor',
    senderId: 'ai_copilot',
    senderName: 'MIBS Print Advisor',
    senderRole: 'ai',
    senderAvatar: '🤖',
    text: 'Hello! I am your real-time MIBS Print Shop Business & Stock Copilot. I analyze live sales receipts, monitor stock depletion rates, compute profit margins, and calculate custom job quotes. How can I assist you today?',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quote_101',
    quoteNumber: 'QT-2026-0901',
    date: '2026-09-01',
    validUntil: '2026-09-15',
    customerName: 'GreenEarth Conservation Initiative',
    customerPhone: '+263 77 456 7890',
    customerEmail: 'procurement@greenearth.org',
    customerAddress: 'Sustainability Complex, Harare',
    items: [
      {
        id: 'qitem_1',
        description: 'Prospectus Report - Documentation (4 copies) Including Printing',
        category: 'Book Printing',
        quantity: 4,
        unitPrice: 120.00,
        totalPrice: 480.00,
        unit: 'job',
        notes: 'Full-colour high-resolution environmental compliance documentation'
      },
      {
        id: 'qitem_2',
        description: 'Environmental Consultancy Briefings (Paper Printing - Colour)',
        category: 'Paper Printing',
        quantity: 500,
        unitPrice: 0.25,
        totalPrice: 125.00,
        unit: 'page'
      },
      {
        id: 'qitem_3',
        description: 'Spiral Binding & Heavy Matte Covers',
        category: 'Book Printing',
        quantity: 4,
        unitPrice: 2.00,
        totalPrice: 8.00,
        unit: 'book'
      }
    ],
    subtotal: 613.00,
    discount: 20.00,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 593.00,
    status: 'Sent',
    notes: 'Artwork files submitted. Turnaround time: 3 business days upon confirmation.',
    terms: '50% deposit upon order confirmation. Balance payable upon delivery. Quotation valid for 14 calendar days.',
    preparedBy: 'Sarah (Admin)',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'quote_102',
    quoteNumber: 'QT-2026-0904',
    date: '2026-09-04',
    validUntil: '2026-09-18',
    customerName: 'Horizon Academy High School',
    customerPhone: '+263 71 890 1234',
    customerEmail: 'accounts@horizonacademy.ac.zw',
    customerAddress: 'School Road, Avondale',
    items: [
      {
        id: 'qitem_4',
        description: 'Modules - History / FRS / Science (Full Term Set)',
        category: 'Book Printing',
        quantity: 60,
        unitPrice: 6.00,
        totalPrice: 360.00,
        unit: 'module'
      },
      {
        id: 'qitem_5',
        description: 'Shona Novels / Set Books - O Level',
        category: 'Other Services',
        quantity: 80,
        unitPrice: 5.00,
        totalPrice: 400.00,
        unit: 'book'
      },
      {
        id: 'qitem_6',
        description: 'Academic Reports - Secondary (Terminal Assessment)',
        category: 'Other Services',
        quantity: 120,
        unitPrice: 3.00,
        totalPrice: 360.00,
        unit: 'report'
      }
    ],
    subtotal: 1120.00,
    discount: 40.00,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 1080.00,
    status: 'Accepted',
    notes: 'Official school order approved by Principal.',
    terms: 'Payment term: 50% advance, balance within 7 days of collection.',
    preparedBy: 'David (Teller / Front Desk)',
    createdAt: '2026-09-04T14:30:00.000Z'
  }
];

