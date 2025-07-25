import { describe, it, expect } from 'vitest';
import { splitSheetCustom, type SheetData } from '@/helpers/file_helpers';

describe('splitSheetCustom', () => {
  const testData: SheetData = [
    ['Name', 'Age', 'City'], // Header
    ['John', 25, 'New York'],
    ['Jane', 30, 'Los Angeles'],
    ['Bob', 35, 'Chicago'],
    ['Alice', 40, 'Houston'],
    ['Charlie', 45, 'Phoenix'],
    ['Diana', 50, 'Philadelphia'],
  ];

  it('splits data according to custom sizes', () => {
    const customSizes = [2, 3];
    const result = splitSheetCustom(testData, customSizes);

    expect(result).toHaveLength(3);
    
    // First chunk should have header + 2 data rows
    expect(result[0]).toHaveLength(3);
    expect(result[0][0]).toEqual(['Name', 'Age', 'City']);
    expect(result[0][1]).toEqual(['John', 25, 'New York']);
    expect(result[0][2]).toEqual(['Jane', 30, 'Los Angeles']);

    // Second chunk should have header + 3 data rows
    expect(result[1]).toHaveLength(4);
    expect(result[1][0]).toEqual(['Name', 'Age', 'City']);
    expect(result[1][1]).toEqual(['Bob', 35, 'Chicago']);
    expect(result[1][2]).toEqual(['Alice', 40, 'Houston']);
    expect(result[1][3]).toEqual(['Charlie', 45, 'Phoenix']);

    // Third chunk should have header + remaining 1 row
    expect(result[2]).toHaveLength(2);
    expect(result[2][0]).toEqual(['Name', 'Age', 'City']);
    expect(result[2][1]).toEqual(['Diana', 50, 'Philadelphia']);
  });

  it('handles exact match of custom sizes', () => {
    const customSizes = [3, 3];
    const result = splitSheetCustom(testData, customSizes);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(4); // header + 3 rows
    expect(result[1]).toHaveLength(4); // header + 3 rows
  });

  it('handles empty custom sizes array', () => {
    const result = splitSheetCustom(testData, []);
    expect(result).toEqual([testData]);
  });

  it('handles single custom size', () => {
    const result = splitSheetCustom(testData, [2]);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(3); // header + 2 data rows
    expect(result[1]).toHaveLength(5); // header + remaining 4 data rows
  });

  it('ignores zero or negative sizes', () => {
    const customSizes = [2, 0, -1, 3];
    const result = splitSheetCustom(testData, customSizes);

    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(3); // header + 2 rows
    expect(result[1]).toHaveLength(4); // header + 3 rows
    expect(result[2]).toHaveLength(2); // header + remaining 1 row
  });

  it('creates separate file for remaining records - user scenario', () => {
    // Simulate the user's scenario: 20 total records, split into [3, 4, 4]
    const largerTestData: SheetData = [
      ['Name', 'Age', 'City'], // Header
      ...Array.from({length: 20}, (_, i) => [`Person${i+1}`, 20+i, `City${i+1}`])
    ];

    const customSizes = [3, 4, 4]; // Total: 11, remaining: 9
    const result = splitSheetCustom(largerTestData, customSizes);

    expect(result).toHaveLength(4); // Should create 4 files, not 3
    expect(result[0]).toHaveLength(4); // header + 3 rows
    expect(result[1]).toHaveLength(5); // header + 4 rows  
    expect(result[2]).toHaveLength(5); // header + 4 rows
    expect(result[3]).toHaveLength(10); // header + 9 remaining rows
  });
});