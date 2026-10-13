/* =====================================================================
   DECOR DESIGNO — site settings and backup product list
   ---------------------------------------------------------------------
   The shop and product pages load ALL products live from the store
   (decordesigno.com). The BACKUP_PRODUCTS list below is only shown if
   the store can't be reached. Every item in it is a real listing.
   ===================================================================== */
window.DD = {
  site: "https://decordesigno.com",
  phone: "+92 321 771 4820",
  phoneRaw: "923217714820",
  address: "Main Lahore Road, Chiniot, Pakistan",
  productsPerPage: 24,
  catalogueSize: 375   // shown in the hero; the shop page uses the live count
};

/* Home page category tiles: [title, store category slug, photo] */
const UP = "https://decordesigno.com/wp-content/uploads/";
DD.homeCategories = [
  ["Bedroom",            "bedroom",       UP+"2026/10/Signature-Wooden-Bed-Elegant-Handcrafted-WB08-1-1.jpg"],
  ["Living Room",        "sitting-room",  UP+"2026/09/Luxury-Statement-Sofa-for-Contemporary-Living-Room-SS0022.jpeg"],
  ["Dining Room",        "dining-room",   UP+"2026/09/Premium-Sheesham-Dining-Table-Set-Modern-8-Seater-DT0009.jpeg"],
  ["Cabinets & Storage", "almirah",       UP+"2025/08/Crockery-Showcase-Designs-in-Pakistan-Wooden-Modern-Cabinets-decor-designo-furniture4.png"],
  ["Swings & Jhoolas",   "swing-jholla",  UP+"2026/08/Large-Wooden-Swing-Chinioti-Family-Swing.png"],
  ["Baby Furniture",     "baby-cart",     UP+"2025/04/Buy-Luxury-Wooden-Baby-Cot-in-Pakistan-Decor-Designo-furniture-1.png"]
];

/* Categories shown in the shop sidebar if the live list can't load */
DD.backupCategories = [
  ["bedroom","Bedroom"],["bedroom-set","Bed Set"],["bedroom-chairs","Bedroom Chairs"],["wardrobes","Wardrobes"],
  ["dining-room","Dining Room"],["dining-set","Dining Set"],["sitting-room","Sitting Room"],["sofa-set","Sofa Set"],
  ["console-table","Console Table"],["almirah","Almirah"],["showcase","Showcase"],["bookshelves-cabinets","Bookshelves Cabinets"],
  ["swing-jholla","Swing/Jholla"],["shoe-racks","Shoe Racks"],["baby-cart","Baby Cart"],["others","Others"]
];

