# Requirements

This folder contains all the requirement documents and flow diagrams for the Custom Label Printer project.

## Documents
- **[label_editor_requirements.md](./label_editor_requirements.md):** Requirements for the label designer, elements, and variables.
- **[product_management_requirements.md](./product_management_requirements.md):** Requirements for creating and managing products (specifically Scented Candles).
- **[master_data_requirements.md](./master_data_requirements.md):** Requirements for managing application configurations (Containers, Fragrances).
- **[order_management_requirements.md](./order_management_requirements.md):** Requirements for creating and tracking customer orders.

## Database Schema Updates
The project uses `backend/src/db/setupDb.ts` as the central schema-management entry point. Any database table, column, index, constraint, or sequence change must be added there first, including an entry in its schema revision history. Apply schema changes by running the setup script directly; do not use one-off SQL scripts unless the user explicitly asks for an emergency/manual database operation.

## Flows
- **[label_editor_flow.puml](./label_editor_flow.puml):** Flow for designing labels.
- **[label_generation_flow.puml](./label_generation_flow.puml):** Flow for dynamically generating labels using variables.
- **[product_creation_flow.puml](./product_creation_flow.puml):** Flow for creating a product and validating fragrance percentages.
- **[master_data_flow.puml](./master_data_flow.puml):** Flow for adding and safely deleting master data items.
- **[order_management_flow.puml](./order_management_flow.puml):** Flow for creating orders and updating their lifecycle status.
