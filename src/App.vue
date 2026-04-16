<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 relative">
    <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.08),transparent_20%),radial-gradient(circle_at_60%_70%,rgba(168,85,247,0.08),transparent_22%)]"></div>

    <div class="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Usability Gaze Overlay</p>
        <h1 class="text-3xl font-semibold text-white">Real-time gaze cursor</h1>
        <p class="text-slate-300 max-w-2xl">
          Lightweight overlay that visualizes where the participant is looking during a session. Ideal for live demos,
          moderated testing, and quick qualitative reads.
        </p>
      </header>

      <section class="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <p class="text-sm text-slate-400">Tracking status</p>
            <div class="flex items-center gap-2">
              <span :class="['inline-flex h-3 w-3 rounded-full', statusDotClass]"></span>
              <span class="text-base">{{ statusLabel }}</span>
            </div>
            <p class="text-xs text-slate-400">Model: MediaPipe Tasks Vision Face Landmarker (iris)</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" class="rounded border-slate-600 bg-slate-800" v-model="mirror" />
              Mirror video (self-view)
            </label>
            <button
              type="button"
              class="px-4 py-2 rounded-xl font-semibold text-white shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              :class="webcamRunning ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-500 hover:bg-sky-600'"
              :disabled="loadingModel || calibration.active"
              @click="toggleWebcam"
            >
              {{ webcamRunning ? 'Stop camera' : 'Start camera' }}
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <div class="flex items-center gap-2">
            <span :class="['px-3 py-1 rounded-full', stage === 'calibration' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700 text-slate-300']">Page 1 · Calibration</span>
            <span class="h-px w-6 bg-slate-600"></span>
            <span :class="['px-3 py-1 rounded-full', stage === 'gaze' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700 text-slate-300']">Page 2 · Overlay</span>
          </div>
          <p class="text-slate-400">
            {{ calibration.ready ? 'Calibration complete. Overlay is unlocked.' : 'Calibration required before moving ahead.' }}
          </p>
        </div>

        <div v-if="stage === 'calibration'" class="grid gap-4 lg:grid-cols-2">
          <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-4">
            <h2 class="text-sm font-semibold text-slate-200 uppercase tracking-wide">Calibration required</h2>
            <p class="text-sm text-slate-300">
              Complete calibration first. Without calibration you cannot continue to the overlay page.
            </p>

            <div class="flex items-center gap-2 text-sm text-slate-300">
              <span class="inline-flex h-2.5 w-2.5 rounded-full" :class="calibration.ready ? 'bg-emerald-400' : 'bg-amber-400'"></span>
              <span>{{ calibration.ready ? 'Calibration ready' : calibration.active ? 'Calibrating…' : 'Waiting to calibrate' }}</span>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="px-3 py-2 rounded-lg font-semibold text-slate-900 bg-amber-300 hover:bg-amber-200 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="calibration.active || loadingModel"
                @click="startCalibration"
              >
                {{ calibration.active ? 'Calibrating…' : calibration.ready ? 'Recalibrate' : 'Start calibration' }}
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-lg font-semibold text-slate-900 bg-lime-300 hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!canProceedToGaze"
                @click="goToGaze"
              >
                Continue to overlay
              </button>
            </div>

            <p class="text-xs text-slate-400" v-if="!webcamRunning">
              Start the camera first, then run calibration.
            </p>
          </div>

          <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 class="text-sm font-semibold text-slate-200 uppercase tracking-wide">How to calibrate</h2>
            <ol class="text-sm text-slate-300 space-y-2 list-decimal list-inside">
              <li>Start camera.</li>
              <li>Click Start calibration.</li>
              <li>Look at each target and click it {{ calibration.clicksPerPoint }} times.</li>
              <li>When complete, Continue to overlay becomes enabled.</li>
            </ol>
            <div class="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300 space-y-1">
              <p>Targets: {{ calibration.points.length || 9 }}</p>
              <p>Clicks per target: {{ calibration.clicksPerPoint }}</p>
              <p>
                Current target:
                {{ calibration.active ? `${calibration.index + 1} / ${calibration.points.length}` : calibration.ready ? 'Done' : 'Not started' }}
              </p>
            </div>
            <p class="text-xs text-slate-400">Tip: Keep your head still and maintain even lighting for better accuracy.</p>
          </div>
        </div>

        <div v-else class="grid gap-4 lg:grid-cols-2">
          <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-slate-200 uppercase tracking-wide">Overlay page</h2>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:border-slate-400"
                @click="goToCalibration"
              >
                Back to calibration
              </button>
            </div>
            <p>The gaze dot follows iris movement and maps to viewport coordinates.</p>
            <p>Everything runs in-browser; no video data is uploaded.</p>
            <p v-if="!webcamRunning" class="text-amber-300">Camera is off. Start camera to see the live overlay.</p>
            <ul class="space-y-2 list-disc list-inside">
              <li>Recalibrate anytime if tracking drifts.</li>
              <li>Use mirrored mode when user expects self-view.</li>
              <li>Smoothing helps reduce jitter in live demos.</li>
            </ul>
          </div>

          <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 space-y-4">
            <h2 class="text-sm font-semibold uppercase tracking-wide">Live settings</h2>

            <div class="space-y-3">
              <label class="flex items-center justify-between gap-3">
                <span class="text-slate-300">Show cursor</span>
                <input type="checkbox" class="rounded border-slate-600 bg-slate-800" v-model="settings.enableCursor" />
              </label>

              <label class="flex items-center justify-between gap-3">
                <span class="text-slate-300">Trail</span>
                <input type="checkbox" class="rounded border-slate-600 bg-slate-800" v-model="settings.trailEnabled" />
              </label>

              <label class="flex items-center justify-between gap-3">
                <span class="text-slate-300">Fixation ring</span>
                <input type="checkbox" class="rounded border-slate-600 bg-slate-800" v-model="settings.fixationEnabled" />
              </label>

              <label class="flex items-center justify-between gap-3">
                <span class="text-slate-300">Streaming hook</span>
                <input type="checkbox" class="rounded border-slate-600 bg-slate-800" v-model="settings.streamingEnabled" />
              </label>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Smoothing (EMA)</span>
                <span>{{ settings.smoothingAlpha.toFixed(2) }}</span>
              </div>
              <input type="range" min="0" max="0.9" step="0.02" class="w-full" v-model.number="settings.smoothingAlpha" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Sensitivity gain</span>
                <span>{{ settings.sensitivityGain.toFixed(2) }}×</span>
              </div>
              <input type="range" min="0.6" max="3" step="0.05" class="w-full" v-model.number="settings.sensitivityGain" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Micro offset gain</span>
                <span>{{ settings.microOffsetGain.toFixed(2) }}×</span>
              </div>
              <input type="range" min="1" max="3.5" step="0.05" class="w-full" v-model.number="settings.microOffsetGain" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Dot size</span>
                <span>{{ settings.dotSize }} px</span>
              </div>
              <input type="range" min="4" max="36" step="1" class="w-full" v-model.number="settings.dotSize" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Dot opacity</span>
                <span>{{ settings.dotOpacity.toFixed(2) }}</span>
              </div>
              <input type="range" min="0.05" max="1" step="0.05" class="w-full" v-model.number="settings.dotOpacity" />
            </div>

            <div class="space-y-2" v-if="settings.trailEnabled">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Trail length</span>
                <span>{{ settings.trailLength }}</span>
              </div>
              <input type="range" min="4" max="48" step="1" class="w-full" v-model.number="settings.trailLength" />

              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Trail opacity</span>
                <span>{{ settings.trailOpacity.toFixed(2) }}</span>
              </div>
              <input type="range" min="0.05" max="0.8" step="0.05" class="w-full" v-model.number="settings.trailOpacity" />
            </div>

            <div class="space-y-2" v-if="settings.fixationEnabled">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Fixation velocity</span>
                <span>{{ settings.fixationVelocityThreshold.toFixed(3) }}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.02"
                step="0.001"
                class="w-full"
                v-model.number="settings.fixationVelocityThreshold"
              />

              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Fixation duration</span>
                <span>{{ settings.fixationMinDurationMs }} ms</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                class="w-full"
                v-model.number="settings.fixationMinDurationMs"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    <video
      ref="videoRef"
      class="fixed bottom-4 left-4 w-48 rounded-lg shadow-lg border border-slate-700 bg-slate-900/80"
      :class="{ 'scale-x-[-1]': mirror }"
      autoplay
      playsinline
      muted
    ></video>

    <canvas ref="overlayCanvasRef" class="pointer-events-none fixed inset-0"></canvas>

    <div
      v-if="calibration.active"
      class="pointer-events-none fixed inset-0 flex items-center justify-center text-sm text-white"
    >
      <div class="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
        <span class="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span>
          Point {{ calibration.index + 1 }} / {{ calibration.points.length }} — click the target {{ calibration.clicksPerPoint }}
          times
        </span>
      </div>
    </div>

    <div
      v-if="calibration.active"
      class="pointer-events-auto fixed inset-0 cursor-crosshair"
      @click="handleCalibrationClick"
      aria-hidden="true"
    >
      <div
        class="absolute rounded-full border-2 border-amber-300 bg-amber-200/30 shadow-lg"
        :style="calibrationTargetStyle"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { appConfig, gazeConfig } from "./config";

