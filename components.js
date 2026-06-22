// NOVA — bundle compilado desde los .jsx de Claude Design (no editar a mano).
// Orden: tweaks-panel.jsx → nova-sim.jsx → nova-magnus.jsx → nova-pricing.jsx → nova-business.jsx → nova-policies.jsx → nova-details.jsx → nova-about.jsx → nova-app.jsx

/* ===== tweaks-panel.jsx ===== */
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});

/* ===== nova-sim.jsx ===== */
// NOVA — Simuladores de agentes (MAGNUS / AXON / BARBER IA / CORTEX)
const {
  useState,
  useEffect,
  useRef
} = React;

/* ---------- utilidades ---------- */

function useCycle(steps, interval, deps = []) {
  // avanza un índice cíclicamente; se reinicia cuando cambian deps
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const id = setInterval(() => setI(v => (v + 1) % steps), interval);
    return () => clearInterval(id);
  }, deps); // eslint-disable-line
  return i;
}

/* ---------- iconos (Lucide) ---------- */

function LIcon({
  name,
  size = 15,
  className = ""
}) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !window.lucide || !window.lucide[name]) return;
    node.innerHTML = "";
    const svg = window.lucide.createElement(window.lucide[name]);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("stroke-width", "1.75");
    node.appendChild(svg);
  }, [name, size]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: "inline-grid place-items-center " + className
  });
}
function Eyebrow({
  icon,
  dim,
  className = "",
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 " + className
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-8 h-8 shrink-0 rounded-lg grid place-items-center border " + (dim ? "border-white/15 text-white/50 bg-white/[0.03]" : "border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_18px_-6px_var(--accent-glow)]")
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: icon
  })), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] uppercase " + (dim ? "tracking-[0.3em] text-white/35" : "tracking-[0.4em] text-[var(--accent)]")
  }, children));
}

/* ---------- chrome de ventana ---------- */

function SimWindow({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "relative w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_0_80px_-20px_var(--accent-glow)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 px-5 h-11 border-b border-white/[0.07] bg-white/[0.02]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full bg-white/15"
  }), /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full bg-white/15"
  }), /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
  })), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase"
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "ml-auto flex items-center gap-2 font-mono text-[10px] text-[var(--accent)]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"
  }), "LIVE")), /*#__PURE__*/React.createElement("div", {
    className: "p-5 md:p-7 min-h-[380px]"
  }, children));
}

/* ---------- MAGNUS ---------- */

const MAGNUS_LINES = ["> Magnus: Optimizando entorno de desarrollo...", "> Leyendo agenda personal... 3 eventos hoy", "> Sincronizando archivos locales → nube [OK]", "> Redactando borrador: respuesta a cliente...", "> Limpieza de memoria: 1.2 GB liberados", "> Magnus: Todo listo. Esperando tu voz..."];
const MAGNUS_TASKS = ["Backup nocturno completado", "Reunión de las 10:00 reagendada", "Inbox: 14 correos triados", "Build de producción verificada"];
function VoiceWave() {
  const bars = [12, 28, 44, 64, 38, 70, 52, 86, 60, 92, 66, 80, 48, 72, 56, 36, 58, 30, 46, 20, 34, 14];
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center gap-[5px] h-28",
    "aria-label": "Onda de voz de Magnus"
  }, bars.map((h, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "eq-bar w-[4px] rounded-full bg-[var(--accent)]",
    style: {
      height: h + "%",
      animationDelay: i * 0.09 % 1.1 + "s",
      animationDuration: 0.9 + i % 5 * 0.14 + "s"
    }
  })));
}
function TypingTerminal({
  lines
}) {
  const [done, setDone] = useState([]);
  const [current, setCurrent] = useState("");
  const state = useRef({
    line: 0,
    char: 0
  });
  useEffect(() => {
    setDone([]);
    setCurrent("");
    state.current = {
      line: 0,
      char: 0
    };
    const id = setInterval(() => {
      const s = state.current;
      const text = lines[s.line];
      if (s.char < text.length) {
        s.char += 2;
        setCurrent(text.slice(0, s.char));
      } else {
        setDone(d => {
          const next = [...d, text].slice(-4);
          return next;
        });
        setCurrent("");
        s.char = 0;
        s.line = (s.line + 1) % lines.length;
      }
    }, 45);
    return () => clearInterval(id);
  }, [lines]);
  return /*#__PURE__*/React.createElement("div", {
    className: "font-mono text-[12px] md:text-[13px] leading-6 text-white/55 rounded-xl border border-white/[0.07] bg-black/40 p-4 h-44 overflow-hidden flex flex-col justify-end"
  }, done.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "truncate opacity-60"
  }, l)), /*#__PURE__*/React.createElement("div", {
    className: "text-[var(--accent)] truncate"
  }, current, /*#__PURE__*/React.createElement("span", {
    className: "caret"
  }, "_")));
}
function MagnusSim() {
  const step = useCycle(MAGNUS_TASKS.length + 1, 2200);
  return /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-6 items-stretch"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 px-4 py-5"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase mb-2 text-center"
  }, "Escuchando"), /*#__PURE__*/React.createElement(VoiceWave, null)), /*#__PURE__*/React.createElement(TypingTerminal, {
    lines: MAGNUS_LINES
  })), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5 flex flex-col"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase mb-4"
  }, "Tareas completadas"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-3"
  }, MAGNUS_TASKS.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    className: "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-700 " + (i < step ? "border-white/10 bg-white/[0.04] opacity-100 translate-y-0" : "border-transparent bg-transparent opacity-20 translate-y-1")
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-mono transition-colors duration-700 " + (i < step ? "bg-[var(--accent)] text-black" : "border border-white/20 text-transparent")
  }, "✓"), /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-white/70"
  }, t)))), /*#__PURE__*/React.createElement("p", {
    className: "mt-auto pt-5 font-mono text-[11px] text-white/30"
  }, "magnus.core \xB7 uptime 99.99%")));
}

/* ---------- AXON ---------- */

function ChatBubble({
  from,
  name,
  children,
  visible
}) {
  const isBot = from === "bot";
  return /*#__PURE__*/React.createElement("div", {
    className: "px-4 py-3 rounded-lg text-sm max-w-[88%] transition-all duration-700 " + (visible ? "opacity-100 translate-y-0 " : "opacity-0 translate-y-2 ") + (isBot ? "self-end border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-white/85" : "self-start bg-white/[0.06] text-white/70")
  }, isBot && /*#__PURE__*/React.createElement("span", {
    className: "block font-mono text-[9px] tracking-[0.2em] text-[var(--accent)] mb-1"
  }, name), children);
}
const AXON_CHAT = [{
  from: "user",
  text: "buenas, quiero una hamburguesa"
}, {
  from: "bot",
  text: "¡Con gusto! ¿La quieres en combo con papas y gaseosa?"
}, {
  from: "user",
  text: "sisas, a la Calle 45 #12-30"
}, {
  from: "bot",
  text: "Listo ✓ Combo hamburguesa $28.500 + domicilio $4.000 = $32.500. ¿Pagas en efectivo o transferencia?"
}, {
  from: "user",
  text: "efectivo con 50"
}, {
  from: "bot",
  text: "Perfecto — tu vuelto: $17.500. Pedido confirmado, llega en ~35 min."
}];
const AXON_JSON = ["{", "  \"cliente\": \"+57 301 ···\",", "  \"items\": [{ \"item\": \"Combo hamburguesa\",", "             \"cant\": 1, \"precio\": 28500 }],", "  \"modalidad\": \"domicilio\",", "  \"direccion\": \"Calle 45 #12-30\",", "  \"pago\": { \"metodo\": \"efectivo\",", "            \"paga_con\": 50000, \"vuelto\": 17500 },", "  \"total\": 32500", "}"];
function AxonSim() {
  const total = AXON_CHAT.length + AXON_JSON.length + 2;
  const step = useCycle(total, 1100);
  const jsonShown = Math.max(0, step - 3); // el JSON empieza a extraerse al confirmar items
  return /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5 flex flex-col gap-3 min-h-[340px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline justify-between mb-1"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase"
  }, "Pedido \xB7 WhatsApp"), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[10px] text-[var(--accent)]"
  }, "en vivo")), AXON_CHAT.map((m, i) => /*#__PURE__*/React.createElement(ChatBubble, {
    key: i,
    from: m.from,
    name: "AXON",
    visible: i <= step
  }, m.text))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/40 p-5 flex-1"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase mb-3"
  }, "Panel del administrador \xB7 JSON extra\xEDdo"), /*#__PURE__*/React.createElement("pre", {
    className: "font-mono text-[11px] md:text-[12px] leading-5 text-white/55 overflow-hidden"
  }, AXON_JSON.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "transition-all duration-500 " + (i < jsonShown ? "opacity-100" : "opacity-10")
  }, i < jsonShown ? l : "·")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-3"
  }, [["Pedidos hoy", "312"], ["Respuesta", "0.9 s"], ["Ticket prom.", "$31k"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[9px] tracking-[0.15em] text-white/35 uppercase mb-1"
  }, k), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-medium text-white/90 tabular-nums"
  }, v)))), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-white/30 px-1"
  }, "axon.orders \xB7 WebSocket \xB7 0 errores")));
}

/* ---------- MENTOR IA ---------- */

const MENTOR_CHAT = [{
  from: "user",
  text: "¡Hola! Soy nueva, ¿cuándo me pagan?"
}, {
  from: "bot",
  text: "¡Bienvenida, Sofía! Los pagos son los días 15 y 30 de cada mes — tu primer pago llega el 30. Cualquier duda, aquí estoy."
}, {
  from: "user",
  text: "¿Y dónde veo el organigrama?"
}, {
  from: "bot",
  text: "En la intranet → Cultura → Equipo. Tú reportas a Mateo, director de Diseño. Te paso el enlace directo."
}, {
  from: "bot",
  text: "Por cierto: solo te falta subir el contrato firmado. PDF o foto clara, máx 10 MB. ¡Sin afán!"
}];
const MENTOR_DOCS = [{
  doc: "DNI",
  at: 0
}, {
  doc: "Certificación bancaria",
  at: 2
}, {
  doc: "Contrato firmado",
  at: 5
}, {
  doc: "Comprobante de domicilio",
  at: 99
}];
function MentorSim() {
  const step = useCycle(7, 1700);
  const loaded = MENTOR_DOCS.filter(d => step >= d.at).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-[1fr_280px] gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5 flex flex-col gap-3 min-h-[320px]"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase mb-1"
  }, "Intranet \xB7 Widget de onboarding"), MENTOR_CHAT.map((m, i) => /*#__PURE__*/React.createElement(ChatBubble, {
    key: i,
    from: m.from,
    name: "MENTOR IA",
    visible: i <= step
  }, m.text))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5 flex flex-col"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase mb-4"
  }, "Documentos de ingreso"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-3"
  }, MENTOR_DOCS.map(({
    doc,
    at
  }) => {
    const ok = step >= at;
    const validating = !ok && step === at - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: doc,
      className: "flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-mono transition-all duration-700 " + (ok ? "bg-[var(--accent)] text-black" : "border border-white/20 text-transparent")
    }, "\u2713"), /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-white/75 truncate"
    }, doc), /*#__PURE__*/React.createElement("p", {
      className: "font-mono text-[10px] transition-colors duration-500 " + (ok ? "text-[var(--accent)]" : "text-white/30")
    }, ok ? "Cargado" : validating ? "Validando…" : "Pendiente")));
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-auto pt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-1 rounded-full bg-white/10 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full bg-[var(--accent)] transition-all duration-700",
    style: {
      width: loaded / MENTOR_DOCS.length * 100 + "%"
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 font-mono text-[10px] text-white/30"
  }, loaded, "/", MENTOR_DOCS.length, " completados \xB7 tenant aislado"))));
}

