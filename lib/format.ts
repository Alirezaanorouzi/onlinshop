const numberFormat = new Intl.NumberFormat("fa-IR");

export function formatNumber(value: number) {
  return numberFormat.format(value);
}

export function formatPrice(value: number) {
  return `${formatNumber(value)} تومان`;
}