const videoRef = ref(null);
const overlayCanvasRef = ref(null);

const modelReady = ref(false);
const webcamRunning = ref(false);
const mirror = ref(true);
const stage = ref("calibration");

const settings = reactive({ ...gazeConfig });

const calibration = reactive({
  active: false,
  index: 0,
  points: [],
  samples: [],
  allSamples: [],
  clickCount: 0,
  clicksPerPoint: 5,
  coeffs: {
    ax: window.innerWidth,
    bx: 0,
    cx: 0,
    ay: 0,
    by: window.innerHeight,
    cy: 0,
  },
  ready: false,
});

let smoothedX = 0;
let smoothedY = 0;
const trail = [];
let lastPoint = null;
let fixationStart = null;
let isFixating = false;
let lastDrawPoint = null;
let lastDrawTime = 0;

let faceLandmarker = null;
let lastVideoTime = -1;
let rafId = null;
let mediaStream = null;
let lastRawIris = null;
let loadingModel = false;

const LEFT_IRIS = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];
const LEFT_EYE_CORNERS = [33, 133];
const RIGHT_EYE_CORNERS = [362, 263];
const LEFT_EYE_LIDS = [159, 145];
const RIGHT_EYE_LIDS = [386, 374];

const statusLabel = computed(() => {
  if (!modelReady.value) return "Loading model";
  if (webcamRunning.value && stage.value === "gaze" && calibration.ready) return "Overlay running";
  if (webcamRunning.value) return "Camera running";
  return "Idle";
});

