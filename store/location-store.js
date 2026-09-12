import { create } from "zustand";

// Supported Indian Metros with realistic centers, localized quests, and leaderboard citizens
export const CITIES_DATA = {
  bengaluru: {
    name: "Bengaluru",
    state: "Karnataka",
    coords: [12.9716, 77.5946],
    wards: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Malleshwaram", "Jayanagar"],
    centers: [
      {
        id: "blr-center-1",
        name: "GreenEarth Municipal Recycling Hub",
        address: "128 100ft Road, Indiranagar, Bengaluru",
        latitude: 12.9784,
        longitude: 77.6408,
        acceptedMaterials: ["plastic", "paper", "glass", "metal"],
        phone: "+91 98450 12345",
        website: "https://greenearth-recycling.org",
        rates: { plastic: 15, paper: 10, glass: 4, metal: 45 }
      },
      {
        id: "blr-center-2",
        name: "Metro E-Waste & Battery Depot",
        address: "41 Industrial Grid, Sector 4, HSR Layout, Bengaluru",
        latitude: 12.9116,
        longitude: 77.6389,
        acceptedMaterials: ["e-waste", "hazardous", "metal"],
        phone: "+91 80234 56789",
        website: "https://metro-ewaste.gov",
        rates: { "e-waste": 120, hazardous: 0, metal: 50 }
      },
      {
        id: "blr-center-3",
        name: "BBMP Dry Waste Collection Center",
        address: "5th Block, Koramangala, Bengaluru",
        latitude: 12.9352,
        longitude: 77.6245,
        acceptedMaterials: ["plastic", "paper", "cardboard", "textile"],
        phone: "+91 99001 24681",
        website: "https://bbmp.gov.in",
        rates: { plastic: 14, paper: 12, textile: 15 }
      },
      {
        id: "blr-center-4",
        name: "Whitefield Eco Composting & Organic Depot",
        address: "ITPB Main Road, Whitefield, Bengaluru",
        latitude: 12.9850,
        longitude: 77.7315,
        acceptedMaterials: ["organic"],
        phone: "+91 98455 77889",
        rates: { organic: 3 }
      }
    ],
    quests: [
      {
        id: "q-blr-1",
        title: "Indiranagar Plastic-Free Sprint",
        locality: "Indiranagar, Bengaluru",
        category: "Plastic & Packaging",
        participants: 342,
        targetScans: 1000,
        currentScans: 840,
        daysLeft: 3,
        rewardPoints: 250,
        badge: "Plastic Slayer",
        description: "Collect, scan, and divert 1,000 plastic containers across ward 112 before Sunday.",
        acceptedMaterials: ["PET Bottles (Grade 1)", "HDPE Milk & Shampoo Jugs", "Rigid Plastic Containers"],
        guidelines: "Rinse containers before disposing. Separate colored caps."
      },
      {
        id: "q-blr-2",
        title: "Citywide E-Waste Roundup",
        locality: "Greater Bengaluru",
        category: "Electronics & Hazardous",
        participants: 618,
        targetScans: 500,
        currentScans: 390,
        daysLeft: 6,
        rewardPoints: 500,
        badge: "Circuit Saver",
        description: "Drop off old phones, chargers, and batteries at authorized municipal recycling hubs.",
        acceptedMaterials: ["Smartphones", "Chargers & cables", "Li-ion batteries (taped)", "Keyboards"],
        guidelines: "Factory-reset devices. Tape lithium battery terminals."
      },
      {
        id: "q-blr-3",
        title: "Zero-Contamination Cardboard Drive",
        locality: "Koramangala & HSR",
        category: "Paper & Fiber",
        participants: 215,
        targetScans: 750,
        currentScans: 520,
        daysLeft: 4,
        rewardPoints: 200,
        badge: "Cardboard Captain",
        description: "Flatten and dry 750 shipping cartons to optimize dry waste truck payload volume.",
        acceptedMaterials: ["Corrugated cardboard boxes", "E-commerce boxes", "Cereal cartons"],
        guidelines: "Peel off plastic tape. Boxes must be dry and flattened."
      }
    ],
    leaderboard: [
      { id: "u-blr-1", name: "Aarav Sharma", locality: "Indiranagar", ward: "Indiranagar", scans: 142, points: 7100, badge: "Eco Titan", avatar: "AS" },
      { id: "u-blr-2", name: "Priya Venkatesh", locality: "Koramangala", ward: "Koramangala", scans: 128, points: 6400, badge: "Recycling Ranger", avatar: "PV" },
      { id: "u-blr-3", name: "Rohan Kulkarni", locality: "HSR Layout", ward: "HSR Layout", scans: 115, points: 5750, badge: "Green Guardian", avatar: "RK" },
      { id: "u-blr-4", name: "Ananya Deshmukh", locality: "Whitefield", ward: "Whitefield", scans: 96, points: 4800, badge: "Eco Enthusiast", avatar: "AD" },
      { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true },
      { id: "u-blr-6", name: "Karthik Nair", locality: "Malleshwaram", ward: "Malleshwaram", scans: 42, points: 2100, badge: "Eco Novice", avatar: "KN" }
    ]
  },

  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    coords: [19.0760, 72.8777],
    wards: ["Bandra West", "Andheri East", "BKC", "Colaba", "Powai", "Dadar"],
    centers: [
      {
        id: "mum-center-1",
        name: "BMC Coastal Plastic & E-Waste Center",
        address: "Hill Road, Bandra West, Mumbai",
        latitude: 19.0596,
        longitude: 72.8295,
        acceptedMaterials: ["plastic", "e-waste", "metal"],
        phone: "+91 98200 45678",
        website: "https://portal.mcgm.gov.in",
        rates: { plastic: 16, "e-waste": 130, metal: 48 }
      },
      {
        id: "mum-center-2",
        name: "Andheri MIDC Industrial Recycling Hub",
        address: "MIDC Central Road, Andheri East, Mumbai",
        latitude: 19.1197,
        longitude: 72.8697,
        acceptedMaterials: ["paper", "cardboard", "metal", "plastic"],
        phone: "+91 98211 99887",
        website: "https://mumbai-recyclers.in",
        rates: { paper: 12, plastic: 15, metal: 52 }
      },
      {
        id: "mum-center-3",
        name: "Powai Clean Lakes Organics Depot",
        address: "Near Hiranandani Gardens, Powai, Mumbai",
        latitude: 19.1176,
        longitude: 72.9060,
        acceptedMaterials: ["organic", "glass"],
        phone: "+91 99300 11223",
        rates: { organic: 4, glass: 5 }
      }
    ],
    quests: [
      {
        id: "q-mum-1",
        title: "Bandra Coastal Plastic Cleanup",
        locality: "Bandra West, Mumbai",
        category: "Plastic & Packaging",
        participants: 412,
        targetScans: 1200,
        currentScans: 950,
        daysLeft: 2,
        rewardPoints: 300,
        badge: "Ocean Protector",
        description: "Divert 1,200 single-use bottles and multilayer packaging from Mumbai shoreline drains.",
        acceptedMaterials: ["PET Bottles", "Rigid Plastics", "Milk Pouches"],
        guidelines: "Keep plastics sand-free and dried before drop-off."
      },
      {
        id: "q-mum-2",
        title: "BKC Tech Corridor E-Waste Drive",
        locality: "Bandra Kurla Complex, Mumbai",
        category: "Electronics & Hazardous",
        participants: 580,
        targetScans: 600,
        currentScans: 440,
        daysLeft: 5,
        rewardPoints: 500,
        badge: "Circuit Saver",
        description: "Drop obsolete cables, laptops, and batteries at BMC designated IT kiosks.",
        acceptedMaterials: ["Cables", "Laptops & Tablets", "Batteries"],
        guidelines: "Wipe personal devices before submitting."
      },
      {
        id: "q-mum-3",
        title: "Andheri Cardboard & Carton Drive",
        locality: "Andheri East, Mumbai",
        category: "Paper & Fiber",
        participants: 290,
        targetScans: 800,
        currentScans: 610,
        daysLeft: 4,
        rewardPoints: 200,
        badge: "Cardboard Captain",
        description: "Flatten 800 e-commerce packaging boxes for Mumbai municipal dry processing.",
        acceptedMaterials: ["Corrugated cartons", "Amazon / Flipkart boxes"],
        guidelines: "Flatten and stack dry cartons."
      }
    ],
    leaderboard: [
      { id: "u-mum-1", name: "Siddharth Mehta", locality: "Bandra West", ward: "Bandra West", scans: 156, points: 7800, badge: "Eco Titan", avatar: "SM" },
      { id: "u-mum-2", name: "Rhea Fernandes", locality: "Powai", ward: "Powai", scans: 134, points: 6700, badge: "Recycling Ranger", avatar: "RF" },
      { id: "u-mum-3", name: "Aditya Sawant", locality: "Andheri East", ward: "Andheri East", scans: 118, points: 5900, badge: "Green Guardian", avatar: "AS" },
      { id: "u-mum-4", name: "Zoya Khan", locality: "BKC", ward: "BKC", scans: 99, points: 4950, badge: "Eco Enthusiast", avatar: "ZK" },
      { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true },
      { id: "u-mum-6", name: "Vikram Rane", locality: "Dadar", ward: "Dadar", scans: 45, points: 2250, badge: "Eco Novice", avatar: "VR" }
    ]
  },

  delhi: {
    name: "Delhi NCR",
    state: "Delhi",
    coords: [28.6139, 77.2090],
    wards: ["Connaught Place", "Hauz Khas", "South Extension", "Dwarka", "Noida Sector 18", "Rohini"],
    centers: [
      {
        id: "del-center-1",
        name: "NDMC Clean Capital Recycling Center",
        address: "Barakhamba Road, Connaught Place, New Delhi",
        latitude: 28.6304,
        longitude: 77.2177,
        acceptedMaterials: ["plastic", "paper", "e-waste", "metal"],
        phone: "+91 11 2334 1122",
        website: "https://ndmc.gov.in",
        rates: { plastic: 15, paper: 11, "e-waste": 125, metal: 46 }
      },
      {
        id: "del-center-2",
        name: "South Delhi Municipal Solid Waste Station",
        address: "Near Ring Road, Hauz Khas, New Delhi",
        latitude: 28.5494,
        longitude: 77.2001,
        acceptedMaterials: ["paper", "cardboard", "organic"],
        phone: "+91 98110 33445",
        rates: { paper: 12, organic: 3 }
      },
      {
        id: "del-center-3",
        name: "Noida Electronic & Hazardous Waste Hub",
        address: "Sector 18 Commercial Belt, Noida",
        latitude: 28.5708,
        longitude: 77.3260,
        acceptedMaterials: ["e-waste", "hazardous", "metal"],
        phone: "+91 98180 77665",
        rates: { "e-waste": 135, hazardous: 0, metal: 50 }
      }
    ],
    quests: [
      {
        id: "q-del-1",
        title: "Connaught Place Clean Air Plastic Drive",
        locality: "Connaught Place, Delhi",
        category: "Plastic & Packaging",
        participants: 490,
        targetScans: 1500,
        currentScans: 1120,
        daysLeft: 3,
        rewardPoints: 350,
        badge: "Air Guardian",
        description: "Prevent roadside plastic burning by diverting 1,500 beverage and food containers.",
        acceptedMaterials: ["PET Bottles", "Food Tubs", "Plastic Caps"],
        guidelines: "Deposit at NDMC Smart bins around Outer Circle."
      },
      {
        id: "q-del-2",
        title: "South Delhi Battery & E-Waste Roundup",
        locality: "Hauz Khas & South Ext",
        category: "Electronics & Hazardous",
        participants: 620,
        targetScans: 700,
        currentScans: 510,
        daysLeft: 5,
        rewardPoints: 500,
        badge: "Circuit Saver",
        description: "Safely channel lithium cells and adapters to certified e-waste recyclers.",
        acceptedMaterials: ["Old Phones", "Batteries", "Chargers"],
        guidelines: "Insulate battery contacts with electrical tape."
      },
      {
        id: "q-del-3",
        title: "NCR Packaging Cardboard Drive",
        locality: "Noida & Dwarka",
        category: "Paper & Fiber",
        participants: 310,
        targetScans: 900,
        currentScans: 680,
        daysLeft: 4,
        rewardPoints: 220,
        badge: "Cardboard Captain",
        description: "Flatten cartons to support city-wide paper pulp circular economy.",
        acceptedMaterials: ["Delivery boxes", "Shoe boxes", "Cartons"],
        guidelines: "Keep boxes dry and taped bundles flat."
      }
    ],
    leaderboard: [
      { id: "u-del-1", name: "Kabir Malhotra", locality: "Hauz Khas", ward: "Hauz Khas", scans: 162, points: 8100, badge: "Eco Titan", avatar: "KM" },
      { id: "u-del-2", name: "Meera Sen", locality: "Connaught Place", ward: "Connaught Place", scans: 139, points: 6950, badge: "Recycling Ranger", avatar: "MS" },
      { id: "u-del-3", name: "Arjun Gill", locality: "South Extension", ward: "South Extension", scans: 122, points: 6100, badge: "Green Guardian", avatar: "AG" },
      { id: "u-del-4", name: "Tanvi Bansal", locality: "Dwarka", ward: "Dwarka", scans: 104, points: 5200, badge: "Eco Enthusiast", avatar: "TB" },
      { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true },
      { id: "u-del-6", name: "Sameer Vohra", locality: "Noida Sector 18", ward: "Noida Sector 18", scans: 40, points: 2000, badge: "Eco Novice", avatar: "SV" }
    ]
  },

  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    coords: [17.3850, 78.4867],
    wards: ["Hitec City", "Gachibowli", "Banjara Hills", "Jubilee Hills", "Madhapur", "Kukatpally"],
    centers: [
      {
        id: "hyd-center-1",
        name: "GHMC Cyberabad E-Waste & Plastic Depot",
        address: "Mindspace Road, Hitec City, Hyderabad",
        latitude: 17.4435,
        longitude: 78.3772,
        acceptedMaterials: ["e-waste", "plastic", "metal"],
        phone: "+91 40 2311 8899",
        website: "https://ghmc.gov.in",
        rates: { "e-waste": 130, plastic: 15, metal: 48 }
      },
      {
        id: "hyd-center-2",
        name: "Banjara Hills Eco Dry Waste Hub",
        address: "Road No. 12, Banjara Hills, Hyderabad",
        latitude: 17.4156,
        longitude: 78.4350,
        acceptedMaterials: ["paper", "plastic", "glass"],
        phone: "+91 98490 22334",
        rates: { paper: 11, plastic: 14, glass: 4 }
      }
    ],
    quests: [
      {
        id: "q-hyd-1",
        title: "Cyberabad Tech E-Waste Sprint",
        locality: "Hitec City & Gachibowli",
        category: "Electronics & Hazardous",
        participants: 510,
        targetScans: 650,
        currentScans: 480,
        daysLeft: 4,
        rewardPoints: 500,
        badge: "Circuit Saver",
        description: "Divert electronic junk from IT hubs across Gachibowli and Madhapur.",
        acceptedMaterials: ["Laptops", "Cables", "Keyboards", "Batteries"],
        guidelines: "Hand over at designated GHMC kiosks."
      },
      {
        id: "q-hyd-2",
        title: "Banjara Hills Zero-Plastic Drive",
        locality: "Banjara & Jubilee Hills",
        category: "Plastic & Packaging",
        participants: 360,
        targetScans: 1000,
        currentScans: 810,
        daysLeft: 3,
        rewardPoints: 250,
        badge: "Plastic Slayer",
        description: "Sort 1,000 plastic beverage bottles across neighborhood cafes.",
        acceptedMaterials: ["PET Bottles", "Plastic Cups"],
        guidelines: "Rinse clean before dropping in."
      }
    ],
    leaderboard: [
      { id: "u-hyd-1", name: "Venkat Rao", locality: "Hitec City", ward: "Hitec City", scans: 148, points: 7400, badge: "Eco Titan", avatar: "VR" },
      { id: "u-hyd-2", name: "Deepika Reddy", locality: "Banjara Hills", ward: "Banjara Hills", scans: 130, points: 6500, badge: "Recycling Ranger", avatar: "DR" },
      { id: "u-hyd-3", name: "Prashanth Goud", locality: "Gachibowli", ward: "Gachibowli", scans: 112, points: 5600, badge: "Green Guardian", avatar: "PG" },
      { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true },
      { id: "u-hyd-5", name: "Sneha Varma", locality: "Madhapur", ward: "Madhapur", scans: 46, points: 2300, badge: "Eco Novice", avatar: "SV" }
    ]
  },

  pune: {
    name: "Pune",
    state: "Maharashtra",
    coords: [18.5204, 73.8567],
    wards: ["Koregaon Park", "Kothrud", "Viman Nagar", "Hinjewadi", "Baner", "Aundh"],
    centers: [
      {
        id: "pun-center-1",
        name: "SWaCH Cooperative Recycling Depot",
        address: "North Main Road, Koregaon Park, Pune",
        latitude: 18.5362,
        longitude: 73.8940,
        acceptedMaterials: ["plastic", "paper", "glass", "metal"],
        phone: "+91 97654 23110",
        website: "https://swachcoop.com",
        rates: { plastic: 16, paper: 12, metal: 50 }
      },
      {
        id: "pun-center-2",
        name: "Hinjewadi IT Clean Electronics Depot",
        address: "Phase 1, Hinjewadi Rajiv Gandhi Infotech Park, Pune",
        latitude: 18.5912,
        longitude: 73.7389,
        acceptedMaterials: ["e-waste", "metal", "hazardous"],
        phone: "+91 98900 66778",
        rates: { "e-waste": 125, metal: 48 }
      }
    ],
    quests: [
      {
        id: "q-pun-1",
        title: "Koregaon Park Plastic-Free Sprint",
        locality: "Koregaon Park, Pune",
        category: "Plastic & Packaging",
        participants: 280,
        targetScans: 850,
        currentScans: 690,
        daysLeft: 3,
        rewardPoints: 250,
        badge: "Plastic Slayer",
        description: "Sort and divert 850 plastic containers with SWaCH waste picker cooperative.",
        acceptedMaterials: ["PET Bottles", "Milk Pouches", "Takeaway containers"],
        guidelines: "Rinse and stack dry containers."
      }
    ],
    leaderboard: [
      { id: "u-pun-1", name: "Omkar Joshi", locality: "Kothrud", ward: "Kothrud", scans: 140, points: 7000, badge: "Eco Titan", avatar: "OJ" },
      { id: "u-pun-2", name: "Pooja Kulkarni", locality: "Koregaon Park", ward: "Koregaon Park", scans: 124, points: 6200, badge: "Recycling Ranger", avatar: "PK" },
      { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true }
    ]
  },

  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    coords: [13.0827, 80.2707],
    wards: ["Adyar", "T. Nagar", "Anna Nagar", "Velachery", "Besant Nagar", "Mylapore"],
    centers: [
      {
        id: "chn-center-1",
        name: "Greater Chennai Corporation Resource Recovery Facility",
        address: "Lattice Bridge Road, Adyar, Chennai",
        latitude: 13.0012,
        longitude: 80.2565,
        acceptedMaterials: ["plastic", "paper", "e-waste", "glass"],
        phone: "+91 44 2441 5566",
        website: "https://chennaicorporation.gov.in",
        rates: { plastic: 15, paper: 11, glass: 4 }
      }
    ],
    quests: [
      {
        id: "q-chn-1",
        title: "Besant Beach Plastic Prevention Sprint",
        locality: "Besant Nagar & Adyar",
        category: "Plastic & Packaging",
        participants: 390,
        targetScans: 1000,
        currentScans: 780,
        daysLeft: 4,
        rewardPoints: 280,
        badge: "Coast Protector",
        description: "Divert coastal plastics before monsoon tidal surges reach the Bay of Bengal.",
        acceptedMaterials: ["PET Bottles", "Beverage Cans"],
        guidelines: "Ensure items are dry and cap-secured."
      }
    ],
    leaderboard: [
      { id: "u-chn-1", name: "Kavitha Raman", locality: "Adyar", ward: "Adyar", scans: 145, points: 7250, badge: "Eco Titan", avatar: "KR" },
      { id: "u-chn-2", name: "Suresh Balaji", locality: "Anna Nagar", ward: "Anna Nagar", scans: 126, points: 6300, badge: "Recycling Ranger", avatar: "SB" },
      { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true }
    ]
  },

  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    coords: [22.5726, 88.3639],
    wards: ["Salt Lake", "Park Street", "New Town", "Ballygunge", "Howrah", "Alipore"],
    centers: [
      {
        id: "kol-center-1",
        name: "KMC Green Solid Waste Center",
        address: "Sector V, Salt Lake, Kolkata",
        latitude: 22.5735,
        longitude: 88.4331,
        acceptedMaterials: ["plastic", "paper", "e-waste", "metal"],
        phone: "+91 33 2357 8899",
        rates: { plastic: 14, paper: 10, metal: 45 }
      }
    ],
    quests: [
      {
        id: "q-kol-1",
        title: "Salt Lake Tech Corridor Plastic Drive",
        locality: "Salt Lake & New Town",
        category: "Plastic & Packaging",
        participants: 275,
        targetScans: 750,
        currentScans: 560,
        daysLeft: 3,
        rewardPoints: 240,
        badge: "Eco Warden",
        description: "Divert IT park packaging waste into circular recycling channels.",
        acceptedMaterials: ["PET Bottles", "Packaging plastic"],
        guidelines: "Drop in clean bags at KMC kiosks."
      }
    ],
    leaderboard: [
      { id: "u-kol-1", name: "Debashis Roy", locality: "Salt Lake", ward: "Salt Lake", scans: 138, points: 6900, badge: "Eco Titan", avatar: "DR" },
      { id: "u-kol-2", name: "Ananya Mukherjee", locality: "Ballygunge", ward: "Ballygunge", scans: 119, points: 5950, badge: "Recycling Ranger", avatar: "AM" },
      { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true }
    ]
  }
};

