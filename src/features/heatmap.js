// Heatmap paint configuration for incident visualization
export const heatmapPaint = {
  // weight of each point in the heat calculation is based on "severity"
  "heatmap-weight": [
    "interpolate",
    ["linear"],
    ["coalesce", ["get", "severity"], 1],
    0, 0,
    1, 0.2,
    3, 0.6,
    5, 1.0
  ],

  // overall intensity changes with zoom
  "heatmap-intensity": [
    "interpolate",
    ["linear"],
    ["zoom"],
    0, 0.5,
    7, 1.5,
    12, 2.5
  ],

  // radius of influence in pixels based on zoom
  "heatmap-radius": [
    "interpolate",
    ["linear"],
    ["zoom"],
    0, 2,
    7, 12,
    12, 30
  ],

  // fade heatmap as you zoom in
  "heatmap-opacity": [
    "interpolate",
    ["linear"],
    ["zoom"],
    7, 0.9,
    12, 0.6,
    15, 0.0
  ]
};
