# ToneCraft AI - Project Documentation

## 1. Project Overview
**ToneCraft AI** is a web-based AI writing assistant that runs entirely within the user's browser. It allows users to rewrite text in different tones (Professional, Friendly, Polite) and formats (Email, Letter, Teams, etc.) using a local Large Language Model (LLM). 

Unlike traditional AI tools that send data to a cloud server, ToneCraft processes everything locally using the user's GPU. This ensures **100% data privacy** and **zero server costs**.

---

## 2. Tech Stack & Tools

### Core Frameworks
*   **Angular 21**: The latest version of the Angular framework using **Standalone Components** (no `NgModule`).
*   **TypeScript**: For type-safe development.
*   **Tailwind CSS v4**: For utility-first styling and dark mode support.

### AI & Machine Learning
*   **@mlc-ai/web-llm**: The core engine that enables running LLMs in the browser.
*   **WebGPU**: The browser API used to access the user's graphics card for AI acceleration.
*   **Llama-3.2-1B-Instruct**: The specific AI model used for text generation. It is quantized to `q4f16_1` (approx 600MB-1GB size) for fast browser performance.

### Development Tools
*   **Angular CLI**: Used for building, serving, and testing (`ng serve`, `ng build`).
*   **npm**: Package manager.
*   **ESBuild**: Used internally by Angular for fast builds.

---

## 3. Architecture

### How It Works
1.  **User Input**: The user types text into the Angular form.
2.  **Auto-Trigger**: A 1.5-second debounce detects when the user stops typing.
3.  **Content Check**: The text is scanned locally against a blocked words list.
4.  **Format Detection**: The system scans for keywords like "email", "letter", or "teams" to determine the output format.
5.  **Model Loading**: If the AI model isn't loaded, `web-llm` downloads it from the CDN and caches it in the browser (IndexedDB).
6.  **Inference**: The text is processed on the user's GPU using WebGPU.
7.  **Streaming**: Results are streamed back to the UI token-by-token for a real-time feel.

### Data Flow
`Browser UI` -> `Angular Component` -> `WebLLM Engine` -> `User GPU` -> `Result`

---

## 4. Key Features

*   **Zero-Latency Streaming**: Results appear as they are generated, rather than waiting for the full response.
*   **Automatic Format Detection**:
    *   Input contains "email" -> Output is an Email format.
    *   Input contains "letter" -> Output is a Letter format.
    *   Input contains "teams" -> Output is a Chat/Message format.
    *   Default -> Enhanced/Improved text.
*   **Content Filtering**: Blocks generation if inappropriate words (NSFW) are detected.
*   **Privacy First**: No data ever leaves the user's device.
*   **Dark Mode UI**: A modern, dark-themed interface designed for reduced eye strain.

---

## 5. Project Structure

```text
tonecraft-ui/
├── src/
│   ├── app/
│   │   ├── app.ts             # Main Component (Logic, AI Engine, State)
│   │   ├── app.html           # Main Template (UI Structure)
│   │   ├── app.config.ts      # Application Config (Routing)
│   │   └── app.routes.ts      # Routing definitions
│   ├── styles.css             # Global CSS + Tailwind Imports + Animations
│   └── main.ts                # Entry point
├── angular.json               # Angular Build Config
├── package.json               # Dependencies
└── tailwind.config.js         # Tailwind configuration
```

### Key Code Files
*   **`src/app/app.ts`**: Contains the `CreateMLCEngine` logic, prompt formatting, and the `generate()` method that handles streaming.
*   **`src/app/app.html`**: The UI layout, including the input box, result cards, and popup modals.

---

## 6. Getting Started (Development)

### Prerequisites
*   Node.js (v20 or higher)
*   A modern browser with WebGPU support (Chrome 113+, Edge, or Firefox Nightly).

### Installation & Running
1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd tonecraft-ui
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the server**:
    ```bash
    npm start
    ```
    *   Open `http://localhost:4200` in your browser.

---

## 7. Common Questions & Troubleshooting

**Q: Why is the model loading slow the first time?**
A: The browser must download the AI model (~600MB - 1GB) the first time. It is cached afterwards, so subsequent visits are instant.

**Q: Why does it say "Device lost" or fail to generate?**
A: The user's GPU might be out of memory (VRAM). Try closing other tabs or using a device with a dedicated graphics card.

**Q: Does this work on mobile (iPhone)?**
A: Most Android devices with Chrome work well. iPhones (iOS) generally do not support WebGPU yet, so it may not work on Safari.

**Q: How do I change the AI Model?**
A: In `src/app/app.ts`, look for `CreateMLCEngine`. Change `'Llama-3.2-1B-Instruct-q4f16_1-MLC'` to any other supported model ID from the `web-llm` library.

---

## 8. Deployment

Since this is a static application (no backend server needed), you can host it anywhere.

1.  **Build the project**:
    ```bash
    npm run build
    ```
2.  **Locate the files**:
    The optimized files will be in the `dist/tonecraft-UI/browser/` folder.
3.  **Upload**:
    Upload the contents of that folder to GitHub Pages, Vercel, Netlify, or any static host.
