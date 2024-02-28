function toTitleCase(str: string) {
  // Replace underscores with spaces and split the string into words
  const words = str.replace(/_/g, " ").split(" ");

  // Capitalize the first letter of each word and join them back together
  const titleCasedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  return titleCasedWords.join(" ");
}

export { toTitleCase };