/* ---------- BARBER IA ---------- */

const BARBER_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"];
const BARBER_DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE"];
const BARBER_BOOKED = [[0, 1], [1, 3], [2, 0], [3, 5], [4, 2], [1, 6], [3, 1], [0, 4]];
function BarberSim() {
  const step = useCycle(6, 1800);
  const targetDay = 2,
    targetSlot = 4; // MIÉ 15:00
  const booked = step >= 3;
  return /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-[1fr_280px] gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase mb-4"
  }, "Agenda \xB7 Semana 24"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-[44px_repeat(5,1fr)] gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null), BARBER_DAYS.map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    className: "font-mono text-[10px] text-white/40 text-center pb-1"
  }, d)), BARBER_SLOTS.map((t, si) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: t
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[10px] text-white/30 pr-1 self-center"
  }, t), BARBER_DAYS.map((_, di) => {
    const isTaken = BARBER_BOOKED.some(([d, s]) => d === di && s === si);
    const isTarget = di === targetDay && si === targetSlot;
    return /*#__PURE__*/React.createElement("span", {
      key: di,
      className: "h-6 rounded-md transition-all duration-700 " + (isTarget && booked ? "bg-[var(--accent)] shadow-[0_0_14px_var(--accent-glow)]" : isTarget && step >= 1 ? "bg-white/10 ring-1 ring-[var(--accent)] animate-pulse" : isTaken ? "bg-white/[0.08]" : "bg-white/[0.03]")
    });
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5 flex flex-col gap-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase"
  }, "Conversaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    className: "rounded-lg bg-white/[0.06] px-4 py-3 text-sm text-white/75 self-start max-w-[95%] transition-all duration-700 " + (step >= 0 ? "opacity-100" : "opacity-0")
  }, "\u201CQuiero un corte el mi\xE9rcoles por la tarde\u201D"), /*#__PURE__*/React.createElement("div", {
    className: "rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm text-white/80 self-end max-w-[95%] transition-all duration-700 " + (step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
  }, "Tengo el mi\xE9rcoles 15:00 con Andr\xE9s. \xBFTe lo reservo?"), /*#__PURE__*/React.createElement("div", {
    className: "rounded-lg bg-white/[0.06] px-4 py-3 text-sm text-white/75 self-start transition-all duration-700 " + (step >= 3 ? "opacity-100" : "opacity-0")
  }, "\u201CDale \uD83D\uDC4D\u201D"), /*#__PURE__*/React.createElement("div", {
    className: "mt-auto rounded-lg border border-white/10 px-4 py-3 transition-all duration-700 " + (step >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] text-[var(--accent)] mb-1"
  }, "✓", " CITA CONFIRMADA"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/70"
  }, "Mi\xE9 \xB7 15:00 \xB7 Corte cl\xE1sico \xB7 Andr\xE9s"))));
}

/* ---------- CORTEX ---------- */

const CORTEX_CHAT = [{
  from: "user",
  text: "Mi factura de mayo llegó duplicada, ¿qué hago?"
}, {
  from: "bot",
  text: "Lo verifico ahora mismo... Detecté el cargo duplicado del 12/05. Ya inicié el reembolso: llega en 48h."
}, {
  from: "user",
  text: "¿Me llega comprobante?"
}, {
  from: "bot",
  text: "Sí — te lo acabo de enviar por correo, junto al número de caso #88412."
}];
function CortexSim() {
  const step = useCycle(CORTEX_CHAT.length + 2, 1900);
  const resolved = 1284 + Math.min(step, 5) * 3;
  return /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-[1fr_240px] gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5 flex flex-col gap-3 min-h-[320px]"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase mb-1"
  }, "Soporte \xB7 Caso #88412"), CORTEX_CHAT.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "px-4 py-3 rounded-lg text-sm max-w-[88%] transition-all duration-700 " + (i <= step ? "opacity-100 translate-y-0 " : "opacity-0 translate-y-2 ") + (m.from === "bot" ? "self-end border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-white/85" : "self-start bg-white/[0.06] text-white/70")
  }, m.from === "bot" && /*#__PURE__*/React.createElement("span", {
    className: "block font-mono text-[9px] tracking-[0.2em] text-[var(--accent)] mb-1"
  }, "CORTEX"), m.text))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4"
  }, [["Tickets resueltos hoy", String(resolved)], ["Tiempo medio de respuesta", "1.4 s"], ["Satisfacción", "98.2%"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "rounded-xl border border-white/[0.07] bg-black/30 p-5"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase mb-2"
  }, k), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-medium text-white/90 tabular-nums"
  }, v))), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-white/30 px-1"
  }, "cortex.support \xB7 24/7 \xB7 sin colas")));
}
Object.assign(window, {
  SimWindow,
  MagnusSim,
  AxonSim,
  BarberSim,
  CortexSim,
  MentorSim,
  LIcon,
  Eyebrow
});

/* ===== nova-magnus.jsx ===== */
// NOVA — MAGNUS: capacidades, descarga multiplataforma, planes y checkout
const {
  useState: useMagState,
  useEffect: useMagEffect
} = React;

/* ============================================================
   MODAL reutilizable
   ============================================================ */

function Modal({
  open,
  onClose,
  children,
  maxW = "max-w-lg"
}) {
  useMagEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-[60] grid place-items-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-black/70 backdrop-blur-md animate-modal-fade",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative w-full " + maxW + " rounded-2xl border border-white/10 bg-[#0a0a0e] shadow-[0_0_120px_-20px_var(--accent-glow)] animate-modal-pop overflow-hidden"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    className: "absolute top-4 right-4 z-10 w-8 h-8 grid place-items-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "X",
    size: 15
  })), children));
}

/* ============================================================
   MAGNUS — capacidades agrupadas
   ============================================================ */

const MAGNUS_CAPS = [{
  icon: "MonitorCog",
  title: "Control total del sistema",
  items: [["Control del PC por voz", "Abre apps, busca archivos, mueve y cierra ventanas sin tocar el teclado."], ["Optimización con un comando", "Cierra procesos basura, vacía temporales y limpia el caché del sistema."], ["Modos inteligentes", "Cine, Juego, Presentación y Viaje/Eco — adapta tu PC con un solo comando."], ["Control por gestos", "La cámara detecta tu mano: volumen, música, cursor y modelos 3D."], ["Bluetooth por voz", "Enciende y conecta dispositivos sin entrar a configuración."], ["Control avanzado · Max", "Genera y ejecuta scripts de Python, siempre con tu confirmación previa."]]
}, {
  icon: "Briefcase",
  title: "Productividad y trabajo",
  items: [["Agenda con Google Calendar", "Consulta tu día y agenda reuniones por voz, sin abrir ninguna app."], ["Correo sin navegador", "Lee, filtra por remitente y cuenta no leídos (Gmail, Outlook, institucional)."], ["Notas y recordatorios", "Guarda ideas al instante y te avisa a tiempo."], ["Magnus escribe por ti", "Redacta correos y textos con IA, directo donde hagas clic."], ["Reportes en Word", "Genera documentos .docx formateados y listos para compartir."], ["Pomodoro y lectura en voz", "Modo foco que silencia notificaciones; lee cualquier texto en voz natural."]]
}, {
  icon: "Heart",
  title: "Tu vida personal",
  items: [["Finanzas 100% privadas", "Registra gastos por voz; presupuesto y categorías guardados localmente."], ["Clima al instante", "Temperatura, humedad, viento y lluvia para tu ciudad."], ["Deportes en vivo", "Resultados y próximos partidos en tiempo real (ESPN)."], ["Vigilancia académica", "Detecta notas, tareas y fechas límite en Moodle y correo institucional."], ["Notificaciones del celular", "Anuncia en voz tus alertas de Android mientras trabajas."], ["Hogar inteligente", "Controla luces y enchufes Tuya por voz."]]
}, {
  icon: "BrainCircuit",
  title: "Inteligencia que te conoce",
  items: [["Búsqueda web con IA real", "Datos de hoy, no del pasado (Gemini + Google Search)."], ["Memoria que te conoce", "Aprende tus preferencias y sincroniza tu historial de ChatGPT, Claude o Gemini."], ["Consulta tus PDFs · RAG", "Indexa tu biblioteca y responde basándose en tus propios documentos."], ["Intel de personas", "Perfiles con foto, biografía y datos clave, al estilo Iron Man."], ["Se adapta a tu humor", "Detecta si estás cansado o frustrado y ajusta su tono."], ["Guardian silencioso", "Analiza el sistema en segundo plano y te alerta de riesgos."]]
}];
function CapItem({
  name,
  desc
}) {
  const [open, setOpen] = useMagState(false);
  return /*#__PURE__*/React.createElement("li", {
    className: "border-b border-white/[0.05] last:border-0 pb-3 last:pb-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(v => !v),
    "aria-expanded": open,
    className: "w-full flex items-center gap-3 text-left group outline-none"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 shrink-0 rounded-full transition-all duration-300 " + (open ? "bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" : "bg-white/30 group-hover:bg-[var(--accent)]")
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-medium flex-1 transition-colors " + (open ? "text-[var(--accent)]" : "text-white/85 group-hover:text-white")
  }, name), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-base leading-none shrink-0 transition-transform duration-300 " + (open ? "rotate-45 text-[var(--accent)]" : "text-white/30 group-hover:text-white/60")
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "grid transition-all duration-300 ease-out " + (open ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0")
  }, /*#__PURE__*/React.createElement("div", {
    className: "overflow-hidden"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed pl-[18px] pr-2"
  }, desc))));
}
function MagnusCapabilities() {
  return /*#__PURE__*/React.createElement("div", {
    className: "mt-14"
  }, /*#__PURE__*/React.createElement("p", {
    "data-reveal": true,
    className: "max-w-2xl mx-auto text-center text-base md:text-lg text-white/55 leading-relaxed mb-12"
  }, "No es una app m\xE1s. ", /*#__PURE__*/React.createElement("span", {
    className: "text-white"
  }, "Magnus vive en tu computador"), ", entiende lo que dices, ejecuta lo que necesitas y aprende qui\xE9n eres \u2014 todo con tu voz."), /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Sparkles",
    className: "mb-6"
  }, "Todo lo que Magnus hace por ti"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/35 font-mono mb-6"
  }, "Toca cualquier funci\xF3n para ver el detalle \u2014\u2009", /*#__PURE__*/React.createElement("span", {
    className: "text-[var(--accent)]"
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-4"
  }, MAGNUS_CAPS.map((cat, ci) => /*#__PURE__*/React.createElement("div", {
    key: cat.title,
    "data-reveal": true,
    "data-reveal-delay": ci * 80 + "ms",
    className: "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-6"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-9 h-9 shrink-0 rounded-lg grid place-items-center border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_18px_-6px_var(--accent-glow)]"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: cat.icon,
    size: 17
  })), /*#__PURE__*/React.createElement("h4", {
    className: "text-lg font-medium text-white"
  }, cat.title)), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-3"
  }, cat.items.map(([name, desc]) => /*#__PURE__*/React.createElement(CapItem, {
    key: name,
    name: name,
    desc: desc
  })))))), /*#__PURE__*/React.createElement(MagnusUpdatesBanner, null));
}
function MagnusUpdatesBanner() {
  return /*#__PURE__*/React.createElement("div", {
    "data-reveal": "scale",
    className: "updates-banner relative mt-8 overflow-hidden rounded-2xl border border-[var(--accent)]/40 p-7 md:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 pointer-events-none",
    style: {
      background: "radial-gradient(ellipse 60% 120% at 0% 50%, var(--accent-glow), transparent 60%)",
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative flex flex-col sm:flex-row sm:items-center gap-5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-14 h-14 shrink-0 rounded-2xl grid place-items-center bg-[var(--accent)] text-black shadow-[0_0_30px_-4px_var(--accent-glow)]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "banner-spin grid place-items-center"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Sparkles",
    size: 26
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 mb-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--accent)]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"
  }), " Novedad")), /*#__PURE__*/React.createElement("h4", {
    className: "text-xl md:text-2xl font-medium text-white"
  }, "Magnus mejora cada mes \u2014 sin pagar nada extra."), /*#__PURE__*/React.createElement("p", {
    className: "text-sm md:text-base text-white/55 leading-relaxed mt-1.5"
  }, "Nuevas funciones, voz m\xE1s precisa y nuevas integraciones llegan solas a tu suscripci\xF3n. Compras Magnus una vez; crece para siempre."))));
}