// Calculate Haversine distance between two coordinates in km
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Find nearest Indian city based on latitude and longitude
export function findNearestCity(lat, lon) {
  let closestKey = "bengaluru";
  let minDistance = Infinity;

  Object.entries(CITIES_DATA).forEach(([key, city]) => {
    const dist = calculateDistanceKm(lat, lon, city.coords[0], city.coords[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestKey = key;
    }
  });

  return closestKey;
}

export const useLocationStore = create((set, get) => ({
  selectedCityKey: "bengaluru",
  userExactCoords: null, // [lat, lon] when GPS is active
  userLocationName: "Bengaluru, Karnataka (Default)",
  isGpsActive: false,
  gpsLoading: false,
  gpsError: null,

  // Change selected city manually
  setCity: (cityKey) => {
    const city = CITIES_DATA[cityKey] || CITIES_DATA.bengaluru;
    set({
      selectedCityKey: cityKey,
      userLocationName: `${city.name}, ${city.state}`,
      gpsError: null
    });
  },

  // Detect exact browser GPS location
  detectExactLocation: () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      set({ gpsError: "Geolocation is not supported by your browser." });
      return;
    }

    set({ gpsLoading: true, gpsError: null });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const nearestCityKey = findNearestCity(lat, lon);
        const cityName = CITIES_DATA[nearestCityKey]?.name || "Detected City";

        let friendlyName = `Near ${cityName} (${lat.toFixed(3)}, ${lon.toFixed(3)})`;
        try {
          // Quick reverse geocode with openstreetmap nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`
          );
          if (res.ok) {
            const data = await res.json();
            const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || "";
            const city = data.address?.city || data.address?.town || cityName;
            friendlyName = suburb ? `${suburb}, ${city}` : `${city}, India`;
          }
        } catch {
          // fallback to friendly name
        }

        set({
          userExactCoords: [lat, lon],
          selectedCityKey: nearestCityKey,
          userLocationName: friendlyName,
          isGpsActive: true,
          gpsLoading: false,
          gpsError: null
        });
      },
      (err) => {
        console.warn("GPS detection failed or denied:", err.message);
        set({
          gpsLoading: false,
          isGpsActive: false,
          gpsError: "Location permission denied. Select your city manually."
        });
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  },

  // Get active city details
  getActiveCity: () => {
    const state = get();
    return CITIES_DATA[state.selectedCityKey] || CITIES_DATA.bengaluru;
  },

  // Get dynamic centers computed with distance from current user coordinates
  getDynamicCenters: () => {
    const state = get();
    const city = CITIES_DATA[state.selectedCityKey] || CITIES_DATA.bengaluru;
    const origin = state.userExactCoords || city.coords;

    return city.centers.map((center) => {
      const distance = calculateDistanceKm(
        origin[0],
        origin[1],
        center.latitude,
        center.longitude
      );
      return {
        ...center,
        distanceKm: distance
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }
}));
