/**
 * Taqwa Motors - Dataset & Configuration
 * Rawalpindi, Pakistan
 * Phone / WhatsApp: 0333-5406173
 * Showroom: Range Road, Chowk, Shalley Valley, Rawalpindi 46000, Pakistan
 * Google Maps: https://www.google.com/maps/place/Taqwa+Motors/@33.5996875,73.0143125,17z/data=!3m2!1e3!4b1!4m6!3m5!1s0x38df9412fbe061a7:0x4d828daa0413021b!8m2!3d33.5996875!4d73.0143125!16s%2Fg%2F11cmcvd9k9
 * 
 * Note: Vehicle Inventory is synced dynamically from the Supabase database.
 */

// Initial inventory state (dynamically populated from Supabase)
const INVENTORY_DATA = [];

// Pakistan Location Hierarchy for Registration Filtering
const PAKISTAN_LOCATIONS = {
  "Punjab": [
    "Lahore",
    "Rawalpindi",
    "Islamabad",
    "Faisalabad",
    "Multan",
    "Gujranwala",
    "Sialkot",
    "Bahawalpur",
    "Sargodha",
    "Gujrat",
    "Sheikhupura",
    "Jhelum",
    "Rahim Yar Khan",
    "Kasur",
    "Sahiwal",
    "Attock",
    "Chakwal",
    "Mianwali",
    "Okara",
    "Khanewal",
    "Vehari"
  ],
  "Khyber Pakhtunkhwa (KPK)": [
    "Peshawar",
    "Abbottabad",
    "Mardan",
    "Swat",
    "Kohat",
    "Dera Ismail Khan",
    "Nowshera",
    "Haripur",
    "Mansehra",
    "Charsadda",
    "Bannu",
    "Swabi"
  ],
  "Sindh": [
    "Karachi",
    "Hyderabad",
    "Sukkur",
    "Larkana",
    "Nawabshah",
    "Mirpur Khas",
    "Shikarpur",
    "Jacobabad"
  ],
  "Balochistan": [
    "Quetta",
    "Gwadar",
    "Turbat",
    "Khuzdar",
    "Hub",
    "Sibi",
    "Chaman",
    "Loralai"
  ],
  "Islamabad (ICT)": [
    "Islamabad"
  ]
};

// Customer Reviews & Testimonials Dataset
const TESTIMONIALS_DATA = [
  {
    name: "Chaudhry Nadeem Akhtar",
    location: "Bahria Town, Rawalpindi",
    carPurchased: "2023 Toyota Fortuner Legender",
    rating: 5,
    date: "2 weeks ago",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    comment: "Buying my Fortuner from Taqwa Motors was the smoothest car transaction I've experienced in 20 years. Their team at Range Road Chowk was 100% upfront about the vehicle's history, verified the dealership records in front of me, and handled the Islamabad biometric transfer within 24 hours. True to their name — pure trust and integrity!"
  },
  {
    name: "Dr. Hammad Rizvi",
    location: "Sector F-8, Islamabad",
    carPurchased: "2024 Haval H6 HEV Hybrid",
    rating: 5,
    date: "1 month ago",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    comment: "I was looking for a clean Haval H6 Hybrid and visited several showrooms along Rawalpindi and Islamabad. Taqwa Motors stood out immediately with their transparent inspection sheet and professional attitude. No hidden commission, zero drama. Highly recommend them to anyone who values genuine cars."
  },
  {
    name: "Malik Usman Tariq",
    location: "Westridge, Rawalpindi",
    carPurchased: "2023 Honda Civic RS Turbo",
    rating: 5,
    date: "2 months ago",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    comment: "Their WhatsApp response is lightning fast! I messaged them late evening regarding the Civic RS, got complete video walkthroughs, and visited their showroom the next morning. The car was even cleaner in person. Taqwa Motors is raising the standard for car dealerships in Rawalpindi."
  },
  {
    name: "Brig. (R) Asadullah Khan",
    location: "DHA Phase 2, Islamabad",
    carPurchased: "2021 Toyota Prado TX-L",
    rating: 5,
    date: "3 months ago",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    comment: "Genuine Japanese auction sheets are hard to trust in the local market, but Taqwa Motors verified the chassis number live on the Japan auction database right in their office. The Prado TX was delivered in pristine condition. Exceptional service by the entire Taqwa Motors management."
  }
];

