# Order Management Requirements

## Overview
The application includes an Order Management system to track customer purchases from creation to delivery. This module is tailored for a business that crafts and ships physical products (e.g., Scented Candles) online.

## 1. Orders Dashboard (Listing Page)
The main view for managing all customer orders.
- **List View:** Displays all created orders with a quick preview of key details (e.g., Order ID, Customer Name, Total Price, Date Created, Current Status).
- **Filtering & Sorting:** Users can easily filter the list of orders by their current **Status**.
- **Quick Status Update:** Users can change the status of an order directly from the list view (e.g., via a dropdown) without having to click into the full order details.
- **Actions:** A "Create Order" button is prominently available to initiate a new manual order.

## 2. Order Creation Page
A dedicated page for manually inputting a new customer order.

### Customer Details
The system must collect the following information: Full Name, Email Address, Phone Number, and Shipping Address.

#### Customer Search & Auto-Creation Flow
To streamline order creation, the system implements an intelligent customer lookup and creation process:
- **Global Omni-Search:** The order creation form features a single search bar that queries existing customer records across *all* attributes simultaneously (Name, Email, Phone, Address). 
  - If an existing customer is selected from the search results, their details are instantly auto-filled into the order form.
- **Phone Number as Unique Identifier:** The phone number acts as the unique business identifier for a customer. 
  - **Sanitization:** All phone numbers entered into the system are automatically sanitized (e.g., spaces and dashes removed) to prevent duplicate profiles for the same customer.
  - **Database Architecture:** While the phone number is the unique lookup key (`UNIQUE` constraint), the database uses a standard auto-incrementing ID or UUID as the primary key. This allows a customer to safely change their phone number in the future without breaking historical order data.
- **Auto-Creation:** If the user enters customer details and submits an order with a phone number that does *not* exist in the database, the system will seamlessly create a new Customer profile in the background during the order creation process.

### Order Items (Products)
- Users can search for and select one or more existing **Products** from the catalog to add to the order.
- Users must be able to specify the **Quantity** for each selected product.

## 3. Order Status Workflow
Orders progress through a specific lifecycle. The statuses have been optimized for a "make-to-deliver" online business:

1. **Pending:** The order has been received, but work has not yet begun.
2. **Making / Processing:** The products within the order are actively being crafted.
3. **Packaging:** The products are finished, and the order is being packed for shipment.
4. **Dispatched / Shipped:** The packaged order has been handed over to the delivery courier.
5. **Delivered:** The order has successfully reached the customer.
6. **Cancelled:** The order was cancelled (this can be triggered at any stage prior to delivery).
