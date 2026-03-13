# GameVault 🎮

GameVault is a premium, web-based game store prototype built with **React**, **Vite**, and **Tailwind CSS**. It features a modular architecture, responsive design, and a unique multi-theme system that allows users to switch between four distinct UI styles instantly.

## ✨ Key Features

-   **4 Distinct UI Themes**: Minimal, Futuristic, Apple-style, and Cyberpunk.
-   **Dynamic Gaming Store**: Browse popular, featured, and most-played games.
-   **Responsive Layout**: Fully optimized for Desktop, Tablet, and Mobile views.
-   **Modular Components**: Built with reusable React components using Tailwind's latest theme variables.
-   **Mock Data Integration**: Pre-populated with rich game data, user stats, and categories.
-   **Navigation**: Full routing for Store, Library, Profile, settings, and Game Details.

---

## 🎨 The 4 UI Style Prototypes

GameVault showcases the flexibility of modern CSS-in-JS and Tailwind variables through four radically different design aesthetics:

### 1. Minimal (Developer Portfolio Style)
A clean, monochrome interface with ample whitespace and sharp edges. Focuses on content and typography with a professional, distraction-free aesthetic.

### 2. Futuristic Gaming Interface
A dark-mode experience featuring neon blue accents, glowing elements, and "Orbitron" typography. Perfect for a high-tech gaming dashboard.

### 3. Apple-like Clean UI
Inspired by iOS/macOS design systems. Features soft gray backgrounds, elegant typography, high border-radius (rounded corners), and subtle glassmorphism effects.

### 4. Dark Cyberpunk Gaming Interface
A high-contrast, aggressive design using black backgrounds with raw yellow and pink neon accents. Features monospace fonts and a "glitchy" digital vibe.

---

## 🛠️ Technology Stack

-   **Core**: React 19 (Vite)
-   **Styling**: Tailwind CSS v4 (using CSS variables for themes)
-   **Icons**: Lucide React
-   **Routing**: React Router Dom
-   **State Management**: React Context API (Theme Persistence)

---

## 🚀 Getting Started

To run the frontend prototype locally:

1.  Navigate to the frontend directory:
    ```bash
    cd GameVault/frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser at `http://localhost:5173`.

---

## 📂 Project Structure

-   `src/components/layout`: Common layout elements like Navbar and Footer.
-   `src/components/ui`: Reusable UI elements (GameCard, Buttons, GameRow).
-   `src/contexts`: Theme management and global state.
-   `src/data`: Mock data for games and users.
-   `src/pages`: Main page views (Home, Library, Profile, etc.).
-   `src/index.css`: Implementation of the 4 design systems via CSS variables.

---

Designed and developed as a modern frontend demonstration of **GameVault**.
