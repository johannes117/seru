import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadSheetsAsZip, type SheetData } from '@/helpers/file_helpers';

// Mock JSZip
const mockGenerateAsync = vi.fn();
const mockFile = vi.fn();
vi.mock('jszip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      file: mockFile,
      generateAsync: mockGenerateAsync
    }))
  };
});

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn((data) => ({ data })),
    book_new: vi.fn(() => ({ sheets: {} })),
    book_append_sheet: vi.fn()
  },
  write: vi.fn(() => new ArrayBuffer(0))
}));

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn(() => 'mock-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  // Reset mocks
  mockFile.mockClear();
  mockGenerateAsync.mockResolvedValue(new Blob());
  
  // Mock DOM
  const mockLink = {
    href: '',
    download: '',
    click: mockClick
  };
  
  mockCreateElement.mockReturnValue(mockLink);
  
  Object.defineProperty(global, 'document', {
    value: {
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild
      }
    },
    writable: true
  });
  
  Object.defineProperty(global, 'URL', {
    value: {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL
    },
    writable: true
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('downloadSheetsAsZip', () => {
  const testSheets: SheetData[] = [
    [['Name', 'Age'], ['John', 25], ['Jane', 30]],
    [['Name', 'Age'], ['Bob', 35], ['Alice', 40]]
  ];

  it('always uses .xlsx extension regardless of input file extension', async () => {
    await downloadSheetsAsZip(testSheets, 'customer_data.csv', 'output.zip');
    
    // Check that files were created with .xlsx extension
    expect(mockFile).toHaveBeenCalledWith('customer_data_01.xlsx', expect.any(ArrayBuffer));
    expect(mockFile).toHaveBeenCalledWith('customer_data_02.xlsx', expect.any(ArrayBuffer));
  });

  it('handles .xlsx input files correctly', async () => {
    await downloadSheetsAsZip(testSheets, 'data.xlsx', 'output.zip');
    
    expect(mockFile).toHaveBeenCalledWith('data_01.xlsx', expect.any(ArrayBuffer));
    expect(mockFile).toHaveBeenCalledWith('data_02.xlsx', expect.any(ArrayBuffer));
  });

  it('handles files without extension', async () => {
    await downloadSheetsAsZip(testSheets, 'data', 'output.zip');
    
    expect(mockFile).toHaveBeenCalledWith('data_01.xlsx', expect.any(ArrayBuffer));
    expect(mockFile).toHaveBeenCalledWith('data_02.xlsx', expect.any(ArrayBuffer));
  });
});