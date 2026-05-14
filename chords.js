function chordIntervals(notes) {
  const sorted = [...notes].sort((a, b) => a - b);
  const result = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    result.push((sorted[i] - sorted[i - 1]) % 12);
  }
  return result;
}