// Dealership Services Data
const SERVICES_DATA = [
  {
    icon: "file-text",
    title: "Biometric & Excise Transfer",
    desc: "Complete end-to-end documentation assistance for Islamabad, Rawalpindi, and Punjab excise transfer and biometric verification."
  },
  {
    icon: "arrows-repeat",
    title: "Car Trade-In & Exchange",
    desc: "Upgrade your existing car with our fair, instant market appraisal and hassle-free vehicle exchange program."
  },
  {
    icon: "calculator",
    title: "Bank Leasing & Financing",
    desc: "Personalized assistance with leading Islamic and commercial banks for fast car financing approval at competitive markup rates."
  },
  {
    icon: "gem",
    title: "VIP Showroom Consultation",
    desc: "Private viewing, personalized vehicle sourcing for rare JDM imports, and dedicated test drive appointments at Range Road Chowk."
  }
];

// FAQs Data
const FAQS_DATA = [
  {
    q: "How can I verify the auction sheet and genuine paint of your cars?",
    a: "Every Japanese imported car in our inventory comes with an authentic verifiable Japanese auction sheet. We verify the chassis number live on auction databases (USS, ARAI, TAA) in our showroom. For local vehicles, we provide computerized paint depth meter readings and official dealership service histories."
  },
  {
    q: "Where is Taqwa Motors located in Rawalpindi?",
    a: "Our prime showroom is located at Range Road, Chowk, Shalley Valley, Rawalpindi 46000, Pakistan. We are easily accessible from Peshawar Road, Saddar, Westridge, and Islamabad via I.J.P Road."
  },
  {
    q: "What are your showroom business hours?",
    a: "We are open 7 days a week from 10:00 AM to 10:00 PM. You can visit anytime or schedule a dedicated VIP test drive and inspection through WhatsApp (0333-5406173)."
  },
  {
    q: "Do you offer car trade-ins / vehicle exchange?",
    a: "Yes! Bring your current vehicle to our showroom for a comprehensive evaluation. We offer guaranteed fair market value that can be deducted directly toward your next car purchase."
  },
  {
    q: "Do you assist buyers from other cities (Lahore, Peshawar, Faisalabad)?",
    a: "Absolutely. Over 30% of our buyers come from outside Rawalpindi/Islamabad. We provide comprehensive HD video walkthroughs, third-party inspection facilitation, and nationwide insured car carrier delivery to your doorstep."
  }
];

