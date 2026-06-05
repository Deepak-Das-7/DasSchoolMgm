export function calculateGradeFromPercentage(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

export function calculateGradeFromMarks(marksObtained: number, maxMarks: number): string {
  if (maxMarks <= 0) return 'F';
  const percentage = (marksObtained / maxMarks) * 100;
  return calculateGradeFromPercentage(percentage);
}

export function isPassed(marksObtained: number, passingMarks: number): boolean {
  return marksObtained >= passingMarks;
}