/* ============================================================
   DESCARGAR MAGNUS — Windows / macOS / Linux
   ============================================================ */

const OS_LIST = [{
  id: "Windows",
  icon: "AppWindow",
  note: "Windows 10 y 11 · 64-bit"
}, {
  id: "macOS",
  icon: "Command",
  note: "macOS 12 Monterey o superior"
}, {
  id: "Linux",
  icon: "Terminal",
  note: ".deb · .AppImage · Arch"
}];
function DownloadSection() {
  const [os, setOs] = useMagState("Windows");
  const [modalOs, setModalOs] = useMagState(null);
  useMagEffect(() => {
    const ua = navigator.userAgent || "";
    if (/Mac/i.test(ua)) setOs("macOS");else if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) setOs("Linux");else setOs("Windows");
  }, []);
  const current = OS_LIST.find(o => o.id === os) || OS_LIST[0];
  return /*#__PURE__*/React.createElement("section", {
    id: "descargar",
    "data-screen-label": "Descargar Magnus",
    className: "relative max-w-6xl mx-auto px-6 pt-28 pb-24 scroll-mt-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-center flex flex-col items-center"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Download",
    className: "mb-6 justify-center"
  }, "04 \xB7 Descarga Magnus"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-6xl font-medium tracking-tight text-white leading-[1.05] max-w-3xl"
  }, "Tu socio de trabajo,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "en tu escritorio"), "."), /*#__PURE__*/React.createElement("p", {
    className: "mt-7 max-w-xl text-base md:text-lg text-white/45 leading-relaxed"
  }, "Magnus es el primer asistente de IA que controla tu PC con tu voz, gestiona tu vida y nunca se cansa. Inst\xE1lalo en minutos y empieza a delegar."), /*#__PURE__*/React.createElement("div", {
    className: "mt-11 flex flex-col items-center gap-5 w-full"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setModalOs(current.id),
    className: "glow-btn group relative rounded-full p-px overflow-hidden"
  }, /*#__PURE__*/React.createElement("span", {
    className: "relative z-10 flex items-center gap-3 rounded-full bg-black px-8 py-4 text-sm font-medium text-white transition-colors group-hover:bg-[#0b0b0e]"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: current.icon,
    size: 17
  }), "Descargar para ", current.id)), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-center gap-2"
  }, OS_LIST.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    onClick: () => setModalOs(o.id),
    className: "flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide transition-colors " + (o.id === os ? "border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/5" : "border-white/12 text-white/45 hover:text-white hover:border-white/25")
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: o.icon,
    size: 13
  }), o.id))), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-white/30 tracking-wide"
  }, "Disponible para Windows, macOS y Linux \xB7 ", /*#__PURE__*/React.createElement("span", {
    className: "text-[var(--accent)]"
  }, "Primera semana gratis")))), /*#__PURE__*/React.createElement(Modal, {
    open: !!modalOs,
    onClose: () => setModalOs(null),
    maxW: "max-w-md"
  }, /*#__PURE__*/React.createElement(DownloadModalBody, {
    os: modalOs,
    osData: OS_LIST.find(o => o.id === modalOs),
    onClose: () => setModalOs(null)
  })));
}
function DownloadModalBody({
  os,
  osData,
  onClose
}) {
  const [sent, setSent] = useMagState(false);
  if (!osData) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "p-8"
  }, !sent ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "w-12 h-12 rounded-xl grid place-items-center border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/5 mb-5"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: osData.icon,
    size: 22
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-medium text-white mb-1"
  }, "Magnus para ", os), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-white/40 mb-6"
  }, osData.note), /*#__PURE__*/React.createElement("label", {
    className: "block font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2"
  }, "Tu correo"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    placeholder: "tu@correo.com",
    className: "w-full rounded-lg border border-white/12 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[var(--accent)]/50 transition-colors mb-4"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSent(true),
    className: "w-full rounded-lg bg-[var(--accent)] text-black font-medium text-sm py-3.5 hover:brightness-110 transition-all"
  }, "Descargar e iniciar prueba gratis"), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 font-mono text-[10px] text-white/30 text-center leading-relaxed"
  }, "7 d\xEDas gratis \xB7 sin tarjeta \xB7 cancela cuando quieras")) : /*#__PURE__*/React.createElement("div", {
    className: "text-center py-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-14 h-14 rounded-full grid place-items-center bg-[var(--accent)] text-black mx-auto mb-5"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Check",
    size: 26
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-medium text-white mb-2"
  }, "Tu descarga comenzar\xE1"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/50 leading-relaxed max-w-xs mx-auto"
  }, "Te enviamos el instalador de ", /*#__PURE__*/React.createElement("span", {
    className: "text-white"
  }, "Magnus para ", os), " y tu enlace de prueba gratis a tu correo."), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "mt-7 font-mono text-[11px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors"
  }, "Cerrar")));
}
Object.assign(window, {
  Modal,
  MagnusCapabilities,
  DownloadSection
});

/* ===== nova-pricing.jsx ===== */
// NOVA — Planes de Magnus (B2C) + checkout con pasarelas de pago
const {
  useState: usePlanState
} = React;
const MAGNUS_PLANS = [{
  id: "basico",
  name: "Básico",
  icon: "Sparkle",
  tagline: "Para tu día a día",
  cop: "20.000",
  usd: "≈ $5 USD",
  featured: false,
  features: ["Núcleo central de Magnus", "Procesamiento ultrarrápido", "Control de PC, apps y voz", "Clima, notas, alarmas y recordatorios", "Correo + Calendario + Finanzas", "1 dispositivo"]
}, {
  id: "pro",
  name: "Pro",
  icon: "Zap",
  tagline: "El equilibrio perfecto",
  cop: "50.000",
  usd: "≈ $12.5 USD",
  featured: true,
  inherits: "Básico",
  features: ["Voz premium y ultrarrealista", "Búsqueda web avanzada en tiempo real", "Mayor contexto de memoria", "Visión por cámara + gestos", "Hogar inteligente + modos + RAG", "3 dispositivos"]
}, {
  id: "max",
  name: "Max",
  icon: "Rocket",
  tagline: "Potencia sin límites",
  cop: "120.000",
  usd: "≈ $30 USD",
  featured: false,
  inherits: "Pro",
  features: ["Modelos avanzados de alto rendimiento", "Análisis de visión e imágenes", "Asistencia experta para código", "Control avanzado del PC (scripts)", "5 dispositivos", "Soporte dedicado"]
}];
const PAY_METHODS = [["Tarjeta", "CreditCard"], ["PSE", "Landmark"], ["Nequi", "Smartphone"], ["Bancolombia", "Wallet"], ["Mercado Pago", "ShoppingBag"]];
function PlanCard({
  plan,
  onChoose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "relative w-full flex flex-col rounded-2xl border border-[var(--accent)]/45 bg-white/[0.04] p-7 md:p-8 shadow-[0_0_60px_-22px_var(--accent-glow)] transition-all duration-500 hover:border-[var(--accent)]/70 hover:-translate-y-1.5 hover:shadow-[0_0_70px_-18px_var(--accent-glow)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-10 h-10 rounded-xl grid place-items-center border border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/10"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: plan.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[10px] tracking-[0.2em] uppercase text-white/35"
  }, plan.tagline)), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-medium text-white mb-4"
  }, "Magnus ", plan.name), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2 mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-sm text-white/45"
  }, "COP"), /*#__PURE__*/React.createElement("span", {
    className: "text-4xl font-medium text-white tabular-nums"
  }, "$", plan.cop), /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-white/40"
  }, "/mes")), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-[var(--accent)] mb-7"
  }, plan.usd, " / mes"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChoose(plan),
    className: "w-full rounded-lg bg-[var(--accent)] text-black font-medium text-sm py-3.5 mb-7 hover:brightness-110 transition-all"
  }, "Suscribirme"), plan.inherits && /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-white/45 mb-3"
  }, "Todo lo de ", plan.inherits, ", y adem\xE1s:"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-3"
  }, plan.features.map(f => /*#__PURE__*/React.createElement("li", {
    key: f,
    className: "flex items-start gap-3 text-sm text-white/65"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mt-0.5 shrink-0 text-[var(--accent)]"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Check",
    size: 15
  })), f))));
}
function PricingSection() {
  const [checkout, setCheckout] = usePlanState(null);
  return /*#__PURE__*/React.createElement("section", {
    id: "planes",
    "data-screen-label": "Planes Magnus",
    className: "relative max-w-6xl mx-auto px-6 pt-24 pb-28 scroll-mt-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center flex flex-col items-center mb-16"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "CreditCard",
    className: "mb-6 justify-center"
  }, "05 \xB7 Planes Magnus"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-5xl font-medium tracking-tight text-white max-w-2xl"
  }, "Elige tu plan. ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "Paga seguro"), " desde aqu\xED."), /*#__PURE__*/React.createElement("p", {
    className: "mt-6 max-w-lg text-base text-white/45 leading-relaxed"
  }, "Suscr\xEDbete en segundos con tarjeta, PSE, Nequi o Bancolombia. Tu primera semana es gratis.")), /*#__PURE__*/React.createElement("div", {
    "data-reveal": true,
    className: "grid md:grid-cols-3 gap-5 items-stretch"
  }, MAGNUS_PLANS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    "data-reveal": true,
    "data-reveal-delay": i * 90 + "ms",
    className: "flex"
  }, /*#__PURE__*/React.createElement(PlanCard, {
    plan: p,
    onChoose: setCheckout
  })))), /*#__PURE__*/React.createElement("div", {
    className: "mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] text-white/35"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Gift",
    size: 13,
    className: "text-[var(--accent)]"
  }), " Primera semana gratis"), /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "ShieldCheck",
    size: 13,
    className: "text-[var(--accent)]"
  }), " Sin costos ocultos"), /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "RefreshCw",
    size: 13,
    className: "text-[var(--accent)]"
  }), " Actualizaciones incluidas"), /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "XCircle",
    size: 13,
    className: "text-[var(--accent)]"
  }), " Cancela cuando quieras")), /*#__PURE__*/React.createElement(Modal, {
    open: !!checkout,
    onClose: () => setCheckout(null)
  }, /*#__PURE__*/React.createElement(CheckoutBody, {
    plan: checkout,
    onClose: () => setCheckout(null)
  })));
}
function CheckoutBody({
  plan,
  onClose
}) {
  const [method, setMethod] = usePlanState("Tarjeta");
  const [stage, setStage] = usePlanState("form"); // form → processing → done
  if (!plan) return null;
  const pay = () => {
    setStage("processing");
    setTimeout(() => setStage("done"), 1600);
  };
  if (stage === "done") {
    return /*#__PURE__*/React.createElement("div", {
      className: "p-8 text-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-16 h-16 rounded-full grid place-items-center bg-[var(--accent)] text-black mx-auto mb-5"
    }, /*#__PURE__*/React.createElement(LIcon, {
      name: "Check",
      size: 30
    })), /*#__PURE__*/React.createElement("h3", {
      className: "text-2xl font-medium text-white mb-2"
    }, "\xA1Bienvenido a Magnus ", plan.name, "!"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-white/50 leading-relaxed max-w-xs mx-auto"
    }, "Tu prueba gratis est\xE1 activa. No se har\xE1 ning\xFAn cobro durante los primeros 7 d\xEDas \u2014 luego,", /*#__PURE__*/React.createElement("span", {
      className: "text-white"
    }, " $", plan.cop, " COP/mes"), " v\xEDa ", method, "."), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      className: "mt-7 rounded-lg bg-white/[0.06] border border-white/12 text-white text-sm font-medium px-6 py-3 hover:bg-white/10 transition-colors"
    }, "Empezar con Magnus"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "p-8"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--accent)] mb-2"
  }, "Finalizar suscripci\xF3n"), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-medium text-white mb-5"
  }, "Magnus ", plan.name), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline justify-between rounded-xl border border-white/[0.08] bg-black/40 px-5 py-4 mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/80"
  }, "Plan ", plan.name, " \xB7 mensual"), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-[var(--accent)]"
  }, "7 d\xEDas gratis, luego se renueva")), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-medium text-white tabular-nums"
  }, "$", plan.cop), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] text-white/40"
  }, "COP /mes"))), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3"
  }, "M\xE9todo de pago"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2 mb-6"
  }, PAY_METHODS.map(([name, icon]) => /*#__PURE__*/React.createElement("button", {
    key: name,
    onClick: () => setMethod(name),
    className: "flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm transition-colors " + (method === name ? "border-[var(--accent)]/50 bg-[var(--accent)]/8 text-white" : "border-white/10 text-white/55 hover:border-white/25")
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: icon,
    size: 15,
    className: method === name ? "text-[var(--accent)]" : "text-white/40"
  }), name))), /*#__PURE__*/React.createElement("input", {
    type: "email",
    placeholder: "Correo de la cuenta",
    className: "w-full rounded-lg border border-white/12 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[var(--accent)]/50 transition-colors mb-3"
  }), method === "Tarjeta" && /*#__PURE__*/React.createElement("input", {
    inputMode: "numeric",
    placeholder: "N\xFAmero de tarjeta",
    className: "w-full rounded-lg border border-white/12 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[var(--accent)]/50 transition-colors mb-3"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: pay,
    disabled: stage === "processing",
    className: "w-full rounded-lg bg-[var(--accent)] text-black font-medium text-sm py-3.5 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
  }, stage === "processing" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"
  }), " Conectando con la pasarela\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(LIcon, {
    name: "Lock",
    size: 15
  }), " Pagar de forma segura")), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 font-mono text-[10px] text-white/30 text-center flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "ShieldCheck",
    size: 12
  }), " Pago protegido \xB7 Wompi & Mercado Pago"));
}
Object.assign(window, {
  PricingSection
});

