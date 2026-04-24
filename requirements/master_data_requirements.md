# Master Data Requirements

## Overview
A dedicated "Master Data" tab exists to manage the global configurations and lookup values used throughout the application (such as when creating Products).

## Current Master Data Entities
1. **Container Types**
2. **Fragrances**

## Features & Capabilities
### Viewing and Adding
- **View:** Users can select a specific attribute (e.g., Container Types) to view a list of all existing configurations.
  - **Usage Counts:** The UI list must display a "Usage Count" next to each item (e.g., "Lavender - Used in 5 products"). This provides immediate transparency on the item's footprint.
- **Add:** Users can add a new configuration by simply providing the text string for the new type.

### Archiving (Soft Deletes) & Data Integrity
Instead of permanently destroying records that are in use, the system utilizes a "Soft Delete" approach.
- **Archive Action:** When a user clicks "Delete" on an item, the system checks for dependencies.
- **Handling Deletions:**
  - **If NOT in use:** The item can be safely hard-deleted from the database.
  - **If IN USE:** The item is "Archived" by being marked as inactive (`isActive = false`) rather than being destroyed.
- **Impact of Archiving:** Inactive items are filtered out and hidden from dropdown menus when creating *new* products. However, they are preserved in the database to maintain the historical integrity and associations of previously created products.

## Database Architecture Standard
- **Distinct Tables:** Master data entities must be stored in their own distinct database tables (e.g., `container_types` table, `fragrances` table) rather than a single generic key-value table. This ensures strong foreign key constraints and allows for entity-specific metadata scaling in the future.
