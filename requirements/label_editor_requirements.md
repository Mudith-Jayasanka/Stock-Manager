# Label Editor Requirements

## Overview
The core feature of the application is the ability to design and create custom labels through an interactive editor.

## Key Features

### 1. Label Initialization
- Users must be able to set the physical dimensions (**width** and **height**) of the label when creating it.

### 2. Interactive Workspace
- An interactive screen/canvas that visually represents the label based on the specified dimensions.

### 3. Element Types
- **Text Elements:**
  - Users can add text elements to the label.
  - **Formatting:** Control over font family, font size, and text weight (bold).
  - **Interactivity:** 
    - Click to select the text element.
    - Click and drag to move the text across the canvas.
- **Image Elements:**
  - Users can add image elements to the label.
  - **Interactivity:** Images can be resized and moved across the canvas.
- **Variable Elements:**
  - Dynamic placeholders that map to data passed during a separate generation phase. They behave like standard UI elements (can be resized, moved, removed, and reordered).
  - All variables take **text** as their input source.
  - **Text Variable:** Dynamically renders the passed text data.
  - **Barcode Variable:** Converts the passed text into a barcode image (text must adhere to standard barcode constraints).
  - **QR Code Variable:** Converts the passed text into a QR code image.

### 4. Element Management (Sidebar)
- A sidebar that displays a list of all elements (text, images) currently added to the label workspace.
- **Layering (Z-Index):** The rendering order of elements on the canvas corresponds to their order in the sidebar list.
- **Reordering:** Users can reorder elements within the sidebar. Changing the order in the sidebar immediately updates the visual rendering order on the canvas (e.g., bringing an element forward or sending it backward).

### 5. Saving and Loading
- **Saving:** Users can save their current label design. This will save the label's dimensions, along with all the elements (text, images, variables) and their associated properties (position, size, styling, layer order).
- **Loading:** Users can load previously saved label designs to continue editing them. Loading a label restores the canvas dimensions, elements, and layer orders exactly as they were saved.

### 6. Data Mapping (Global Configuration)
- **Mapping Variables:** When saving a label template, users can map the template's variable elements to specific system data fields (e.g., mapping "Var1" to `Order.Customer.FullName`, or "Var2" to `Product.Price`).
- **Global Persistence:** This mapping is saved globally at the template level. Once a template's variables are mapped, they will automatically pull the correct data anytime this template is used for printing, ensuring consistency across all orders.

### 7. Label Generation (Dynamic Output)
- **Generation Flow:** The system takes a saved label template and injects live data (from Orders or Products) into the mapped variable elements.
- **Image Generation:** The system populates the placeholders with the actual content (text, rendered barcode, rendered QR code) and outputs a final, unique label image (or PDF) ready for printing.
