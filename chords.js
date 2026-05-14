function chordIntervals(notes) {
  const sorted = [...notes].sort((a, b) => a - b);
  const result = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    result.push((sorted[i] - sorted[i - 1]) % 12);
  }
  return result;
}

function shells(arr) {
  if (arr.length < 2 || arr.length > 4) return null;
  if (arr.length === 4 && arr[1] !== 0) return null;

  const pair = arr.length === 3 ? [arr[1], arr[2]] : [arr[2], arr[3]];
  const key = pair.join(',');

  const patterns = {
    '3,7': 'm7',
    '3,8': 'mM7',
    '4,6': '7',
    '4,7': 'M7',
    '10,5': 'm7',
    '10,6': '7',
    '11,4': 'mM7',
    '11,5': 'M7',
  };

  return patterns[key] || null;
}
