# Product Management Requirements

## Overview
The application includes a dedicated module for managing products. This module is currently tailored for a **Scented Candle** business.

## 1. Products Tab (Listing Page)
The main view for products displays a list of all previously created products.
- **Search:** Users can search for a specific product by name.
- **Filtering:** Users can sort and filter the list of products by:
  - Price
  - Profit (Calculated as: Price - Cost)
  - Created Date
- **Actions:** A "Create" button is prominently displayed to navigate to the Product Creation page.

## 2. Product Creation Page
A dedicated page to create a new candle product. It includes the following fields and functionalities:

### Basic Information
- **Name:** The name of the product.
- **Price:** The selling price of the product.
- **Cost:** The cost to produce the item.

### Physical Attributes
- **Weight:** The weight of the candle in grams.
- **Container Type:**
  - Users must select exactly one container type.
  - Options are dynamically fetched from the **Master Data** configuration.

### Fragrances (Composition)
- Users can add multiple fragrances to a single candle.
- **Selection:** Fragrance options are dynamically fetched from the **Master Data**. Users can only select from pre-configured fragrances.
- **Composition List:** As fragrances are added, they are rendered in a list below the selection area.
- **Percentage Allocation:** 
  - Users must set a percentage value for each added fragrance in the list.
  - **Validation Constraint:** The system must enforce that the sum of all fragrance percentages in the composition list adds up exactly to 100% before the product can be saved.