/* Backup products: id, name, slug, category name, category slug, price, regular price, image */
DD.backupProducts = [
  [6930,"Luxury Signature Wooden Bed Elegant Handcrafted WB08","signature-wooden-bed-wb08","Bed Set","bedroom-set",1475,1650,UP+"2026/10/Signature-Wooden-Bed-Elegant-Handcrafted-WB08-1-1.jpg"],
  [6923,"Luxury Murphy Bed Ultimate Space-Saving Wall Bed MB01","murphy-bed","Bed Set","bedroom-set",3408,3505,UP+"2026/09/Premium-Murphy-Bed-Elegant-Space-Saving-Wall-Bed-1.jpg"],
  [6918,"Amazing Premium Sheesham Dining Table Set Luxury 8-Seater","premium-sheesham-dining-set","Dining Set","dining-set",3689,3784,UP+"2026/09/Premium-Sheesham-Dining-Table-Set-Modern-8-Seater-DT0009.jpeg"],
  [6897,"Luxury Statement Sofa for Contemporary Living Room SS002","luxury-statement-sofa-ss002","Sofa Set","sofa-set",null,null,UP+"2026/09/Luxury-Statement-Sofa-for-Contemporary-Living-Room-SS0022-300x300.jpeg"],
  [6885,"Solid Wood Accent Chair for Bedroom C004","solid-wood-accent-chair-c004","Bedroom Chairs","bedroom-chairs",null,null,UP+"2026/09/Elegant-Solid-Wood-Accent-Chair-for-Bedroom-C004-Handcrafted-Furniture-e1788294869226-300x300.jpg"],
  [6870,"Wooden Dining Table Set of 8 Luxury DT006","wooden-dining-table-set","Dining Set","dining-set",null,null,UP+"2026/08/Wooden-Dining-Table-Set-of-8-Luxury-DT006-300x300.jpeg"],
  [6861,"Solid Wood Canopy Bed Luxury Four Poster Design","solid-wood-canopy-bed","Bed Set","bedroom-set",null,null,UP+"2026/08/Solid-Wood-Canopy-Bed-Luxury-Four-Poster-Design-300x300.jpg"],
  [6816,"Chinioti Dining Table Gold Carved Luxury Design","chinioti-dining-table","Dining Set","dining-set",null,null,UP+"2026/08/Chinioti-Dining-Table-Gold-Carved-Luxury-Design-300x300.png"],
  [6811,"Large Wooden Swing Chinioti Family Swing","large-wooden-swing-chinioti-family-swing","Swing/Jholla","swing-jholla",null,null,UP+"2026/08/Large-Wooden-Swing-Chinioti-Family-Swing-300x300.png"],
  [6799,"Handcrafted Sofa Set Luxury Wooden & Fabric Sofa","handcrafted-sofa-set-luxury-wooden","Sofa Set","sofa-set",null,null,UP+"2026/08/Handcrafted-Sofa-Set-Luxury-Wooden-Fabric-Sofa-300x300.jpeg"],
  [6445,"Chinioti Sofa Design in Pakistan – Luxury Wooden Sofa Sets","chinioti-sofa-design","Sofa Set","sofa-set",null,null,UP+"2026/05/Untitled-design-18-300x300.jpg"],
  [6348,"Wall Mirror Frame for Home Decor – Luxury Wooden Mirror","wall-mirror-frame-decor-designo-chiniot","Console Table","console-table",null,null,UP+"2026/03/Wall-Mirror-Frame-Modern-Wooden-Decorative-Mirror-Frame-for-Home-300x300.jpeg"],
  [6337,"European Bed Storage Cabinet Luxury Wooden Bedroom Furniture","european-bed-storage-cabinet","Bookshelves Cabinets","bookshelves-cabinets",null,null,UP+"2026/03/European-Bed-Storage-Cabinet-Modern-Bedroom-Storage-Solution-1-300x300.jpeg"],
  [6333,"Modern Console Table Design – Elegant Entryway Furniture","console-table-modern-entryway","Console Table","console-table",null,null,UP+"2026/03/console-table-modern-entryway-1-300x300.jpeg"],
  [6305,"Solid Wood Console Table Modern Entryway & Hallway Furniture","solid-wood-console-table-entryway","Console Table","console-table",null,null,UP+"2026/03/solid-wood-console-table-entryway-modern-rustic-designs-1-300x300.jpeg"],
  [6294,"Luxury Wooden Baby Cart Educational Push Walker for Toddlers","solid-wood-baby-cart","Baby Cart","baby-cart",null,null,UP+"2026/02/Solid-Wood-Baby-Walker-–-Premium-Montessori-Wooden-Baby-Push-Cart-for-Toddlers-4-300x300.png"],
  [6274,"Solid Wood Jhoola Swing for Home, Garden & Balcony","best-wooden-jhoola-swing","Swing/Jholla","swing-jholla",null,null,UP+"2026/02/Best-Wooden-Jhoola-Swing-–-Premium-Solid-Wood-Swing-for-Home-Garden-Pakistan-1-300x300.jpeg"],
  [6220,"Luxury Wooden Jhula Swing for Home Decor Premium Indoor","wooden-jhula-for-home-decoration-pakistan","Swing/Jholla","swing-jholla",null,null,UP+"2026/02/Whisk_23d0b011b320ad193254e891f31e52e6dr-300x300.png"],
  [5797,"Bedroom Chair Comfortable & Stylish Seating for Modern Rooms","bedroom-chair-lounge-chair-for-bedroom","Bedroom Chairs","bedroom-chairs",null,null,UP+"2025/09/Bedroom-Chair-Lounge-Chair-for-Bedroom-–-Best-Reading-Chairs-Hanging-Chairs-for-Bedroom-Worldwide-300x300.jpg"],
  [5425,"Latest Wardrobe Design Trends for Modern Living","wardrobe-design-in-pakistan","Wardrobes","wardrobes",null,null,UP+"2025/08/Wardrobe-design-in-Pakistan-latest-modern-wardrobe-designs-for-bedroom-decor-designo-chiniot-300x300.jpg"],
  [5344,"Best Showcase Designs: Modern Interior Styling Ideas Guide","crockery-showcase-designs-in-pakistan","Showcase","showcase",null,null,UP+"2025/08/Crockery-Showcase-Designs-in-Pakistan-Wooden-Modern-Cabinets-decor-designo-furniture4-300x300.png"],
  [2214,"Safe Wooden Baby Cot Stylish Crib Design for Modern Homes","buy-luxury-wooden-baby-cot-in-pakistan","Baby Cart","baby-cart",null,null,UP+"2025/04/Buy-Luxury-Wooden-Baby-Cot-in-Pakistan-Decor-Designo-furniture-1-300x300.png"],
  [1874,"Wooden Baby Cot Premium Safe Cribs for Babies","wooden-baby-cot","Baby Cart","baby-cart",null,null,UP+"2025/03/Wooden-Baby-Cot-in-Pakistan-–-Durable-Safe-Cot-Designs-for-Newborns1-300x300.png"],
  [1313,"Home Box Shoe Rack Affordable Stylish Shoe Organizer","home-box-shoe-rack","Shoe Racks","shoe-racks",null,null,UP+"2025/02/Buy-Shoe-Rack-in-Pakistan-–-Stylish-Space-Saving-Shoe-Organizer-decor-designo-2-300x300.jpg"],
  [1310,"Luxury Wooden Shoe Rack Elegant Shoe Organizer for Home","luxury-wooden-shoe-rack","Shoe Racks","shoe-racks",null,null,UP+"2025/02/Buy-Shoe-Rack-in-Pakistan-–-Stylish-Space-Saving-Shoe-Organizer-decor-designo203-1-300x300.jpg"]
].map(r => ({
  id:r[0], name:r[1], slug:r[2], permalink:`https://decordesigno.com/product/${r[2]}/`,
  categories:[{name:r[3], slug:r[4]}],
  price:r[5], regular:r[6], image:r[7], srcset:"", backup:true
}));