/* ===== nova-business.jsx ===== */
// NOVA — Para tu negocio: alquila los bots B2B vía WhatsApp
const {
  useState: useBizState
} = React;
const WHATSAPP_NUMBER = "573248874403";
const WHATSAPP_DISPLAY = "+57 324 887 4403";
const NOVA_EMAIL = "novalabscolombia@gmail.com";
function waLink(text) {
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
}

// CTA de instalación que aparece bajo la simulación de cada bot de empresa
function InstallCTA({
  agentId
}) {
  const bot = BIZ_BOTS.find(b => b.id === agentId);
  if (!bot) return null;
  const msg = bot.msg;
  return /*#__PURE__*/React.createElement("div", {
    "data-reveal": "scale",
    className: "mt-12 relative overflow-hidden rounded-2xl border border-[var(--accent)]/30 bg-white/[0.03] p-8 md:p-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 pointer-events-none opacity-[0.13]",
    style: {
      background: "radial-gradient(ellipse 70% 80% at 85% 0%, var(--accent), transparent 70%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative flex flex-col md:flex-row md:items-center gap-7 justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 mb-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-7 h-7 rounded-lg grid place-items-center border border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/10"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Wrench",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--accent)]"
  }, "Instalaci\xF3n y acompa\xF1amiento")), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl md:text-3xl font-medium text-white leading-tight mb-3"
  }, "\xBFListo para poner a ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, bot.name), " a trabajar en tu negocio?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm md:text-base text-white/50 leading-relaxed"
  }, "Lo instalamos, lo calibramos en tu operaci\xF3n real y te acompa\xF1amos hasta que cumpla su objetivo. Escr\xEDbenos y agendamos una demo sin costo.")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3 shrink-0"
  }, /*#__PURE__*/React.createElement("a", {
    href: waLink(msg),
    target: "_blank",
    rel: "noopener noreferrer",
    className: "glow-btn group relative inline-flex rounded-full p-px overflow-hidden"
  }, /*#__PURE__*/React.createElement("span", {
    className: "relative z-10 flex items-center justify-center gap-2.5 rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition-colors group-hover:bg-[#0b0b0e]"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "MessageCircle",
    size: 16
  }), "Solicitar instalaci\xF3n")), /*#__PURE__*/React.createElement("a", {
    href: "mailto:" + NOVA_EMAIL,
    className: "inline-flex items-center justify-center gap-2 font-mono text-[11px] text-white/40 hover:text-[var(--accent)] transition-colors"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Mail",
    size: 13
  }), NOVA_EMAIL))));
}
const BIZ_BOTS = [{
  id: "axon",
  name: "AXON",
  icon: "Store",
  sector: "Restaurantes",
  line: "Toma pedidos por WhatsApp 24/7, calcula domicilios y nunca pierde una venta.",
  msg: "Hola NOVA 👋 Quiero alquilar AXON para mi restaurante. ¿Me cuentan precios y cómo empezar?"
}, {
  id: "barber",
  name: "BARBER IA",
  icon: "Scissors",
  sector: "Barberías",
  line: "Llena la agenda, mata los no-shows y agenda turnos solo, sin que contestes un mensaje.",
  msg: "Hola NOVA 👋 Quiero alquilar BARBER IA para mi barbería. ¿Me dan información?"
}, {
  id: "cortex",
  name: "CORTEX",
  icon: "Headphones",
  sector: "Empresas",
  line: "Atención al cliente masiva 24/7 con respuestas basadas en tu documentación.",
  msg: "Hola NOVA 👋 Me interesa CORTEX para la atención al cliente de mi empresa. ¿Cómo funciona?"
}, {
  id: "mentor",
  name: "MENTOR IA",
  icon: "GraduationCap",
  sector: "Talento / RR.HH.",
  line: "Onboarding interno: resuelve las 10.000 preguntas repetitivas y libera a RR.HH.",
  msg: "Hola NOVA 👋 Quiero MENTOR IA para el onboarding de mi equipo. ¿Me asesoran?"
}];
function BizCard({
  bot
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: waLink(bot.msg),
    target: "_blank",
    rel: "noopener noreferrer",
    className: "group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all duration-500 hover:border-[var(--accent)]/40 hover:bg-white/[0.04] hover:-translate-y-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-11 h-11 rounded-xl grid place-items-center border border-white/12 text-white/70 bg-white/[0.02] group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)] transition-colors"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: bot.icon,
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[10px] tracking-[0.2em] uppercase text-white/35"
  }, bot.sector)), /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-medium text-white mb-2"
  }, bot.name), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed mb-6 flex-1"
  }, bot.line), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-white/45 group-hover:text-[var(--accent)] transition-colors"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "MessageCircle",
    size: 14
  }), "Consultar por WhatsApp", /*#__PURE__*/React.createElement("span", {
    className: "transition-transform duration-300 group-hover:translate-x-1"
  }, "\u2192")));
}
function BusinessSection() {
  return /*#__PURE__*/React.createElement("section", {
    id: "empresas",
    "data-screen-label": "Para tu negocio",
    className: "relative max-w-6xl mx-auto px-6 pt-24 pb-28 scroll-mt-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:sticky lg:top-28"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Building2",
    className: "mb-6"
  }, "06 \xB7 Para tu negocio"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-5xl font-medium tracking-tight text-white leading-[1.08] mb-6"
  }, "Alquila un agente.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "Sin instalar nada"), "."), /*#__PURE__*/React.createElement("p", {
    className: "text-base md:text-lg text-white/45 leading-relaxed mb-8 max-w-md"
  }, "Cada bot vive en el WhatsApp de tu negocio y trabaja por ti desde el primer d\xEDa. Escr\xEDbenos y lo dejamos andando \u2014 precios, demo y configuraci\xF3n a tu medida."), /*#__PURE__*/React.createElement("a", {
    href: waLink("Hola NOVA 👋 Quiero información para alquilar uno de sus bots para mi negocio."),
    target: "_blank",
    rel: "noopener noreferrer",
    className: "glow-btn group relative inline-flex rounded-full p-px overflow-hidden"
  }, /*#__PURE__*/React.createElement("span", {
    className: "relative z-10 flex items-center gap-3 rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition-colors group-hover:bg-[#0b0b0e]"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "MessageCircle",
    size: 16
  }), "Hablar con NOVA por WhatsApp")), /*#__PURE__*/React.createElement("p", {
    className: "mt-5 font-mono text-[11px] text-white/30 leading-relaxed max-w-xs"
  }, "Respuesta en segundos \xB7 planes mensuales para uno o varios locales.")), /*#__PURE__*/React.createElement("div", {
    className: "grid sm:grid-cols-2 gap-4"
  }, BIZ_BOTS.map(b => /*#__PURE__*/React.createElement(BizCard, {
    key: b.id,
    bot: b
  })))));
}
Object.assign(window, {
  BusinessSection,
  InstallCTA,
  waLink,
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  NOVA_EMAIL,
  BIZ_BOTS
});

