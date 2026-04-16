# Face Landmarker Vue

Real-time gaze overlay web app built with Vue 3, Vite, Tailwind CSS, and MediaPipe Tasks Vision.

## Overview

This project tracks face landmarks from the webcam, calibrates eye input against screen targets, and renders a live gaze cursor overlay.

The UX is split into two required steps:

1. Calibration page
2. Overlay page

Users must complete calibration before they can move forward to overlay mode.

## Features

- Calibration-gated flow (cannot proceed to overlay before calibration)
- Real-time gaze cursor rendering
- Optional trail and fixation ring visualization
- Adjustable smoothing, gain, opacity, and size controls
- Webcam mirror mode toggle
- Optional streaming payload support for parent window messaging
- Environment-driven runtime configuration

## Tech Stack

- Vue 3
- Vite
- Tailwind CSS + PostCSS
- MediaPipe Tasks Vision

## Project Structure

```text
.
|- index.html
|- package.json
|- postcss.config.js
|- tailwind.config.js
|- vite.config.js
|- .env.example
|- src/
|  |- App.vue
|  |- config.js
|  |- main.js
|  |- assets/
|     |- main.css
```

## Prerequisites

- Node.js 18+
- npm 9+
- Webcam access in browser

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
cp .env.example .env
```

If you are on Windows Command Prompt:

```bat
copy .env.example .env
```

If you are on PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Start development server:

```bash
npm run dev
```

4. Open the local URL shown by Vite.

## Build and Preview

Build production assets:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Usage Flow

1. Start camera.
2. Click Start calibration.
3. Follow and click each calibration target the required number of times.
4. Continue to overlay page after calibration completes.
5. Tune live settings for your session.

