export const PRODUCT_CATEGORIES = [
  "Cabinet",
  "GPU",
  "Keyboard",
  "Laptop",
  "Mobile",
  "Monitor",
  "Motherboard",
  "Mouse",
  "Processor",
  "Ram",
  "SSD",
  "Tablet",
  
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