/* ===== nova-policies.jsx ===== */
// NOVA — Políticas públicas, confianza y respaldo
const {
  useState: usePolState
} = React;
const TRUST_BADGES = [["BadgeCheck", "Verificada por Meta", "Cuenta de WhatsApp Business oficial vía Meta Cloud API."], ["ShieldCheck", "Ley 1581 de 2012", "Tratamiento de datos conforme al régimen colombiano."], ["Lock", "Seguridad por diseño", "Cifrado, aislamiento por cliente y conexiones seguras."], ["HeartHandshake", "Acompañamiento real", "Instalación presencial y calibración en tu operación."]];
const POLICIES = [{
  icon: "Sparkles",
  title: "IA responsable y honesta",
  body: "Nuestros agentes no inventan información: cada bot opera solo sobre datos reales del negocio. «La IA propone, el sistema decide» — un motor de reglas valida cada operación crítica antes de ejecutarla. No prometemos resultados mágicos ni capacidades que la tecnología no tiene."
}, {
  icon: "Users",
  title: "La IA al servicio de las personas",
  body: "Entendemos la IA como una palanca que libera al talento humano de lo repetitivo, no como un sustituto. Diseñamos para potenciar a los equipos. Quien conversa con un agente puede saber que habla con un asistente y llegar a una persona real cuando lo necesite."
}, {
  icon: "ShieldCheck",
  title: "Protección de datos personales",
  body: "Tratamos los datos conforme al régimen colombiano (Constitución art. 15, Ley 1581 de 2012, Decreto 1377 de 2013 y Ley 1266 de 2008) y bajo responsabilidad demostrada. Solo pedimos los datos necesarios y con autorización; respetamos los derechos de habeas data (conocer, actualizar, rectificar, suprimir y revocar); nunca usamos la información para fines ajenos ni la vendemos."
}, {
  icon: "Lock",
  title: "Seguridad de la información",
  body: "Cifrado de credenciales y secretos fuera del código; conexiones HTTPS y acceso por llave; aislamiento total de los datos entre clientes; respaldos periódicos y procedimientos de respuesta a incidentes."
}, {
  icon: "Ban",
  title: "Uso aceptable",
  body: "Nuestros servicios deben usarse de forma lícita y ética. Está prohibido: actividades ilícitas, spam o mensajería masiva sin consentimiento, suplantación o acoso, engaño a usuarios finales, recolección de datos sin autorización e intentos de vulnerar la seguridad de NOVA."
}, {
  icon: "BadgeCheck",
  title: "Empresa verificada por Meta",
  body: "NOVA opera con una cuenta de WhatsApp Business verificada por Meta y la API oficial (Meta Cloud API). Cuando conversas con NOVA por WhatsApp lo haces con una empresa legítima y verificada en la plataforma oficial — no automatizaciones no autorizadas."
}];
function PolicyRow({
  icon,
  title,
  body
}) {
  const [open, setOpen] = usePolState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "border border-white/[0.08] rounded-xl bg-white/[0.02] overflow-hidden transition-colors hover:border-white/15"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(v => !v),
    "aria-expanded": open,
    className: "w-full flex items-center gap-4 px-5 py-4 text-left outline-none group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-9 h-9 shrink-0 rounded-lg grid place-items-center border transition-colors " + (open ? "border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/5" : "border-white/12 text-white/50")
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: icon,
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "flex-1 text-sm md:text-base font-medium transition-colors " + (open ? "text-[var(--accent)]" : "text-white/85 group-hover:text-white")
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-lg leading-none shrink-0 transition-transform duration-300 " + (open ? "rotate-45 text-[var(--accent)]" : "text-white/30")
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "grid transition-all duration-400 ease-out " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
  }, /*#__PURE__*/React.createElement("div", {
    className: "overflow-hidden"
  }, /*#__PURE__*/React.createElement("p", {
    className: "px-5 pb-5 pl-[72px] text-sm leading-relaxed text-white/50"
  }, body))));
}
function PoliciesSection() {
  return /*#__PURE__*/React.createElement("section", {
    id: "politicas",
    "data-screen-label": "Pol\xEDticas y confianza",
    className: "relative max-w-6xl mx-auto px-6 pt-24 pb-28 scroll-mt-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center flex flex-col items-center mb-14"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "ShieldCheck",
    className: "mb-6 justify-center"
  }, "08 \xB7 Confianza"), /*#__PURE__*/React.createElement("h2", {
    "data-reveal": true,
    className: "text-3xl md:text-5xl font-medium tracking-tight text-white max-w-2xl"
  }, "Tecnolog\xEDa seria, ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "con respaldo real"), "."), /*#__PURE__*/React.createElement("p", {
    "data-reveal": true,
    className: "mt-6 max-w-lg text-base text-white/45 leading-relaxed"
  }, "Operamos bajo la ley colombiana de protecci\xF3n de datos y con cuenta verificada por Meta. Esto es lo p\xFAblico de c\xF3mo trabajamos.")), /*#__PURE__*/React.createElement("div", {
    "data-reveal": true,
    className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
  }, TRUST_BADGES.map(([icon, title, desc], i) => /*#__PURE__*/React.createElement("div", {
    key: title,
    "data-reveal": true,
    "data-reveal-delay": i * 70 + "ms",
    className: "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-11 h-11 rounded-xl grid place-items-center border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_18px_-6px_var(--accent-glow)] mb-4"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: icon,
    size: 19
  })), /*#__PURE__*/React.createElement("h4", {
    className: "text-white font-medium mb-1.5"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed"
  }, desc)))), /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-2 gap-3 max-w-5xl mx-auto"
  }, POLICIES.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.title,
    "data-reveal": true,
    "data-reveal-delay": i % 2 * 80 + "ms"
  }, /*#__PURE__*/React.createElement(PolicyRow, {
    icon: p.icon,
    title: p.title,
    body: p.body
  })))), /*#__PURE__*/React.createElement("p", {
    className: "mt-10 text-center font-mono text-[11px] text-white/30 leading-relaxed max-w-2xl mx-auto"
  }, "Gu\xEDa p\xFAblica de principios de NOVA S.A.S. \xB7 Barranquilla, Colombia \xB7 vigente desde junio de 2026. Los documentos legales vinculantes la complementan."));
}
Object.assign(window, {
  PoliciesSection
});

/* ===== nova-details.jsx ===== */
// NOVA — Contenido detallado por agente: Impacto Real + Bajo el Capó (acordeones) + Confianza/FAQ
const {
  useState: useDetState
} = React;

/* ---------- datos ---------- */

const AGENT_DETAILS = {
  magnus: {
    lead: "Tu copiloto total: vive en tu computador, ejecuta tareas, organiza tu agenda y automatiza tu vida diaria mientras tú te concentras en lo importante."
  },
  cortex: {
    lead: "Soporte masivo multi-canal con respuestas precisas basadas en la documentación real de tu empresa. Sin colas, sin horarios, sin respuestas inventadas."
  },
  axon: {
    impact: [["Cero pedidos perdidos", "Responde al instante, 24/7 — incluso domingo a medianoche o en el pico de demanda."], ["Menos errores, más caja", "Precios exactos, sin descuentos improvisados ni platos que no existen. El administrador aprueba cada cambio."], ["Equipo enfocado en la cocina", "El domiciliario ve su ruta, la cocina ve el pedido y el dueño ve las métricas — en un panel web en tiempo real."], ["Análisis mensual con IA", "Informe ejecutivo automático: platos más vendidos, picos de demanda y acciones concretas para el mes siguiente."], ["Clientes que regresan", "Encuesta de satisfacción de 1 mensaje tras cada entrega, con alerta inmediata al administrador si el puntaje es bajo."]],
    hood: [["Cerebro dual con redundancia automática", "El motor principal corre sobre Groq (inferencia ultrarrápida, respuestas en menos de 1 segundo). Si hay caída o límite de tasa, el sistema conmuta en tiempo real a Gemini de Google — el cliente nunca percibe la interrupción."], ["Prompt engineering con identidad del restaurante", "Cada restaurante tiene su propio system prompt compilado dinámicamente: menú actualizado, horarios, zona de domicilios, personalidad del bot y mensaje de bienvenida. El modelo opera siempre con el contexto completo del negocio."], ["Comprensión de lenguaje natural colombiano", "Interpreta jerga local sin fricción: «sísas» como confirmación, «nombe» como negación, «100k» como $100.000, «tramacuda» como el ítem más grande del menú."], ["Captura estructurada y multi-tenant", "Cada pedido confirmado se extrae como un bloque JSON estructurado que viaja por WebSockets al panel del administrador y al domiciliario. Una sola plataforma atiende múltiples restaurantes con aislamiento total de datos."]]
  },
  barber: {
    impact: [["Llena la agenda 24/7", "Capta clientes de noche o fin de semana, agendando a diez personas en paralelo, sin «espera que ya te confirmo»."], ["Mata los «no-shows»", "Recordatorios automáticos por WhatsApp antes de cada cita; si cancelan, el hueco se reabre solo para que entre otro."], ["Devuélvele horas a tu día", "El bot absorbe toda la coordinación de horarios, barberos y servicios. Tú cortas; él agenda."], ["Cliente nuevo, cliente de siempre", "Recuerda preferencias, dirige a cada cliente a su barbero de confianza y agenda en 20 segundos."], ["Vende más en cada reserva", "Ofrece el combo correcto («¿le sumamos arreglo de barba?») en el momento exacto de decidir."], ["Cero errores de agenda", "Sin dobles reservas ni choques entre barberos: la agenda es una sola fuente de verdad."]],
    hood: [["El flujo de una reserva, paso a paso", "Escucha en lenguaje natural («quiero un corte mañana con Carlos»), consulta la disponibilidad real, ofrece solo horas que existen, recoge los datos que faltan de a uno — sin formularios —, revalida el hueco en el último milisegundo y avisa al cliente y al dueño."], ["El motor de disponibilidad (la joya)", "Cruza en milisegundos el horario de atención, la duración real del servicio (un corte+barba no cabe donde solo cabe un corte), las citas ya tomadas y los bloqueos de descansos — calculado por barbero, de forma independiente."], ["«La IA propone, el sistema decide»", "La IA nunca escribe sola en la agenda: un motor de reglas inflexible revalida cada hueco en el instante de guardarlo. Dos personas no pueden quedarse con la misma hora aunque escriban en el mismo segundo."], ["Automatización total", "Recordatorios autónomos 24/7 en segundo plano; cancelar o reagendar ocurre en la misma conversación y el hueco se reabre al instante, con protección anti-duplicados."], ["Panel del dueño y arquitectura", "Control total desde tu propio WhatsApp: ver la agenda, cancelar citas, agregar barberos, actualizar servicios (hasta con un Excel) y recibir reportes. Plataforma multi-barbería con aislamiento total entre locales."]]
  },
  mentor: {
    impact: [["Orden en los primeros 30 días", "Responde al instante las 10.000 preguntas repetitivas de cultura, pagos y logística («¿Cuándo me pagan?», «¿Dónde está el organigrama?»)."], ["Deriva con empatía", "Detecta casos emocionales o salariales y conecta con el equipo humano de RR.HH. sin sonar rígido ni burocrático."], ["Retorno tangible", "Libera 5–8 horas semanales a RR.HH., reduce errores administrativos, triplica la retención del primer mes y acelera la productividad 5–7 días."]],
    hood: [["Arquitectura en 3 capas", "Capa 1: identidad invariable del bot + conocimiento específico del tenant (cultura, políticas, org chart). Capa 2: orquestación — validación de canales activos y memoria de conversación por usuario. Capa 3: canales — web chat incrustado en tu intranet y WhatsApp vía Meta Cloud API, integrados en una sola conversación."], ["El flujo de una respuesta", "Valida canal y usuario, carga la base de conocimiento del tenant, inyecta el checklist de documentos como contexto vivo y consulta el modelo con temperatura baja (0.6): preciso, no creativo. Con una base de conocimiento cerrada y validada, no inventa salarios, fechas ni políticas."], ["Casos especiales y seguridad", "Lenguaje emocional → empatía genuina y derivación a RR.HH. Fuera de alcance (poemas, clima) → declina con amabilidad. Detecta el idioma y responde en el mismo. Valida archivos (PDF/JPG, máx 10 MB) y guarda documentos sensibles con nombre ofuscado, aislados por tenant."]]
  }
};
const NOVA_FAQ = [["¿Qué pasa si dos clientes reservan a la vez?", "No pueden quedarse con la misma hora: el hueco se valida en el instante exacto de escribirlo en la agenda, no antes. Si el primero lo toma, al segundo se le ofrece la siguiente opción real."], ["¿Puede inventar datos, precios u horarios?", "No. Cada agente opera solo sobre catálogos, agendas y bases de conocimiento reales del negocio, y un motor de reglas revalida todo antes de confirmar."], ["¿Qué pasa si escriben con faltas de ortografía o jerga?", "La IA interpreta lenguaje natural aunque venga desordenado, con errores o en jerga local. Si falta un dato, pregunta únicamente ese — nunca un formulario."], ["¿Requiere instalación?", "No. Todo ocurre en WhatsApp o en un widget web incrustado. Tampoco para el dueño: el panel vive en el navegador y el control diario, en su propio WhatsApp."]];

