# Requirements

This folder contains all the requirement documents and flow diagrams for the Custom Label Printer project.

## Documentation Standard
Any implementation change must be reflected in the relevant requirements document in this folder. Future development work should update requirements first or alongside code so these documents exactly mirror the current application behavior.

## Documents
- **[label_editor_requirements.md](./label_editor_requirements.md):** Requirements for the label designer, elements, and variables.
- **[product_management_requirements.md](./product_management_requirements.md):** Requirements for creating and managing products (specifically Scented Candles).
- **[master_data_requirements.md](./master_data_requirements.md):** Requirements for managing application configurations (Containers, Fragrances).
- **[order_management_requirements.md](./order_management_requirements.md):** Requirements for creating and tracking customer orders.

## Customer Management Requirements
Customer records can be viewed, searched, edited, and deleted from the Customers page.

- **Editing:** Users can edit customer full name, phone number, email, and address.
- **Soft Delete:** Customer deletion is implemented as a soft delete. Deleted customers are hidden from normal customer lists and search results but remain in the database so historical orders keep their customer relationship.
- **Audit Trail:** Every customer edit and delete must insert an immutable audit row in the database containing the customer ID, action, previous customer data, resulting customer data where applicable, and timestamp.
- **Phone Sanitization:** Edited phone numbers must be sanitized using the same phone normalization used during customer creation.
- **Uniqueness:** Edited phone numbers must remain unique across active, non-deleted customers.

## Database Schema Updates
The project uses `backend/src/db/setupDb.ts` as the central schema-management entry point. Any database table, column, index, constraint, or sequence change must be added there first, including an entry in its schema revision history. Apply schema changes by running the setup script directly; do not use one-off SQL scripts unless the user explicitly asks for an emergency/manual database operation.

## Flows
- **[label_editor_flow.puml](./label_editor_flow.puml):** Flow for designing labels.
- **[label_generation_flow.puml](./label_generation_flow.puml):** Flow for dynamically generating labels using variables.
- **[product_creation_flow.puml](./product_creation_flow.puml):** Flow for creating a product and validating fragrance percentages.
- **[master_data_flow.puml](./master_data_flow.puml):** Flow for adding and safely deleting master data items.
- **[order_management_flow.puml](./order_management_flow.puml):** Flow for creating orders and updating their lifecycle status.
