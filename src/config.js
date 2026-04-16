const env = import.meta.env;

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function toString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized.length ? normalized : fallback;
}

export const appConfig = {
  tasksVisionWasmUrl: toString(
    env.VITE_TASKS_VISION_WASM_URL,
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
  ),
  faceLandmarkerModelUrl: toString(
    env.VITE_FACE_LANDMARKER_MODEL_URL,
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
  ),
  streamTargetOrigin: toString(env.VITE_STREAM_TARGET_ORIGIN, "*"),
  streamAuthUser: toString(env.VITE_STREAM_AUTH_USER),
  streamAuthPassword: toString(env.VITE_STREAM_AUTH_PASSWORD),
  streamAuthToken: toString(env.VITE_STREAM_AUTH_TOKEN),
};

export const gazeConfig = {
  enableCursor: toBoolean(env.VITE_GAZE_ENABLE_CURSOR, true),
  smoothingAlpha: toNumber(env.VITE_GAZE_SMOOTHING_ALPHA, 0.12),
  sensitivityGain: toNumber(env.VITE_GAZE_SENSITIVITY_GAIN, 2.0),
  microOffsetGain: toNumber(env.VITE_GAZE_MICRO_OFFSET_GAIN, 2.2),
  dotSize: toNumber(env.VITE_GAZE_DOT_SIZE, 12),
  dotCoreSize: toNumber(env.VITE_GAZE_DOT_CORE_SIZE, 4),
  dotOpacity: toNumber(env.VITE_GAZE_DOT_OPACITY, 0.85),
  trailEnabled: toBoolean(env.VITE_GAZE_TRAIL_ENABLED, false),
  trailLength: toNumber(env.VITE_GAZE_TRAIL_LENGTH, 24),
  trailOpacity: toNumber(env.VITE_GAZE_TRAIL_OPACITY, 0.35),
  fixationEnabled: toBoolean(env.VITE_GAZE_FIXATION_ENABLED, true),
  fixationVelocityThreshold: toNumber(env.VITE_GAZE_FIXATION_VELOCITY_THRESHOLD, 0.003),
  fixationMinDurationMs: toNumber(env.VITE_GAZE_FIXATION_MIN_DURATION_MS, 120),
  streamingEnabled: toBoolean(env.VITE_GAZE_STREAMING_ENABLED, false),
};