/* ---------- componentes ---------- */

function Accordion({
  title,
  children,
  defaultOpen
}) {
  const [open, setOpen] = useDetState(!!defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    className: "border border-white/[0.08] rounded-xl bg-white/[0.02] overflow-hidden transition-colors hover:border-white/15"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(v => !v),
    "aria-expanded": open,
    className: "w-full flex items-center justify-between gap-4 px-5 py-4 text-left outline-none group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm md:text-base font-medium transition-colors " + (open ? "text-[var(--accent)]" : "text-white/80 group-hover:text-white")
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-lg leading-none shrink-0 transition-transform duration-300 " + (open ? "rotate-45 text-[var(--accent)]" : "text-white/30")
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "grid transition-all duration-400 ease-out " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
  }, /*#__PURE__*/React.createElement("div", {
    className: "overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-5 pb-5 text-sm leading-relaxed text-white/50"
  }, children))));
}
function ImpactCard({
  title,
  desc
}) {
  const [open, setOpen] = useDetState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(v => !v),
    "aria-expanded": open,
    className: "text-left rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-white/15 outline-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-medium transition-colors " + (open ? "text-[var(--accent)]" : "text-white/90")
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-base leading-none shrink-0 mt-0.5 transition-transform duration-300 " + (open ? "rotate-45 text-[var(--accent)]" : "text-white/30")
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "grid transition-all duration-300 ease-out " + (open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0")
  }, /*#__PURE__*/React.createElement("div", {
    className: "overflow-hidden"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed"
  }, desc))));
}
function AgentDetails({
  agentId
}) {
  const d = AGENT_DETAILS[agentId];
  if (agentId === "magnus" && window.MagnusCapabilities) {
    return /*#__PURE__*/React.createElement(MagnusCapabilities, null);
  }
  if (!d) return null;
  if (d.lead) {
    return /*#__PURE__*/React.createElement("p", {
      className: "mt-10 max-w-2xl text-base md:text-lg text-white/45 leading-relaxed"
    }, d.lead);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "mt-14 flex flex-col gap-14"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "TrendingUp",
    className: "mb-6"
  }, "Impacto real"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/35 font-mono mb-6 -mt-2"
  }, "Toca cada beneficio para ver el detalle \u2014\u2009", /*#__PURE__*/React.createElement("span", {
    className: "text-[var(--accent)]"
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4"
  }, d.impact.map(([title, desc]) => /*#__PURE__*/React.createElement(ImpactCard, {
    key: title,
    title: title,
    desc: desc
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Settings2",
    className: "mb-6"
  }, "Bajo el cap\xF3"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3 max-w-3xl"
  }, d.hood.map(([title, body], i) => /*#__PURE__*/React.createElement(Accordion, {
    key: title,
    title: title,
    defaultOpen: i === 0
  }, body)))));
}
function TrustSection() {
  return /*#__PURE__*/React.createElement("section", {
    "data-screen-label": "Confianza y FAQ",
    className: "relative max-w-6xl mx-auto px-6 pb-32"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "ShieldCheck",
    className: "mb-4"
  }, "03 \xB7 Garant\xEDa"), /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-2 gap-6 items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative rounded-2xl border border-[var(--accent)]/25 bg-white/[0.02] p-8 md:p-12 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 pointer-events-none opacity-[0.12]",
    style: {
      background: "radial-gradient(ellipse 80% 60% at 20% 0%, var(--accent), transparent 70%)"
    }
  }), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-4xl font-medium tracking-tight text-white leading-tight mb-5"
  }, "\xABLa IA propone,", /*#__PURE__*/React.createElement("br", null), "el ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "sistema"), " decide.\xBB"), /*#__PURE__*/React.createElement("p", {
    className: "text-white/50 leading-relaxed max-w-md"
  }, "En todo el ecosistema NOVA, la conversaci\xF3n es flexible pero los datos son inflexibles: la IA nunca escribe sola en agendas ni inventarios. Un motor de reglas revalida cada operaci\xF3n en el instante de ejecutarla. Cero errores de agenda. Cero inventos.")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "HelpCircle",
    dim: true,
    className: "mb-2"
  }, "Para los que preguntan m\xE1s"), NOVA_FAQ.map(([q, a]) => /*#__PURE__*/React.createElement(Accordion, {
    key: q,
    title: q
  }, a)))));
}
Object.assign(window, {
  AgentDetails,
  TrustSection,
  Accordion
});

