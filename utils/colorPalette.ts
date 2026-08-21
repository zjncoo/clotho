export interface ColorDefinition {
  name: string;
  hex: string;
  rgb: [number, number, number];
}

export const COLOR_PALETTE: ColorDefinition[] = [
  { name: 'Black', hex: '#141414', rgb: [20, 20, 20] },
  { name: 'White', hex: '#ffffff', rgb: [255, 255, 255] },
  { name: 'Off-White / Cream', hex: '#f4efe6', rgb: [244, 239, 230] },
  { name: 'Charcoal Grey', hex: '#3f3f46', rgb: [63, 63, 70] },
  { name: 'Light Grey', hex: '#cbd5e1', rgb: [203, 213, 225] },
  { name: 'Navy Blue', hex: '#172554', rgb: [23, 37, 84] },
  { name: 'Denim / Blue', hex: '#2563eb', rgb: [37, 99, 235] },
  { name: 'Sky Blue', hex: '#7dd3fc', rgb: [125, 211, 252] },
  { name: 'Beige / Sand', hex: '#d6c7b2', rgb: [214, 199, 178] },
  { name: 'Camel / Tan', hex: '#c19a6b', rgb: [193, 154, 107] },
  { name: 'Dark Brown', hex: '#451a03', rgb: [69, 26, 3] },
  { name: 'Olive / Khaki', hex: '#4d5b30', rgb: [77, 91, 48] },
  { name: 'Sage Green', hex: '#8a9a86', rgb: [138, 154, 134] },
  { name: 'Burgundy', hex: '#701a2b', rgb: [112, 26, 43] },
  { name: 'Red', hex: '#dc2626', rgb: [220, 38, 38] },
  { name: 'Pink / Rose', hex: '#f472b6', rgb: [244, 114, 182] },
  { name: 'Orange / Rust', hex: '#c2410c', rgb: [194, 65, 12] },
  { name: 'Yellow / Mustard', hex: '#ca8a04', rgb: [202, 138, 4] },
  { name: 'Purple', hex: '#7e22ce', rgb: [126, 34, 206] },
  { name: 'Silver / Metallic', hex: '#94a3b8', rgb: [148, 163, 184] },
  { name: 'Gold', hex: '#d97706', rgb: [217, 119, 6] },
];

export function getColorHex(name: string): string {
  const found = COLOR_PALETTE.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(c.name.toLowerCase())
  );
  return found ? found.hex : '#71717a';
}