const statusDotClass = computed(() => {
  if (!modelReady.value) return "bg-amber-400 animate-pulse";
  if (webcamRunning.value) return "bg-emerald-400";
  return "bg-slate-500";
});

const canProceedToGaze = computed(() => calibration.ready && webcamRunning.value);

const calibrationTargetStyle = computed(() => {
  const target = calibration.points[calibration.index];
  if (!calibration.active || !target) return {};
  const size = 26;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${target.x - size / 2}px`,
    top: `${target.y - size / 2}px`,
  };
});

onMounted(async () => {
  setupCanvas();
  window.addEventListener("resize", setupCanvas);
  buildCalibrationPoints();
  await loadModel();
});

watch(
  () => settings.trailEnabled,
  (enabled) => {
    if (!enabled) trail.length = 0;
  }
);

watch(
  () => calibration.ready,
  (ready) => {
    if (!ready && stage.value === "gaze") {
      stage.value = "calibration";
    }
  }
);

watch(stage, (nextStage) => {
  if (nextStage !== "gaze") {
    trail.length = 0;
    clearOverlay();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", setupCanvas);
  stopWebcam();
  if (rafId) cancelAnimationFrame(rafId);
  if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
});

function setupCanvas() {
  const canvas = overlayCanvasRef.value;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  buildCalibrationPoints();
}

async function loadModel() {
  if (loadingModel) return;
  loadingModel = true;
  try {
    const vision = await import("@mediapipe/tasks-vision");
    const { FaceLandmarker, FilesetResolver } = vision;
    const filesetResolver = await FilesetResolver.forVisionTasks(appConfig.tasksVisionWasmUrl);

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: appConfig.faceLandmarkerModelUrl,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      minFaceDetectionConfidence: 0.15,
      minFacePresenceConfidence: 0.2,
      minTrackingConfidence: 0.2,
      outputFaceBlendshapes: false,
      outputFaceTransformationMatrixes: false,
    });

    modelReady.value = true;
  } catch (err) {
    console.error("Failed to load FaceLandmarker", err);
    modelReady.value = false;
  }
  loadingModel = false;
}

async function toggleWebcam() {
  if (webcamRunning.value) {
    stopWebcam();
  } else {
    await startWebcam();
  }
}

function goToCalibration() {
  stage.value = "calibration";
}

function goToGaze() {
  if (!canProceedToGaze.value) return;
  stage.value = "gaze";
}

async function startWebcam() {
  if (!faceLandmarker) await loadModel();
  if (!faceLandmarker) return;

  const constraintsHd = { video: { width: 1280, height: 720, facingMode: "user" } };
  const constraintsSd = { video: { width: 640, height: 480, facingMode: "user" } };
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia(constraintsHd);
  } catch (err) {
    console.warn("HD camera stream unavailable, falling back to SD", err);
    mediaStream = await navigator.mediaDevices.getUserMedia(constraintsSd);
  }
  const video = videoRef.value;
  if (!video) return;

  video.srcObject = mediaStream;
  video.onloadeddata = async () => {
    try {
      await video.play();
    } catch (err) {
      console.error("Video play failed", err);
    }
    webcamRunning.value = true;
    predictLoop();
  };
}

function stopWebcam() {
  webcamRunning.value = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  clearOverlay();
}

function predictLoop() {
  if (!webcamRunning.value) return;

  const video = videoRef.value;
  const canvas = overlayCanvasRef.value;
  if (!video || !canvas) return;

  const startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const results = faceLandmarker.detectForVideo(video, startTimeMs);
    renderGaze({ faceLandmarks: results.faceLandmarks });
  }

  rafId = requestAnimationFrame(predictLoop);
}

function renderGaze(results) {
  const canvas = overlayCanvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;

  const now = performance.now();
  const overlayUnlocked = stage.value === "gaze" && calibration.ready;

  const landmarks = results?.faceLandmarks?.[0];

  if (!landmarks) {
    if (overlayUnlocked && lastDrawPoint && now - lastDrawTime < 200) {
      clearOverlay();
      drawPersisted(ctx);
    } else {
      clearOverlay();
    }
    return;
  }
  const irisRaw = averageIris(landmarks);
  if (!irisRaw) return;

  const irisStable = stabilizedIris(landmarks) || irisRaw;
  lastRawIris = irisRaw;

  const mapped = mapCalibrated(irisRaw);
  const withMicro = addMicroDelta(mapped, irisStable);
  const boosted = applyGain(withMicro);
  const smoothed = smooth(boosted);

  if (!overlayUnlocked) {
    clearOverlay();
    return;
  }

  handleFixation(smoothed);
  updateTrail(smoothed);

  clearOverlay();
  if (settings.trailEnabled) drawTrail(ctx);
  if (settings.enableCursor) drawDot(ctx, smoothed, isFixating);
  if (settings.streamingEnabled) streamGaze(smoothed);

  lastDrawPoint = smoothed;
  lastDrawTime = now;
}

function averageIris(landmarks) {
  const left = centroid(landmarks, LEFT_IRIS);
  const right = centroid(landmarks, RIGHT_IRIS);
  if (!left || !right) return null;
  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2,
  };
}

function stabilizedIris(landmarks) {
  const left = eyeSignal(landmarks, LEFT_IRIS, LEFT_EYE_CORNERS, LEFT_EYE_LIDS);
  const right = eyeSignal(landmarks, RIGHT_IRIS, RIGHT_EYE_CORNERS, RIGHT_EYE_LIDS);
  if (left && right) {
    const gain = settings.microOffsetGain ?? 1;
    const x = 0.5 + ((left.x + right.x) / 2) * gain;
    const y = 0.5 + ((left.y + right.y) / 2) * gain;
    return clamp01({ x, y });
  }
  return averageIris(landmarks);
}

function addMicroDelta(point, stabilized) {
  if (!stabilized) return point;
  const dx = stabilized.x - 0.5;
  const dy = stabilized.y - 0.5;
  const scale = 0.12 * Math.min(window.innerWidth, window.innerHeight);
  return clampToViewport({ x: point.x + dx * scale, y: point.y + dy * scale });
}

function eyeSignal(landmarks, irisIndices, cornerIndices, lidIndices) {
  const iris = centroid(landmarks, irisIndices);
  const cornerA = landmarks[cornerIndices[0]];
  const cornerB = landmarks[cornerIndices[1]];
  const lidTop = landmarks[lidIndices[0]];
  const lidBottom = landmarks[lidIndices[1]];
  if (!iris || !cornerA || !cornerB || !lidTop || !lidBottom) return null;

  const cx = (cornerA.x + cornerB.x) / 2;
  const cy = (lidTop.y + lidBottom.y) / 2;
  const width = distance(cornerA, cornerB) || 1e-4;
  const height = distance(lidTop, lidBottom) || width * 0.6;

  return {
    x: (iris.x - cx) / width,
    y: (iris.y - cy) / height,
  };
}

function centroid(landmarks, indices) {
  let x = 0;
  let y = 0;
  for (const idx of indices) {
    const point = landmarks[idx];
    if (!point) return null;
    x += point.x;
    y += point.y;
  }
  return { x: x / indices.length, y: y / indices.length };
}

function distance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp01(point) {
  return {
    x: Math.max(0, Math.min(1, point.x)),
    y: Math.max(0, Math.min(1, point.y)),
  };
}

function mapCalibrated(point) {
  const normX = mirror.value ? 1 - point.x : point.x;
  const normY = point.y;

  const { ax, bx, cx, ay, by, cy } = calibration.coeffs;
  const x = ax * normX + bx * normY + cx;
  const y = ay * normX + by * normY + cy;

  return {
    x: Math.max(0, Math.min(window.innerWidth, x)),
    y: Math.max(0, Math.min(window.innerHeight, y)),
  };
}

function smooth(point) {
  smoothedX = smoothedX + settings.smoothingAlpha * (point.x - smoothedX);
  smoothedY = smoothedY + settings.smoothingAlpha * (point.y - smoothedY);
  return { x: smoothedX, y: smoothedY };
}

function applyGain(point) {
  const gain = settings.sensitivityGain ?? 1;
  if (gain === 1) return point;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const x = cx + (point.x - cx) * gain;
  const y = cy + (point.y - cy) * gain;
  return clampToViewport({ x, y });
}

function clampToViewport(p) {
  return {
    x: Math.max(0, Math.min(window.innerWidth, p.x)),
    y: Math.max(0, Math.min(window.innerHeight, p.y)),
  };
}

function drawPersisted(ctx) {
  if (!lastDrawPoint) return;
  if (settings.trailEnabled) drawTrail(ctx);
  if (settings.enableCursor) drawDot(ctx, lastDrawPoint, isFixating);
}

function updateTrail(point) {
  if (!settings.trailEnabled) return;
  trail.push({ ...point });
  if (trail.length > settings.trailLength) trail.shift();
}

function drawTrail(ctx) {
  const n = trail.length;
  for (let i = 0; i < n; i++) {
    const p = trail[i];
    const t = i / n;
    const alpha = settings.trailOpacity * t;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 * t + 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
    ctx.fill();
  }
}

function handleFixation(point) {
  if (!settings.fixationEnabled) {
    isFixating = false;
    lastPoint = point;
    fixationStart = null;
    return;
  }

  if (!lastPoint) {
    lastPoint = point;
    fixationStart = performance.now();
    return;
  }

  const dx = point.x - lastPoint.x;
  const dy = point.y - lastPoint.y;
  const dist = Math.hypot(dx, dy);
  const dt = 16.67;
  const velocity = dist / dt;

  const now = performance.now();
  if (velocity < settings.fixationVelocityThreshold) {
    if (!fixationStart) fixationStart = now;
    isFixating = now - fixationStart >= settings.fixationMinDurationMs;
  } else {
    fixationStart = now;
    isFixating = false;
  }

  lastPoint = point;
}

function buildCalibrationPoints() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const xs = [0.1, 0.5, 0.9];
  const ys = [0.1, 0.5, 0.9];
  calibration.points = [];
  for (const y of ys) {
    for (const x of xs) {
      calibration.points.push({ x: w * x, y: h * y });
    }
  }
}

async function startCalibration() {
  if (calibration.active) return;
  if (!webcamRunning.value) {
    await startWebcam();
  }
  if (!webcamRunning.value) return;

  buildCalibrationPoints();
  stage.value = "calibration";
  calibration.active = true;
  calibration.ready = false;
  calibration.index = 0;
  calibration.samples = [];
  calibration.allSamples = [];
  calibration.clickCount = 0;
  calibration.coeffs = {
    ax: window.innerWidth,
    bx: 0,
    cx: 0,
    ay: 0,
    by: window.innerHeight,
    cy: 0,
  };
}

function handleCalibrationClick() {
  if (!calibration.active || !calibration.points.length || !lastRawIris) return;
  const target = calibration.points[calibration.index];
  if (!target) return;

  const normX = mirror.value ? 1 - lastRawIris.x : lastRawIris.x;
  const normY = lastRawIris.y;

  calibration.samples.push({ rawX: normX, rawY: normY, targetX: target.x, targetY: target.y });
  calibration.allSamples.push({ rawX: normX, rawY: normY, targetX: target.x, targetY: target.y });
  calibration.clickCount += 1;

  if (calibration.clickCount >= calibration.clicksPerPoint) {
    calibration.index += 1;
    calibration.clickCount = 0;
    calibration.samples = [];
    if (calibration.index >= calibration.points.length) {
      finalizeCalibration();
    }
  }
}

function finalizeCalibration() {
  const rawsX = calibration.allSamples.map((s) => s.rawX);
  const rawsY = calibration.allSamples.map((s) => s.rawY);
  const targetsX = calibration.allSamples.map((s) => s.targetX);
  const targetsY = calibration.allSamples.map((s) => s.targetY);

  if (rawsX.length < 4) {
    calibration.active = false;
    calibration.ready = false;
    calibration.samples = [];
    calibration.allSamples = [];
    calibration.clickCount = 0;
    calibration.index = 0;
    return;
  }

  const solution = solveAffine2D(rawsX, rawsY, targetsX, targetsY);
  if (solution) {
    calibration.coeffs = solution;
  }
  calibration.active = false;
  calibration.ready = true;
  calibration.samples = [];
  calibration.allSamples = [];
  calibration.clickCount = 0;
  calibration.index = 0;
}

function solveAffine2D(rawXs, rawYs, tgtXs, tgtYs) {
  if (rawXs.length !== rawYs.length || rawXs.length !== tgtXs.length || rawXs.length !== tgtYs.length) return null;
  const n = rawXs.length;
  if (n < 3) return null;

  let Sxx = 0,
    Syy = 0,
    Sxy = 0,
    Sx = 0,
    Sy = 0,
    Stx = 0,
    Sty = 0,
    Sxtx = 0,
    Sytx = 0,
    Sxty = 0,
    Syty = 0;

  for (let i = 0; i < n; i++) {
    const x = rawXs[i];
    const y = rawYs[i];
    const tx = tgtXs[i];
    const ty = tgtYs[i];
    Sxx += x * x;
    Syy += y * y;
    Sxy += x * y;
    Sx += x;
    Sy += y;
    Stx += tx;
    Sty += ty;
    Sxtx += x * tx;
    Sytx += y * tx;
    Sxty += x * ty;
    Syty += y * ty;
  }

  const M = [
    [Sxx, Sxy, Sx],
    [Sxy, Syy, Sy],
    [Sx, Sy, n],
  ];

  const vx = [Sxtx, Sytx, Stx];
  const vy = [Sxty, Syty, Sty];

  const solX = solve3x3(M, vx);
  const solY = solve3x3(M, vy);
  if (!solX || !solY) return null;

  return {
    ax: solX[0],
    bx: solX[1],
    cx: solX[2],
    ay: solY[0],
    by: solY[1],
    cy: solY[2],
  };
}

function solve3x3(mat, vec) {
  const m = mat.map((row) => [...row]);
  const v = [...vec];
  const n = 3;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    let maxAbs = Math.abs(m[i][i]);
    for (let r = i + 1; r < n; r++) {
      const val = Math.abs(m[r][i]);
      if (val > maxAbs) {
        maxAbs = val;
        pivot = r;
      }
    }
    if (maxAbs < 1e-9) return null;
    if (pivot !== i) {
      [m[i], m[pivot]] = [m[pivot], m[i]];
      [v[i], v[pivot]] = [v[pivot], v[i]];
    }
    const div = m[i][i];
    for (let c = i; c < n; c++) m[i][c] /= div;
    v[i] /= div;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const factor = m[r][i];
      for (let c = i; c < n; c++) m[r][c] -= factor * m[i][c];
      v[r] -= factor * v[i];
    }
  }
  return v;
}

function clearOverlay() {
  const canvas = overlayCanvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawDot(ctx, point, fixating) {
  const size = settings.dotSize;
  const core = settings.dotCoreSize;
  const opacity = settings.dotOpacity;

  ctx.beginPath();
  ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 1.6);
  gradient.addColorStop(0, `rgba(56, 189, 248, ${opacity})`);
  gradient.addColorStop(1, `rgba(56, 189, 248, ${0.08 * opacity})`);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(point.x, point.y, core, 0, Math.PI * 2);
  ctx.fillStyle = "#0ea5e9";
  ctx.fill();

  if (fixating) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, size * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function streamGaze(point) {
  if (!settings.streamingEnabled || !window?.opener) return;

  const payload = { type: "gaze", point };
  const hasCredential = appConfig.streamAuthUser || appConfig.streamAuthPassword || appConfig.streamAuthToken;
  if (hasCredential) {
    payload.credentials = {
      user: appConfig.streamAuthUser,
      password: appConfig.streamAuthPassword,
      token: appConfig.streamAuthToken,
    };
  }

  window.opener.postMessage(payload, appConfig.streamTargetOrigin);
}
</script>