/* ===== nova-about.jsx ===== */
// NOVA — Sección "Quiénes somos": identidad, manifiesto, líneas de impacto, principios, roadmap, equipo
const MANIFESTO = [["Descentralizamos la tecnología de frontera", "La inteligencia artificial está reconfigurando las industrias, pero el acceso a herramientas de última generación no puede quedarse atrapado en las grandes corporaciones ni centralizado en las capitales. Trabajamos para que cualquier comerciante, creador de marca y empresa en crecimiento, desde cualquier rincón de Colombia, tenga exactamente el mismo poder de innovación tecnológica para escalar sus operaciones."], ["Innovación medida en resultados comerciales", "No construimos tecnología por seguir una tendencia ni decorar una interfaz. Diseñamos sistemas con un propósito operativo claro: resolver los cuellos de botella cotidianos del tejido empresarial colombiano, garantizando que cada línea de código se traduzca en ahorro de tiempo, optimización de recursos y aumento de ventas tangibles."], ["Automatizar para potenciar el talento", "Entendemos la IA como una palanca de libertad operativa, no como un sustituto del valor humano. Cuando un agente inteligente se encarga de la ejecución básica, el talento nacional recupera el tiempo para hacer lo que mejor sabe hacer: crear, pensar la estrategia y expandir el negocio."], ["Aliados del tejido empresarial nacional", "Conocemos la diversidad, los desafíos y la velocidad a la que se mueve el comercio en las distintas regiones del país. No operamos como un proveedor de software distante; nos integramos a la realidad de nuestros clientes para acelerar la transformación digital desde la base de la economía colombiana."]];
const IMPACT_LINES = [["01", "Ingeniería de Procesos y Automatización", "Asistentes virtuales avanzados y flujos autónomos que integran canales clave como WhatsApp. Transformamos infraestructuras de atención tradicionales en sistemas capaces de vender, agendar y resolver solicitudes complejas las 24 horas del día."], ["02", "Consultoría en Madurez Digital", "Analizamos la estructura operativa y financiera de tu negocio para identificar oportunidades reales donde la IA puede reducir costos. Trazamos una hoja de ruta personalizada y medimos el impacto financiero real."], ["03", "Optimización Comercial con IA", "Potenciamos marketing, captación y ventas con modelos de lenguaje de última generación: flujos de contenido inteligentes, gestión de audiencias y automatización de campañas basados en datos reales de comportamiento."], ["04", "Células de Formación y Adopción", "La tecnología solo es útil si los equipos saben dominarla. Espacios de aprendizaje interactivos, talleres prácticos y bootcamps intensivos para adoptar metodologías ágiles apoyadas en IA, sin tecnicismos innecesarios."]];
const PRINCIPLES = [["Democratización real", "Si una solución tecnológica no es escalable y accesible para una Pyme colombiana, no es la solución correcta para nosotros."], ["Eficiencia empírica", "Buscamos la solución más directa y funcional. No diseñamos sistemas complejos si un flujo automatizado simple resuelve el problema de forma óptima."], ["Ética de datos y confianza", "Entornos seguros y transparentes que protegen la información comercial de las empresas y la privacidad de sus usuarios bajo los más altos estándares."], ["Acompañamiento en el terreno", "Monitoreamos y calibramos cada herramienta en escenarios reales de operación para asegurar que cumpla los objetivos de negocio trazados."]];
const ROADMAP = [["Horizonte actual", "Consolidar la formación técnica de los primeros 500 emprendedores e implementar herramientas de automatización comercial en 100 empresas a nivel nacional."], ["Estrategia país", "Convertir el modelo de NOVA en el principal referente de adopción digital para las Pymes de Colombia, impactando a más de 1.000 unidades de negocio con metodologías de optimización a la medida."], ["Visión de frontera", "Desarrollar un ecosistema modular de software e IA nativo, diseñado específicamente para acelerar la competitividad y la productividad empresarial en la región."]];
const FOUNDERS = [["EA", "Esteban Arévalo Molina", "Co-Fundador"], ["JA", "Jesús Arévalo Molina", "Co-Fundador"]];
function NodeField() {
  // red abstracta de nodos con flujo descendente: líneas en coordenadas %
  // (dashes uniformes en px) + parallax suave ligado al scroll
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const host = el.parentElement;
        const rect = host.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
        el.style.transform = "translateY(" + (progress * 140).toFixed(1) + "px)";
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  const nodes = [[8, 2], [24, 1], [40, 3.5], [56, 1.5], [72, 3], [88, 1], [95, 4], [12, 18], [32, 26], [50, 21], [68, 28], [85, 20], [20, 46], [44, 52], [64, 47], [90, 54], [10, 70], [36, 76], [58, 71], [80, 78], [28, 92], [52, 95], [74, 90]];
  const rawLinks = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 7], [1, 8], [2, 9], [4, 10], [5, 11], [7, 8], [9, 10], [7, 12], [8, 13], [9, 13], [10, 14], [11, 15], [12, 13], [14, 15], [12, 16], [13, 17], [14, 18], [15, 19], [16, 17], [18, 19], [16, 20], [17, 20], [18, 21], [19, 22], [20, 21], [21, 22]];
  // orientar cada enlace hacia abajo para que el flujo descienda
  const links = rawLinks.map(([a, b]) => nodes[a][1] <= nodes[b][1] ? [a, b] : [b, a]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: "absolute inset-0 pointer-events-none will-change-transform",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "absolute inset-0 w-full h-full"
  }, links.map(([a, b], i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: nodes[a][0] + "%",
    y1: nodes[a][1] + "%",
    x2: nodes[b][0] + "%",
    y2: nodes[b][1] + "%",
    stroke: "white",
    strokeWidth: "1",
    opacity: "0.05"
  }), /*#__PURE__*/React.createElement("line", {
    className: "flow-line",
    x1: nodes[a][0] + "%",
    y1: nodes[a][1] + "%",
    x2: nodes[b][0] + "%",
    y2: nodes[b][1] + "%",
    stroke: "var(--accent)",
    strokeWidth: "1",
    opacity: "0.22",
    style: {
      animationDuration: 7 + i % 6 * 1.5 + "s",
      animationDelay: -(i % 9) * 1.3 + "s"
    }
  })))), nodes.map(([x, y], i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "node-dot absolute w-[5px] h-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]",
    style: {
      left: x + "%",
      top: y + "%",
      animationDelay: i % 7 * 0.6 + "s",
      animationDuration: 3 + i % 5 + "s"
    }
  })));
}
function AboutSection() {
  return /*#__PURE__*/React.createElement("section", {
    id: "quienes-somos",
    "data-screen-label": "Qui\xE9nes somos",
    className: "relative border-t border-white/[0.06] overflow-hidden"
  }, /*#__PURE__*/React.createElement(NodeField, null), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-6xl mx-auto px-6 pt-32 pb-24"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Network",
    className: "mb-4"
  }, "07 \xB7 Qui\xE9nes somos"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-6xl font-medium tracking-tight text-white leading-[1.08] max-w-4xl"
  }, "Inteligencia artificial real para los negocios que ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "mueven a Colombia"), "."), /*#__PURE__*/React.createElement("p", {
    className: "mt-8 max-w-2xl text-base md:text-lg text-white/45 leading-relaxed"
  }, "NOVA es una agencia de adopci\xF3n tecnol\xF3gica y automatizaci\xF3n avanzada. Desarrollamos e implementamos herramientas pr\xE1cticas de inteligencia artificial para que las empresas y emprendedores de todo el pa\xEDs multipliquen su productividad, optimicen sus costos fijos y compitan sin desventajas en la econom\xEDa digital global."), /*#__PURE__*/React.createElement("p", {
    className: "mt-10"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#simulador",
    className: "group inline-flex items-center gap-3 font-mono text-sm text-[var(--accent)] hover:text-white transition-colors"
  }, "\xDAnete al ecosistema nacional", /*#__PURE__*/React.createElement("span", {
    className: "transition-transform duration-300 group-hover:translate-x-1"
  }, "\u2192")))), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-6xl mx-auto px-6 pb-28"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Compass",
    dim: true,
    className: "mb-10"
  }, "Nuestro manifiesto"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-x-14 gap-y-12"
  }, MANIFESTO.map(([title, body]) => /*#__PURE__*/React.createElement("div", {
    key: title
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl md:text-2xl font-medium tracking-tight text-white/90 mb-4"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm md:text-base text-white/45 leading-relaxed"
  }, body))))), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-6xl mx-auto px-6 pb-28"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Zap",
    dim: true,
    className: "mb-10"
  }, "L\xEDneas de impacto"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col divide-y divide-white/[0.07] border-y border-white/[0.07]"
  }, IMPACT_LINES.map(([num, title, body]) => /*#__PURE__*/React.createElement("div", {
    key: num,
    className: "group grid md:grid-cols-[80px_1fr_1.2fr] gap-4 md:gap-10 py-8 transition-colors hover:bg-white/[0.015]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-sm text-[var(--accent)]"
  }, num, " /"), /*#__PURE__*/React.createElement("h3", {
    className: "text-lg md:text-xl font-medium tracking-tight text-white/90"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed"
  }, body))))), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-6xl mx-auto px-6 pb-28"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Scale",
    dim: true,
    className: "mb-10"
  }, "Principios operativos"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-4 gap-4"
  }, PRINCIPLES.map(([title, body]) => /*#__PURE__*/React.createElement("div", {
    key: title,
    className: "rounded-xl border border-white/[0.07] bg-white/[0.02] p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-white/90 font-medium mb-3"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed"
  }, body))))), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-6xl mx-auto px-6 pb-28"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Rocket",
    dim: true,
    className: "mb-10"
  }, "Proyecci\xF3n de impacto"), /*#__PURE__*/React.createElement("ol", {
    className: "grid md:grid-cols-3 gap-4"
  }, ROADMAP.map(([title, body], i) => /*#__PURE__*/React.createElement("li", {
    key: title,
    className: "relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 pt-8"
  }, /*#__PURE__*/React.createElement("span", {
    className: "absolute top-0 left-6 -translate-y-1/2 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-[var(--accent)]/40 bg-black text-[var(--accent)]"
  }, "Fase ", i + 1), /*#__PURE__*/React.createElement("h3", {
    className: "text-white/90 font-medium mb-3"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed"
  }, body))))), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-6xl mx-auto px-6 pb-32"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Users",
    dim: true,
    className: "mb-10"
  }, "Direcci\xF3n estrat\xE9gica"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-[1.2fr_1fr] gap-12 items-start"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xl md:text-2xl text-white/70 leading-relaxed font-medium tracking-tight max-w-xl"
  }, "Nacimos con la firme convicci\xF3n de que las limitaciones de infraestructura o presupuesto no deben definir el techo de innovaci\xF3n de una empresa.", " ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "El talento nacional merece competir con herramientas globales.")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4"
  }, FOUNDERS.map(([initials, name, role]) => /*#__PURE__*/React.createElement("div", {
    key: name,
    className: "flex items-center gap-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-12 h-12 shrink-0 rounded-full border border-[var(--accent)]/40 grid place-items-center font-mono text-sm text-[var(--accent)]"
  }, initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-white/90 font-medium"
  }, name), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] tracking-[0.2em] text-white/35 uppercase mt-1"
  }, role))))))));
}
Object.assign(window, {
  AboutSection
});

/* ===== nova-app.jsx ===== */
// NOVA — Hero, Bento Grid, Footer, App
const {
  useState: useAppState,
  useEffect: useAppEffect,
  useRef: useAppRef
} = React;

// desplazamiento suave a una sección
function scrollToId(id, offset = 56) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({
    top: el.offsetTop - offset,
    behavior: "smooth"
  });
}
const NOVA_AGENTS = [{
  id: "magnus",
  name: "MAGNUS",
  tag: "NÚCLEO",
  desc: "Agente y asistente de tu computador y vida personal. El núcleo central del ecosistema.",
  sim: "magnus.os — asistente personal",
  big: true
}, {
  id: "axon",
  name: "AXON",
  tag: "RESTAURANTES",
  desc: "Automatización de pedidos y crecimiento para restaurantes.",
  sim: "axon.orders — pedidos en vivo"
}, {
  id: "barber",
  name: "BARBER IA",
  tag: "BARBERÍAS",
  desc: "Gestión inteligente de turnos y agenda, sin intervención humana.",
  sim: "barber.agenda — reservas autónomas"
}, {
  id: "cortex",
  name: "CORTEX",
  tag: "EMPRESAS",
  desc: "Atención al cliente masiva, 24/7, con respuestas en segundos.",
  sim: "cortex.support — soporte 24/7"
}, {
  id: "mentor",
  name: "MENTOR IA",
  tag: "TALENTO",
  desc: "Onboarding y soporte corporativo interno: cultura, pagos y documentos sin fricción.",
  sim: "mentor.onboarding — talento en vivo"
}];

/* ---------- HERO ---------- */

function Hero() {
  const goSim = () => scrollToId("ecosistema", 40);
  return /*#__PURE__*/React.createElement("header", {
    "data-screen-label": "Hero",
    className: "relative min-h-[92vh] flex flex-col items-center justify-center px-6 pt-24 pb-14 text-center overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    id: "heroLogo",
    className: "hero-logo-wrap mb-10 animate-fade-1"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/nova-n.png",
    alt: "Logo NOVA",
    className: "logo-n hero-logo-img w-48 md:w-64"
  })), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] md:text-xs tracking-[0.5em] text-[var(--accent)] uppercase mb-8 animate-fade-1"
  }, "NOVA \xB7 Matriz de agentes"), /*#__PURE__*/React.createElement("h1", {
    className: "max-w-5xl text-4xl md:text-7xl font-medium leading-[1.05] tracking-tight text-white animate-fade-2"
  }, "El ecosistema de Inteligencia Artificial que", " ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, "redefine el ma\xF1ana"), "."), /*#__PURE__*/React.createElement("p", {
    className: "max-w-xl mt-8 text-base md:text-lg text-white/45 leading-relaxed animate-fade-3"
  }, "Una matriz de agentes aut\xF3nomos que trabajan por ti mientras t\xFA decides el futuro."), /*#__PURE__*/React.createElement("div", {
    className: "mt-12 animate-fade-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: goSim,
    className: "glow-btn group relative rounded-full p-px overflow-hidden"
  }, /*#__PURE__*/React.createElement("span", {
    className: "relative z-10 flex items-center gap-3 rounded-full bg-black px-8 py-4 text-sm font-medium text-white transition-colors group-hover:bg-[#0b0b0e]"
  }, "Explorar el ecosistema", /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1"
  }, "→")))), /*#__PURE__*/React.createElement("p", {
    className: "hidden min-[500px]:block absolute bottom-8 font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase"
  }, "Scroll para descubrir"));
}

/* ---------- BENTO GRID ---------- */

