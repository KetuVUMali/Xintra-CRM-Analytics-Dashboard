/*!
 * NimbusDesk — charts.js
 * Thin helper layer over Chart.js so every dashboard page shares the same
 * palette, fonts, grid styling and dark-mode behaviour. Page-specific chart
 * *data* lives in each page's own inline <script> at the bottom of the file;
 * those scripts call the helpers below instead of repeating boilerplate.
 */
(function () {
  "use strict";

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  var registry = [];

  function baseColors() {
    return {
      text: cssVar("--md-text") || "#565a72",
      muted: cssVar("--md-muted") || "#9093a8",
      border: cssVar("--md-border") || "#eaebf3",
      heading: cssVar("--md-heading") || "#191d3a",
      card: cssVar("--md-card-bg") || "#ffffff",
      palette: [
        cssVar("--chart-1") || "#6C5DD3",
        cssVar("--chart-2") || "#f6539e",
        cssVar("--chart-3") || "#ff8a48",
        cssVar("--chart-4") || "#1bc48b",
        cssVar("--chart-5") || "#3ea6ff",
        cssVar("--chart-6") || "#f7b84b",
        cssVar("--chart-7") || "#17c9c9",
        cssVar("--chart-8") || "#4a3aff"
      ]
    };
  }

  function applyGlobalDefaults() {
    if (!window.Chart) return;
    var c = baseColors();
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = c.muted;
    Chart.defaults.borderColor = c.border;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.font = { size: 12, weight: "600" };
    Chart.defaults.plugins.tooltip.backgroundColor = c.heading;
    Chart.defaults.plugins.tooltip.titleColor = "#fff";
    Chart.defaults.plugins.tooltip.bodyColor = "#fff";
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
    Chart.defaults.elements.line.tension = 0.4;
    Chart.defaults.elements.point.radius = 0;
    Chart.defaults.elements.point.hoverRadius = 5;
    Chart.defaults.elements.bar.borderRadius = 6;
    Chart.defaults.elements.bar.borderSkipped = false;
  }
  applyGlobalDefaults();

  function gradient(ctx, colorHex, opacity) {
    opacity = opacity === undefined ? 0.28 : opacity;
    var g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 260);
    var rgb = hexToRgb(colorHex);
    g.addColorStop(0, "rgba(" + rgb + "," + opacity + ")");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    return g;
  }

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
  }

  function baseGrid() {
    var c = baseColors();
    return {
      x: { grid: { display: false }, ticks: { color: c.muted, font: { size: 11.5 } }, border: { display: false } },
      y: { grid: { color: c.border, drawTicks: false }, ticks: { color: c.muted, font: { size: 11.5 }, padding: 8 }, border: { display: false } }
    };
  }

  function register(chart) { registry.push(chart); return chart; }

  var N = {
    colors: baseColors,
    gradient: gradient,
    hexToRgb: hexToRgb,

    /* Smooth area / line chart. opts: {labels, series:[{label,data,color}], stacked, filled} */
    areaLine: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        var color = s.color || c.palette[i % c.palette.length];
        return {
          label: s.label,
          data: s.data,
          borderColor: color,
          backgroundColor: opts.filled === false ? "transparent" : gradient(ctx, color, s.fillOpacity || 0.25),
          fill: opts.filled === false ? false : true,
          borderWidth: s.borderWidth || 2.5,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderDash: s.dashed ? [6, 5] : undefined
        };
      });
      var chart = new Chart(ctx, {
        type: "line",
        data: { labels: opts.labels, datasets: datasets },
        options: Object.assign({
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: datasets.length > 1, position: "bottom" } },
          scales: baseGrid()
        }, opts.overrides || {})
      });
      return register(chart);
    },

    /* Vertical / horizontal bar chart. opts: {labels, series:[{label,data,color}], horizontal, stacked} */
    bar: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        return {
          label: s.label,
          data: s.data,
          backgroundColor: s.color || c.palette[i % c.palette.length],
          maxBarThickness: opts.thickness || 22,
          borderRadius: opts.borderRadius !== undefined ? opts.borderRadius : 6
        };
      });
      var scales = baseGrid();
      if (opts.stacked) { scales.x.stacked = true; scales.y.stacked = true; }
      var chart = new Chart(ctx, {
        type: "bar",
        data: { labels: opts.labels, datasets: datasets },
        options: Object.assign({
          indexAxis: opts.horizontal ? "y" : "x",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: datasets.length > 1, position: "bottom" } },
          scales: scales
        }, opts.overrides || {})
      });
      return register(chart);
    },

    /* Combo bar + line (e.g. Sales Overview: bars + a smooth trend line) */
    barLineCombo: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var barColor = opts.barColor || c.palette[0];
      var lineColor = opts.lineColor || c.palette[1];
      var chart = new Chart(ctx, {
        data: {
          labels: opts.labels,
          datasets: [
            { type: "bar", label: opts.barLabel || "Sales", data: opts.barData, backgroundColor: barColor, maxBarThickness: 16, borderRadius: 6, order: 2 },
            { type: "line", label: opts.lineLabel || "Growth", data: opts.lineData, borderColor: lineColor, backgroundColor: gradient(ctx, lineColor, 0.12), fill: true, borderWidth: 3, pointRadius: 0, pointHoverRadius: 5, order: 1 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { position: "bottom" } },
          scales: baseGrid()
        }
      });
      return register(chart);
    },

    /* Donut / pie chart. opts:{labels, data, colors} */
    donut: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: opts.labels,
          datasets: [{
            data: opts.data,
            backgroundColor: opts.colors || c.palette,
            borderWidth: opts.borderWidth === undefined ? 6 : opts.borderWidth,
            borderColor: c.card,
            hoverOffset: 6
          }]
        },
        options: Object.assign({
          responsive: true,
          maintainAspectRatio: false,
          cutout: opts.cutout || "70%",
          plugins: { legend: { display: opts.legend !== false, position: "bottom" } }
        }, opts.overrides || {})
      });
      return register(chart);
    },

    /* Half-donut "gauge" style chart used for Order Statistics, scorecards etc. opts:{value,max,colors,label} */
    gauge: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var remainder = opts.max - opts.value;
      var chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: opts.labels || ["Value", "Remaining"],
          datasets: [{
            data: opts.segments || [opts.value, remainder],
            backgroundColor: opts.colors || [c.palette[0], c.palette[1]],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            cutout: "78%"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: opts.tooltip !== false } }
        }
      });
      return register(chart);
    },

    /* Radar chart */
    radar: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        var color = s.color || c.palette[i % c.palette.length];
        return { label: s.label, data: s.data, borderColor: color, backgroundColor: "rgba(" + hexToRgb(color) + ",0.18)", pointBackgroundColor: color, borderWidth: 2 };
      });
      var chart = new Chart(ctx, {
        type: "radar",
        data: { labels: opts.labels, datasets: datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: { r: { grid: { color: c.border }, angleLines: { color: c.border }, ticks: { display: false }, pointLabels: { color: c.text, font: { size: 11.5 } } } }
        }
      });
      return register(chart);
    },

    /* Sparkline: tiny inline trend chart with no axes, used inside stat cards / tables */
    sparkline: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var color = opts.color || baseColors().palette[0];
      var chart = new Chart(ctx, {
        type: "line",
        data: { labels: opts.labels || opts.data.map(function (_, i) { return i; }), datasets: [{ data: opts.data, borderColor: color, backgroundColor: gradient(ctx, color, 0.22), fill: true, borderWidth: 2, pointRadius: 0, tension: 0.45 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          elements: { point: { radius: 0 } }
        }
      });
      return register(chart);
    },

    /* Polar area */
    polarArea: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var chart = new Chart(ctx, {
        type: "polarArea",
        data: { labels: opts.labels, datasets: [{ data: opts.data, backgroundColor: (opts.colors || c.palette).map(function (h) { return "rgba(" + hexToRgb(h) + ",0.75)"; }) }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: { r: { grid: { color: c.border }, ticks: { display: false } } } }
      });
      return register(chart);
    },

    /* scatter / bubble */
    scatter: function (canvasId, opts) {
      var el = document.getElementById(canvasId);
      if (!el) return null;
      var ctx = el.getContext("2d");
      var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        return { label: s.label, data: s.data, backgroundColor: s.color || c.palette[i % c.palette.length] };
      });
      var chart = new Chart(ctx, {
        type: "scatter",
        data: { datasets: datasets },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: baseGrid() }
      });
      return register(chart);
    },

    registry: registry
  };

  window.NimbusCharts = N;

  /* Re-theme all registered charts when the dark/light toggle fires */
  window.addEventListener("nimbus:theme-changed", function () {
    applyGlobalDefaults();
    var c = baseColors();
    registry.forEach(function (chart) {
      if (!chart || !chart.options) return;

      // Axis-based charts (line/bar/scatter). NOTE: only ever mutate a
      // *property* of these option objects (e.g. `.ticks.color`), never
      // reassign the object itself (e.g. `x.ticks = x.ticks || {}`) —
      // Chart.js v4's scale/tick options are Proxy-backed resolvers, and
      // writing one back onto itself triggers infinite internal
      // recursion ("Maximum call stack size exceeded") instead of being
      // the harmless no-op it looks like. Every scale created by this
      // file always has a `.ticks` object already (Chart.js merges it in
      // from defaults at creation), so there's nothing to guard here.
      var scales = chart.options.scales;
      if (scales) {
        if (scales.x) {
          scales.x.ticks.color = c.muted;
          if (scales.x.grid) scales.x.grid.color = c.border;
        }
        if (scales.y) {
          scales.y.ticks.color = c.muted;
          if (scales.y.grid) scales.y.grid.color = c.border;
        }
        // Radar / polar-area charts use a radial "r" scale instead of x/y.
        if (scales.r) {
          if (scales.r.grid) scales.r.grid.color = c.border;
          if (scales.r.angleLines) scales.r.angleLines.color = c.border;
          if (scales.r.pointLabels) scales.r.pointLabels.color = c.text;
        }
      }

      // Legend label color and tooltip colors are baked into each chart's
      // own options at creation time (Chart.js deep-merges Chart.defaults
      // in when the instance is built) — updating Chart.defaults alone,
      // above, does not retroactively reach charts that already exist,
      // so each visible chart's own options need the same update here.
      if (chart.options.plugins) {
        if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
          chart.options.plugins.legend.labels.color = c.text;
        }
        if (chart.options.plugins.tooltip) {
          chart.options.plugins.tooltip.backgroundColor = c.heading;
          chart.options.plugins.tooltip.titleColor = "#fff";
          chart.options.plugins.tooltip.bodyColor = "#fff";
        }
      }

      // Doughnut/pie slice borders are drawn in the surrounding card
      // color to create the "separated slice" look, so that gap color
      // has to follow the card background between light and dark.
      if (chart.config.type === "doughnut" || chart.config.type === "pie") {
        chart.data.datasets.forEach(function (ds) { ds.borderColor = c.card; });
      }
      chart.update();
    });
  });
})();