// Initial Automotive News & Industry Blog Posts
const INITIAL_BLOG_POSTS = [
  {
    id: "blog-1",
    slug: "pakistan-new-car-tax-policy-2026",
    title: "Pakistan Automotive Tax & Withholding Changes in 2026: Complete Buyer Guide",
    category: "Government Policy & Taxes",
    tags: ["FBR Tax", "Withholding Tax", "Car Registration", "Excise Punjab"],
    featured_image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80",
    author: "Taqwa Motors Editorial",
    created_at: "2026-09-12T10:00:00Z",
    read_time: "5 min read",
    is_published: true,
    views: 342,
    seo_title: "Pakistan Automotive Tax Updates 2026 | FBR & Registration Guide | Taqwa Motors",
    seo_description: "Understand the latest withholding tax rates, FBR filer vs non-filer rules, and Islamabad/Punjab car registration fee updates for 2026 car buyers in Pakistan.",
    summary: "A comprehensive breakdown of new tax slabs, FBR filer incentives, and revised token tax rates impacting car buyers in Islamabad, Rawalpindi, and Punjab.",
    content: `
<h2>Understanding the 2026 Automotive Tax Landscape in Pakistan</h2>
<p>Buying a car in Pakistan in 2026 requires a clear understanding of federal withholding taxes, provincial transfer fees, and FBR filer classifications. At Taqwa Motors, we believe in complete fiscal transparency so you never encounter unexpected surcharges during delivery.</p>

<h3>1. Advance Withholding Tax Slabs (Engine Capacity vs Value)</h3>
<p>The Federal Board of Revenue (FBR) has transitioned withholding tax calculations from fixed engine capacity brackets to percentage-based invoice valuations for luxury segments:</p>
<ul>
  <li><strong>Under 1000cc:</strong> 0.5% for Active Filers | 2.5% for Non-Filers</li>
  <li><strong>1001cc to 1600cc:</strong> 1% for Active Filers | 4% for Non-Filers</li>
  <li><strong>1601cc to 2000cc:</strong> 2% for Active Filers | 8% for Non-Filers</li>
  <li><strong>Above 2000cc & Luxury SUVs:</strong> 3% to 6% for Active Filers | Up to 18% for Non-Filers</li>
</ul>

<h3>2. Punjab & Islamabad Biometric Transfer Fees</h3>
<p>Excise departments have digitized all vehicle transfers through the Punjab e-Pay and Islamabad Excise NADRA biometric kiosks. Crucial requirements include:</p>
<ul>
  <li>Live NADRA Biometric of both registered seller and buyer</li>
  <li>Updated annual token tax clearance receipts</li>
  <li>Original smart card / registration book verification</li>
</ul>

<h3>Expert Advice from Taqwa Motors</h3>
<p>Always verify the vehicle's token tax history and FBR ATL status prior to final payment. Our showroom staff provides end-to-end documentation verification and biometric assistance directly at Range Road Chowk, Rawalpindi.</p>
`
  },
  {
    id: "blog-2",
    slug: "japanese-auction-sheet-verification-guide",
    title: "How to Read & Verify a Japanese Car Auction Sheet (USS, ARAI, TAA)",
    category: "Import / JDM Guides",
    tags: ["JDM Imports", "Auction Sheet", "Chassis Check", "Japanese Cars"],
    featured_image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    author: "Japanese Vehicle Desk",
    created_at: "2026-09-05T14:30:00Z",
    read_time: "6 min read",
    is_published: true,
    views: 489,
    seo_title: "How to Read Japanese Car Auction Sheet | USS ARAI Guide | Taqwa Motors",
    seo_description: "Learn how to read auction grades, detect meter tampering, verify Japanese auction sheets, and protect yourself against fake papers in Pakistan.",
    summary: "A practical guide to deciphering auction grades (4.5, 4.0, R), inspector condition notes, body repair codes (W1, A2, U1), and live chassis database checks.",
    content: `
<h2>Why Auction Sheet Verification is Non-Negotiable</h2>
<p>Japanese domestic market (JDM) vehicles like Toyota Prado, Land Cruiser, Aqua, and Vezel are prized for their build quality. However, tampered auction sheets and rolled-back odometers are widespread in the local market. Here is how you can protect your investment.</p>

<h3>1. Understanding Overall Auction Grades</h3>
<ul>
  <li><strong>Grade 5 / S:</strong> Pristine showroom condition, virtually zero wear, genuine low mileage.</li>
  <li><strong>Grade 4.5:</strong> Exceptional condition with only minor cosmetic blemishes, clean interior.</li>
  <li><strong>Grade 4.0:</strong> Good overall condition with normal age-appropriate wear.</li>
  <li><strong>Grade 3.5:</strong> Noticeable scratches, dents, or higher mileage requiring cosmetic touch-ups.</li>
  <li><strong>Grade R / RA:</strong> Accident history repaired to Japanese structural standards.</li>
</ul>

<h3>2. Body Panel Codes Decoded</h3>
<p>The car schematic in the auction sheet details individual panels with specific letter codes:</p>
<ul>
  <li><strong>A1 / A2 / A3:</strong> Minor scratch (A1) to deep noticeable scratch (A3).</li>
  <li><strong>U1 / U2 / U3:</strong> Small pin dent (U1) to deep body dent (U3).</li>
  <li><strong>W1 / W2 / W3:</strong> Minor paint wave / invisible touch-up (W1) to noticeable repaint (W3).</li>
  <li><strong>XX:</strong> Replaced panel (e.g. replaced fender or bonnet).</li>
</ul>

<h3>How Taqwa Motors Verifies Every JDM Car</h3>
<p>We provide 100% genuine auction certificates and connect directly to official Japanese databases (USS, TAA, ARAI) right on our showroom screens at Range Road, Rawalpindi. We guarantee authentic auction sheets with zero tampering.</p>
`
  },
  {
    id: "blog-3",
    slug: "hybrid-vs-petrol-suv-pakistan-2026",
    title: "Hybrid (HEV) vs Traditional Petrol SUVs in Pakistan: Fuel Economy & Maintenance",
    category: "Vehicle Guides",
    tags: ["Hybrid Cars", "Fuel Economy", "Haval H6", "Fortuner Legender", "Vezel"],
    featured_image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    author: "Technical Service Team",
    created_at: "2026-08-28T09:15:00Z",
    read_time: "4 min read",
    is_published: true,
    views: 298,
    seo_title: "Hybrid vs Petrol SUVs in Pakistan 2026 | Fuel Economy & Cost Comparison",
    seo_description: "Compare real-world fuel economy, battery life, maintenance costs, and resale value of hybrid crossovers versus diesel/petrol SUVs in Rawalpindi & Islamabad.",
    summary: "Explore the real-world fuel savings, battery longevity, and resale value between hybrid crossovers and conventional petrol SUVs in Pakistani driving conditions.",
    content: `
<h2>The Shift Toward Hybrid Technology in Rawalpindi & Islamabad</h2>
<p>With fluctuating fuel prices and dense urban traffic between Rawalpindi and Islamabad, hybrid crossovers like the Haval H6 HEV, Honda Vezel e:HEV, and Toyota Corolla Cross have become customer favorites. But is hybrid the right choice for your lifestyle?</p>

<h3>1. City Mileage Comparison</h3>
<ul>
  <li><strong>Strong Hybrids (Haval HEV, Vezel, Cross):</strong> 17 to 22 km/L in stop-and-go twin city traffic.</li>
  <li><strong>Conventional 1.5L - 1.8L Petrol:</strong> 11 to 14 km/L in city conditions.</li>
  <li><strong>Large Diesel SUVs (Fortuner 2.8, Prado):</strong> 9 to 12 km/L, with superior highway torque and 4x4 towing prowess.</li>
</ul>

<h3>2. Maintenance & High-Voltage Battery Life</h3>
<p>Modern nickel-metal hydride and lithium-ion hybrid packs easily last 8 to 10+ years under Pakistani climate conditions when cooling air ducts are kept clean. Routine servicing costs are virtually identical to petrol cars.</p>

<h3>Which One Should You Choose?</h3>
<p>If 80% of your driving is daily city commute, hybrid delivers massive monthly fuel savings. For northern highway touring, off-roading, and rugged durability, diesel 4x4 options like the Toyota Fortuner Legender remain unmatched. Visit Taqwa Motors to test drive both options side by side.</p>
`
  },
  {
    id: "blog-4",
    slug: "punjab-biometric-car-transfer-rules",
    title: "Complete Step-by-Step Guide to Punjab Biometric Vehicle Transfer & Smart Cards",
    category: "Legal & Documentation",
    tags: ["Biometric Transfer", "Punjab Excise", "NADRA", "Smart Card"],
    featured_image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
    author: "Documentation Desk",
    created_at: "2026-08-15T12:00:00Z",
    read_time: "5 min read",
    is_published: true,
    views: 415,
    seo_title: "Punjab Vehicle Biometric Transfer Guide | Rawalpindi Excise | Taqwa Motors",
    seo_description: "Step-by-step procedure for completing biometric car transfers in Punjab and Islamabad, fee payment via ePay, and tracking smart card delivery.",
    summary: "Clear guidelines on biometric verification deadlines, ePay challans, token tax clearance, and transfer smart card dispatch in Punjab.",
    content: `
<h2>Say Goodbye to Open-Letter Vehicle Sales</h2>
<p>The Punjab Excise and Taxation Department has strictly eliminated open-letter car dealings. Every vehicle transaction must now undergo formal digital biometric transfer through NADRA and the ePay Punjab portal.</p>

<h3>Required Documents for Biometric Transfer</h3>
<ol>
  <li>Original Vehicle Smart Card or Registration Book</li>
  <li>Original CNIC copies of Seller and Buyer (Active)</li>
  <li>Recent Token Tax Payment Receipts</li>
  <li>ePay Punjab Application Tracking Number</li>
</ol>

<h3>Step-by-Step Procedure</h3>
<p><strong>Step 1:</strong> Generate the transfer challan on the ePay Punjab app and pay via online banking.<br>
<strong>Step 2:</strong> Both Seller and Buyer visit any authorized NADRA e-Sahulat franchise within 30 days to verify fingerprints.<br>
<strong>Step 3:</strong> Excise system approves transfer automatically and prints the new Smart Card with home delivery.</p>

<h3>Taqwa Motors Transfer Guarantee</h3>
<p>When you purchase any car from Taqwa Motors, our showroom documentation team completes the entire transfer documentation with zero hassle. We protect your peace of mind from day one.</p>
`
  }
];

// Export to window
window.INVENTORY_DATA = INVENTORY_DATA;
window.PAKISTAN_LOCATIONS = PAKISTAN_LOCATIONS;
window.TESTIMONIALS_DATA = TESTIMONIALS_DATA;
window.SERVICES_DATA = SERVICES_DATA;
window.FAQS_DATA = FAQS_DATA;
window.INITIAL_BLOG_POSTS = INITIAL_BLOG_POSTS;