function AgentCard({
  agent,
  active,
  onSelect,
  onGetMagnus
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onSelect(agent.id),
    "aria-pressed": active,
    className: "agent-card group relative text-left rounded-2xl border p-6 md:p-8 transition-all duration-500 outline-none w-full h-full flex flex-col " + (agent.big ? "md:p-10 " : "") + (active ? "border-[var(--accent)]/60 bg-white/[0.05] shadow-[0_0_60px_-15px_var(--accent-glow)]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]")
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[10px] tracking-[0.3em] px-2.5 py-1 rounded-full border transition-colors duration-500 " + (active ? "border-[var(--accent)]/50 text-[var(--accent)]" : "border-white/15 text-white/40")
  }, agent.tag), /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full transition-all duration-500 " + (active ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" : "bg-white/15")
  })), /*#__PURE__*/React.createElement("h3", {
    className: "font-medium tracking-tight text-white mb-3 " + (agent.big ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl")
  }, agent.name), /*#__PURE__*/React.createElement("p", {
    className: "text-white/45 leading-relaxed " + (agent.big ? "text-base md:text-lg max-w-md" : "text-sm")
  }, agent.desc), /*#__PURE__*/React.createElement("p", {
    className: "mt-6 font-mono text-[11px] transition-colors duration-500 " + (active ? "text-[var(--accent)]" : "text-white/25 group-hover:text-white/45")
  }, active ? "● simulando abajo" : "ver simulación →"), agent.big && /*#__PURE__*/React.createElement("span", {
    role: "button",
    tabIndex: 0,
    onClick: e => {
      e.stopPropagation();
      onGetMagnus();
    },
    onKeyDown: e => {
      if (e.key === "Enter" || e.key === " ") {
        e.stopPropagation();
        onGetMagnus();
      }
    },
    className: "consigue-btn mt-7 inline-flex items-center gap-2.5 self-start rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-black hover:brightness-110 transition-all cursor-pointer shadow-[0_0_30px_-6px_var(--accent-glow)]"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Download",
    size: 16
  }), "Consigue Magnus", /*#__PURE__*/React.createElement("span", {
    className: "transition-transform duration-300"
  }, "\u2192")));
}
function Ecosystem({
  active,
  onSelect,
  onGetMagnus
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "ecosistema",
    "data-screen-label": "Ecosistema",
    className: "relative max-w-6xl mx-auto px-6 pt-28 pb-16"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "LayoutGrid",
    className: "mb-4"
  }, "01 \xB7 El ecosistema"), /*#__PURE__*/React.createElement("div", {
    "data-reveal": true,
    className: "flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-14"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-5xl font-medium tracking-tight text-white max-w-2xl"
  }, "Cinco agentes. Una sola inteligencia."), /*#__PURE__*/React.createElement("a", {
    href: window.waLink ? window.waLink("Hola NOVA 👋 Quiero información sobre sus agentes de IA.") : "#empresas",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "group inline-flex items-center gap-2.5 self-start rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors whitespace-nowrap"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "MessageCircle",
    size: 15
  }), "Consultar por WhatsApp", /*#__PURE__*/React.createElement("span", {
    className: "transition-transform duration-300 group-hover:translate-x-1"
  }, "\u2192"))), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-4 md:grid-rows-2 gap-4"
  }, NOVA_AGENTS.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    "data-reveal": true,
    "data-reveal-delay": i * 70 + "ms",
    className: a.big ? "md:col-span-2 md:row-span-2" : ""
  }, /*#__PURE__*/React.createElement(AgentCard, {
    agent: a,
    active: active === a.id,
    onSelect: onSelect,
    onGetMagnus: onGetMagnus
  })))));
}

/* ---------- SIMULACIÓN ---------- */

function Simulator({
  active
}) {
  const agent = NOVA_AGENTS.find(a => a.id === active);
  const sims = {
    magnus: MagnusSim,
    axon: AxonSim,
    barber: BarberSim,
    cortex: CortexSim,
    mentor: MentorSim
  };
  const Sim = sims[active];
  const backToGrid = () => {
    const el = document.getElementById("ecosistema");
    if (el) window.scrollTo({
      top: el.offsetTop - 56,
      behavior: "smooth"
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "simulador",
    "data-screen-label": "Simulaci\xF3n en vivo",
    className: "relative max-w-6xl mx-auto px-6 pb-28 scroll-mt-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: backToGrid,
    className: "group mb-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white/80 hover:text-white hover:border-[var(--accent)]/70 hover:bg-white/[0.08] hover:shadow-[0_0_25px_-5px_var(--accent-glow)] transition-all duration-300 outline-none"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[var(--accent)] transition-transform duration-300 group-hover:-translate-x-1"
  }, "\u2190"), "Volver a los agentes"), /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "Activity",
    className: "mb-4"
  }, "02 \xB7 Simulaci\xF3n en vivo"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-5xl font-medium tracking-tight text-white mb-12"
  }, "As\xED trabaja ", /*#__PURE__*/React.createElement("span", {
    className: "text-glow"
  }, agent.name), "."), /*#__PURE__*/React.createElement("div", {
    key: active,
    className: "sim-enter"
  }, /*#__PURE__*/React.createElement(SimWindow, {
    title: agent.sim
  }, /*#__PURE__*/React.createElement(Sim, null))), /*#__PURE__*/React.createElement("div", {
    key: active + "-det"
  }, /*#__PURE__*/React.createElement(AgentDetails, {
    agentId: active
  })), active !== "magnus" && window.InstallCTA && /*#__PURE__*/React.createElement(InstallCTA, {
    agentId: active
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-14 flex justify-center"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: backToGrid,
    className: "group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.05] px-7 py-3.5 text-sm font-medium text-white/85 hover:text-white hover:border-[var(--accent)]/70 hover:bg-white/[0.08] hover:shadow-[0_0_25px_-5px_var(--accent-glow)] transition-all duration-300 outline-none"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[var(--accent)] transition-transform duration-300 group-hover:-translate-x-1"
  }, "\u2190"), "Volver al ecosistema")));
}

/* ---------- FOOTER ---------- */

function Footer() {
  const year = 2026;
  return /*#__PURE__*/React.createElement("footer", {
    id: "contacto",
    "data-screen-label": "Footer",
    className: "relative border-t border-white/[0.06] pt-20 pb-12 px-6 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-6xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-[1.4fr_1fr_1fr] gap-12 mb-16"
  }, /*#__PURE__*/React.createElement("div", {
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-5"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/nova-n.png",
    alt: "",
    className: "logo-n h-8 w-auto"
  }), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-base tracking-[0.4em] text-white"
  }, "NOVA", /*#__PURE__*/React.createElement("span", {
    className: "text-[var(--accent)]"
  }, "_"))), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-white/45 leading-relaxed max-w-xs mb-5"
  }, "IA de frontera, al alcance del emprendedor colombiano. La misma tecnolog\xEDa de las grandes, para tu negocio."), /*#__PURE__*/React.createElement("a", {
    href: waLink("Hola NOVA 👋 Quiero más información."),
    target: "_blank",
    rel: "noopener noreferrer",
    className: "inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--accent)]"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "BadgeCheck",
    size: 13
  }), "Empresa verificada por Meta")), /*#__PURE__*/React.createElement("div", {
    "data-reveal": true,
    "data-reveal-delay": "80ms"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] uppercase text-white/35 mb-5"
  }, "Contacto"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-3.5 text-sm"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: waLink("Hola NOVA 👋 Quiero más información."),
    target: "_blank",
    rel: "noopener noreferrer",
    className: "inline-flex items-center gap-2.5 text-white/55 hover:text-[var(--accent)] transition-colors"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "MessageCircle",
    size: 15
  }), WHATSAPP_DISPLAY)), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "mailto:" + NOVA_EMAIL,
    className: "inline-flex items-center gap-2.5 text-white/55 hover:text-[var(--accent)] transition-colors break-all"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "Mail",
    size: 15
  }), NOVA_EMAIL)), /*#__PURE__*/React.createElement("li", {
    className: "inline-flex items-center gap-2.5 text-white/55"
  }, /*#__PURE__*/React.createElement(LIcon, {
    name: "MapPin",
    size: 15
  }), "Barranquilla, Colombia"))), /*#__PURE__*/React.createElement("div", {
    "data-reveal": true,
    "data-reveal-delay": "160ms"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[10px] tracking-[0.25em] uppercase text-white/35 mb-5"
  }, "Explora"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-3.5 text-sm"
  }, [["Agentes", "#ecosistema"], ["Descargar Magnus", "#descargar"], ["Planes", "#planes"], ["Para tu negocio", "#empresas"], ["Políticas y confianza", "#politicas"]].map(([l, h]) => /*#__PURE__*/React.createElement("li", {
    key: h
  }, /*#__PURE__*/React.createElement("a", {
    href: h,
    className: "text-white/55 hover:text-[var(--accent)] transition-colors"
  }, l)))))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-white/30 tracking-wider text-center md:text-left"
  }, "©", " ", year, " NOVA S.A.S. \xB7 Barranquilla, Colombia \xB7 Todos los derechos reservados"), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-[11px] text-white/30"
  }, "\u201CLa IA propone, el sistema decide.\u201D"))));
}

/* ---------- APP ---------- */

const NOVA_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#67e8f9",
  "glow": 55,
  "bg": "#050505"
} /*EDITMODE-END*/;
function NovaApp() {
  const [t, setTweak] = useTweaks(NOVA_TWEAK_DEFAULTS);
  const [active, setActive] = useAppState("magnus");
  const selectAgent = id => {
    setActive(id);
    requestAnimationFrame(() => scrollToId("simulador", 56));
  };

  // scroll-reveal: revela elementos [data-reveal] al entrar en viewport
  useAppEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = e.target.dataset.revealDelay || "0ms";
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -7% 0px"
    });
    const run = () => document.querySelectorAll("[data-reveal]:not(.reveal-in)").forEach(el => io.observe(el));
    const id = setTimeout(run, 60);
    return () => {
      clearTimeout(id);
      io.disconnect();
    };
  }, [active]);

  // animación del logo del hero ligada al scroll (rotación + flotación + desvanecido)
  useAppEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const logo = document.getElementById("heroLogo");
    if (!logo || reduce) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const p = Math.min(1, y / 600);
        logo.style.transform = "translateY(" + (y * 0.25).toFixed(1) + "px) rotate(" + (p * 12).toFixed(1) + "deg) scale(" + (1 - p * 0.15).toFixed(3) + ")";
        logo.style.opacity = (1 - p * 0.7).toFixed(2);
      });
    };
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  const accentGlow = t.accent + Math.round(t.glow / 100 * 255).toString(16).padStart(2, "0");
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen text-white antialiased selection:bg-[var(--accent)] selection:text-black",
    style: {
      "--accent": t.accent,
      "--accent-glow": accentGlow,
      "--glow-opacity": t.glow / 100,
      backgroundColor: t.bg
    }
  }, /*#__PURE__*/React.createElement("nav", {
    className: "fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/[0.05] bg-black/30 backdrop-blur-xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/nova-n.png",
    alt: "",
    className: "logo-n h-6 w-auto"
  }), /*#__PURE__*/React.createElement("p", {
    className: "font-mono text-sm tracking-[0.4em]"
  }, "NOVA", /*#__PURE__*/React.createElement("span", {
    className: "text-[var(--accent)]"
  }, "_"))), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:flex items-center gap-7 font-mono text-[11px] tracking-[0.15em] uppercase text-white/45"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#ecosistema",
    className: "hover:text-[var(--accent)] transition-colors"
  }, "Agentes"), /*#__PURE__*/React.createElement("a", {
    href: "#descargar",
    className: "hover:text-[var(--accent)] transition-colors"
  }, "Magnus"), /*#__PURE__*/React.createElement("a", {
    href: "#empresas",
    className: "hover:text-[var(--accent)] transition-colors"
  }, "Empresas"))), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Ecosystem, {
    active: active,
    onSelect: selectAgent,
    onGetMagnus: () => scrollToId("planes", 56)
  }), /*#__PURE__*/React.createElement(Simulator, {
    active: active
  }), /*#__PURE__*/React.createElement(TrustSection, null), /*#__PURE__*/React.createElement(DownloadSection, null), /*#__PURE__*/React.createElement(PricingSection, null), /*#__PURE__*/React.createElement(BusinessSection, null), /*#__PURE__*/React.createElement(AboutSection, null), window.PoliciesSection && /*#__PURE__*/React.createElement(PoliciesSection, null), /*#__PURE__*/React.createElement(Footer, null), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Ne\xF3n"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Acento",
    value: t.accent,
    options: ["#67e8f9", "#a78bfa", "#6ee7a0", "#fda4af"],
    onChange: v => setTweak("accent", v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Intensidad del glow",
    value: t.glow,
    min: 0,
    max: 100,
    unit: "%",
    onChange: v => setTweak("glow", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Fondo"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Negro base",
    value: t.bg,
    options: ["#000000", "#050505", "#07070c"],
    onChange: v => setTweak("bg", v)
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(NovaApp, null));
