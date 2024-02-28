function formatNumberWithDots(number: number) {
  return new Intl.NumberFormat("de-DE").format(number);
}

export { formatNumberWithDots };
