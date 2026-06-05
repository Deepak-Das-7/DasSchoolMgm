import { Response } from 'express';

export function generateCsv(
  res: Response,
  filename: string,
  headers: string[],
  rows: string[][]
) {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
