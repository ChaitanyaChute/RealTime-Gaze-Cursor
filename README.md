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

## Environment Variables

Configure runtime behavior in .env.

| Variable | Description | Default |
| --- | --- | --- |
| VITE_TASKS_VISION_WASM_URL | MediaPipe Tasks Vision WASM base URL | jsdelivr URL |
| VITE_FACE_LANDMARKER_MODEL_URL | Face landmarker model URL | Google storage URL |
| VITE_STREAM_TARGET_ORIGIN | postMessage target origin for streaming | * |
| VITE_STREAM_AUTH_USER | Optional stream credential username | empty |
| VITE_STREAM_AUTH_PASSWORD | Optional stream credential password | empty |
| VITE_STREAM_AUTH_TOKEN | Optional stream credential token | empty |
| VITE_GAZE_ENABLE_CURSOR | Enable gaze dot | true |
| VITE_GAZE_SMOOTHING_ALPHA | EMA smoothing factor | 0.12 |
| VITE_GAZE_SENSITIVITY_GAIN | Cursor sensitivity multiplier | 2.0 |
| VITE_GAZE_MICRO_OFFSET_GAIN | Relative iris micro-motion amplification | 2.2 |
| VITE_GAZE_DOT_SIZE | Dot radius | 12 |
| VITE_GAZE_DOT_CORE_SIZE | Dot core radius | 4 |
| VITE_GAZE_DOT_OPACITY | Dot opacity | 0.85 |
| VITE_GAZE_TRAIL_ENABLED | Enable trail rendering | false |
| VITE_GAZE_TRAIL_LENGTH | Trail length | 24 |
| VITE_GAZE_TRAIL_OPACITY | Trail opacity | 0.35 |
| VITE_GAZE_FIXATION_ENABLED | Enable fixation ring | true |
| VITE_GAZE_FIXATION_VELOCITY_THRESHOLD | Velocity threshold for fixation state | 0.003 |
| VITE_GAZE_FIXATION_MIN_DURATION_MS | Minimum fixation duration | 120 |
| VITE_GAZE_STREAMING_ENABLED | Enable streaming payload posting | false |

## Usage Flow

1. Start camera.
2. Click Start calibration.
3. Follow and click each calibration target the required number of times.
4. Continue to overlay page after calibration completes.
5. Tune live settings for your session.

## Security Notes

- Do not commit .env.
- Any variable prefixed with VITE_ is exposed to browser runtime.
- Keep long-term secrets on a backend service, not in frontend env variables.

## Troubleshooting

- If webcam permission is denied, allow camera access and reload.
- If gaze drifts, run calibration again with better lighting and a steady head position.
- If model loading fails, confirm network access to configured WASM/model URLs.

## License

No license file is currently included. Add a LICENSE file if you plan to distribute this project.
