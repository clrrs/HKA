export const textSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const themeOptions = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export const brightnessOptions = [
  { value: 0.5, label: "50%" },
  { value: 0.75, label: "75%" },
  { value: 1, label: "100%" },
  { value: 1.25, label: "125%" },
];

export const screenReaderOptions = [
  { value: true, label: "On" },
  { value: false, label: "Off" },
];

export function cycleOption(options, currentValue) {
  const idx = options.findIndex((o) => o.value === currentValue);
  const nextIdx = idx === -1 ? 0 : (idx + 1) % options.length;
  return options[nextIdx];
}
