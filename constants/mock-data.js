export const MOCK_USER = {
  id: "usr-101",
  name: "Pruthvi Raj",
  email: "pruthvi.raj@ecosort.ai",
  avatarUrl: "", // Fallback will trigger nice gradient avatar
  ecoPoints: 1250,
  ecoLevel: "Eco Sentinel",
  joinedAt: "2026-03-15T08:00:00Z"
};

export const MOCK_STATS = {
  totalScans: 48,
  recycledItemsCount: 42,
  co2SavedKg: 18.6,
  pointsEarned: 1250,
  carbonOffsetPercent: 74,
  levelProgressPercent: 62,
  scansThisWeek: 8
};

export const MOCK_PREDICTIONS = [
  {
    id: "pred-1",
    wasteImageId: "img-1",
    category: "plastic",
    confidence: 94,
    materials: ["Polyethylene Terephthalate (PET)", "Clear Plastic Bottle"],
    recyclability: true,
    carbonSavedKg: 0.12,
    recommendations: [
      { id: "rec-1-1", action: "Rinse container", details: "Rinse off any residual liquid to avoid contamination.", order: 1 },
      { id: "rec-1-2", action: "Crush the bottle", details: "Compress the bottle to save volume in the recycling bin.", order: 2 },
      { id: "rec-1-3", action: "Keep cap attached", details: "Modern recycling facilities prefer caps to be screwed on.", order: 3 }
    ]
  },
  {
    id: "pred-2",
    wasteImageId: "img-2",
    category: "glass",
    confidence: 88,
    materials: ["Amber Glass Bottle", "Soda Bottle"],
    recyclability: true,
    carbonSavedKg: 0.35,
    recommendations: [
      { id: "rec-2-1", action: "Remove metal cap", details: "Remove the metal lid as it goes in a separate metal stream.", order: 1 },
      { id: "rec-2-2", action: "Rinse clean", details: "Rinse thoroughly to eliminate sugars and yeast.", order: 2 }
    ]
  },
  {
    id: "pred-3",
    wasteImageId: "img-3",
    category: "paper",
    confidence: 97,
    materials: ["Corrugated Cardboard", "Shipping Box"],
    recyclability: true,
    carbonSavedKg: 0.22,
    recommendations: [
      { id: "rec-3-1", action: "Flatten cardboard", details: "Break down the shipping box flat to optimize bin space.", order: 1 },
      { id: "rec-3-2", action: "Remove adhesive tape", details: "Peel off plastic packing tape if possible before recycling.", order: 2 }
    ]
  },
  {
    id: "pred-4",
    wasteImageId: "img-4",
    category: "organic",
    confidence: 91,
    materials: ["Banana Peel", "Fruit Scraps"],
    recyclability: true,
    carbonSavedKg: 0.08,
    recommendations: [
      { id: "rec-4-1", action: "Place in compost bin", details: "Add this green nitrogen-rich material to your organic heap.", order: 1 },
      { id: "rec-4-2", action: "Avoid mixing plastics", details: "Make sure no synthetic tags or stickers remain on the peel.", order: 2 }
    ]
  },
  {
    id: "pred-5",
    wasteImageId: "img-5",
    category: "hazardous",
    confidence: 85,
    materials: ["Alkaline AA Batteries", "Chemical Cells"],
    recyclability: false,
    carbonSavedKg: 0.0,
    recommendations: [
      { id: "rec-5-1", action: "Do not throw in trash", details: "Batteries contain chemicals that leak into groundwaters.", order: 1 },
      { id: "rec-5-2", action: "Drop off at center", details: "Must be disposed of at an designated hazardous waste collection center.", order: 2 }
    ]
  }
];

export const MOCK_WASTE_IMAGES = [
  {
    id: "img-1",
    userId: "usr-101",
    imageUrl: "https://images.unsplash.com/photo-1605600611283-c48a702277ee?w=500&auto=format&fit=crop",
    status: "success",
    prediction: MOCK_PREDICTIONS[0],
    createdAt: "2026-07-25T14:32:00Z"
  },
  {
    id: "img-2",
    userId: "usr-101",
    imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop",
    status: "success",
    prediction: MOCK_PREDICTIONS[1],
    createdAt: "2026-07-24T11:15:00Z"
  },
  {
    id: "img-3",
    userId: "usr-101",
    imageUrl: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=500&auto=format&fit=crop",
    status: "success",
    prediction: MOCK_PREDICTIONS[2],
    createdAt: "2026-07-22T09:45:00Z"
  },
  {
    id: "img-4",
    userId: "usr-101",
    imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&auto=format&fit=crop",
    status: "success",
    prediction: MOCK_PREDICTIONS[3],
    createdAt: "2026-07-20T16:10:00Z"
  },
  {
    id: "img-5",
    userId: "usr-101",
    imageUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=500&auto=format&fit=crop",
    status: "success",
    prediction: MOCK_PREDICTIONS[4],
    createdAt: "2026-07-18T10:05:00Z"
  }
];

export const SCRAP_RATES = {
  plastic: 15, // ₹/kg
  paper: 10, // ₹/kg
  cardboard: 18, // ₹/kg
  glass: 4, // ₹/kg
  metal: 45, // ₹/kg
  organic: 3, // ₹/kg
  "e-waste": 120, // ₹/kg
  textile: 12, // ₹/kg
  hazardous: 0, // ₹/kg
  other: 5 // ₹/kg
};

export const MOCK_CENTERS = [
  {
    id: "center-1",
    name: "GreenEarth Municipal Recycling",
    address: "128 Eco Valley Road, Green Hills",
    distanceKm: 2.4,
    latitude: 12.9716,
    longitude: 77.5946,
    acceptedMaterials: ["plastic", "paper", "glass", "metal"],
    phone: "+91 98450 12345",
    website: "https://greenearth-recycling.org",
    rates: {
      plastic: 15,
      paper: 10,
      glass: 4,
      metal: 45
    }
  },
  {
    id: "center-2",
    name: "Metro E-Waste & Battery Depot",
    address: "41 Industrial Grid, Sector 4",
    distanceKm: 4.8,
    latitude: 12.9801,
    longitude: 77.6052,
    acceptedMaterials: ["e-waste", "hazardous", "metal"],
    phone: "+91 80234 56789",
    website: "https://metro-ewaste.gov",
    rates: {
      "e-waste": 120,
      hazardous: 0,
      metal: 50
    }
  },
  {
    id: "center-3",
    name: "Organics & Compost Hub",
    address: "7 Community Garden Way, Green Hills",
    distanceKm: 1.1,
    latitude: 12.9654,
    longitude: 77.5891,
    acceptedMaterials: ["organic"],
    phone: "+91 99001 24681",
    rates: {
      organic: 3
    }
  }
];
