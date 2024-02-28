function numberToMonth(month: number) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Check if the number is within the 1-12 range
  if (month >= 1 && month <= 12) {
    // Arrays are zero-indexed so subtract 1 from the month number
    return months[month - 1];
  } else {
    return "Invalid month"; // or throw an error, or return null, depending on your needs
  }
}

export { numberToMonth };
