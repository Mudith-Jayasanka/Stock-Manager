# Implementation Plan

## 1. Technical Stack Overview
- **Frontend Framework:** Angular
- **Frontend Libraries:** 
  - `fabric.js` or `konva` (For building the interactive drag-and-drop label editor canvas).
  - `bwip-js` or similar (For generating Barcodes and QR codes entirely on the client-side).
  - Standard HTML/CSS Print Media Queries or `jspdf` (For rendering the final batch print layouts).
- **Backend Framework:** Node.js with TypeScript (Strict typing enabled).
- **Database:** PostgreSQL (Initially mocked via an in-memory data layer in Node).
- **Image Storage:** Base64 encoded strings stored directly in the database for simplicity.
- **Mock Database:** The initial in-memory mock layer must come pre-populated with realistic seed data (Container Types, Fragrances, Products, Customers, Orders, and Label Templates) to allow immediate testing of all features without manual data entry.

## ✅ 2. Phase 1: Foundation & Master Data
- Initialize the Angular workspace and Node.js backend.
- Implement the Mock Database service layer in Node.js.
- Create the **Master Data API** (Container Types, Fragrances).
- Build the **Master Data UI** (List, Add, Soft Delete).

## ✅ 3. Phase 2: Product Management
- Create the **Products API** and **UI** (Name, Price, Weight, Container, Fragrance array).
- Implement the 100% fragrance composition validation logic on both frontend and backend.

## ✅ 4. Phase 3: Order & Customer Management
- Create the **Customers API** (Omni-search, automatic creation, phone number sanitization).
- Create the **Orders API** and **UI**.
- Implement Order creation flow (lookup customer, select products).
- Build the Orders Dashboard (List view, Status filtering, bulk selection checkboxes).

## ✅ 5. Phase 4: Label Editor (The Canvas)
- Build the interactive drag-and-drop Canvas using the chosen 2D library.
- Implement Text and Image uploading/rendering.
- Implement Variable placeholders.
- Build the Sidebar Layer Manager (reordering z-index).
- Implement saving/loading templates from the database.

## ✅ 6. Phase 5: Mapping & Client-Side Printing
- Map global system variables (Order/Product attributes) to the canvas templates.
- Implement the client-side printing logic (mapping variables to objects, rendering canvas, converting to PDF/Image, triggering print).
- Expose single print in Order Details and Batch Printing in the Orders Dashboard.
  - Fetch selected Order(s) data.
  - Dynamically inject data into the canvas elements.
  - Generate the final multi-page print view and trigger `window.print()`.
