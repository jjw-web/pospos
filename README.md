# Bống Cà Phê - Point of Sale System

A modern, web-based Point of Sale (POS) system designed for Bống Cà Phê. It provides an elegant and responsive interface for managing orders and tables.

## Features

*   **Dual Table Layouts**: Separate management for indoor and outdoor seating areas.
*   **Order Management**: Easily add items to an order, update quantities, and process payments.
*   **Real-time Table Status**: Visually track whether tables are available or occupied.
*   **Sales History**: Review past transactions and bills.
*   **Responsive Design**: A fully responsive interface that works seamlessly on desktops, tablets, and mobile devices.
*   **Progressive Web App (PWA)**: The application can be installed on a device and works offline, ensuring reliability even with unstable internet connections.
*   **Automatic Updates**: The application automatically updates in the background to the latest version without user intervention.

## Technology Stack

*   **Frontend**: React 18, TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **State Management**: React Hooks & Context API
*   **PWA/Caching**: Service Workers via `vite-plugin-pwa`

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v16 or later)
*   npm (or a compatible package manager like Yarn)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jjw-web/pospos.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd pospos
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build, run:
```bash
npm run build
```
The optimized files will be located in the `dist` directory.

## Customization

### Menu and Tables
The menu items, categories, and initial table setup can be modified in the `constants.ts` file.

### Styling
Global styles, color schemes, and fonts can be customized in `index.css` and the `tailwind.config.js` file.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome. Please open an issue to discuss your ideas or submit a pull request with your changes.