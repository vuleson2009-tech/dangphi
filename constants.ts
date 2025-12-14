import { ColumnDefinition } from './types';

// The specific sheet URL provided by the user
export const TARGET_SHEET_URL = "https://docs.google.com/spreadsheets/d/1odeeElkiS3t26InwV4LKGK4DegIsUyss1WYhilDkmOQ/edit?usp=drivesdk";

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'date', label: 'Ngày', type: 'date' },
  { id: 'item', label: 'Hạng mục', type: 'text' },
  { id: 'amount', label: 'Số tiền', type: 'currency' },
  { id: 'category', label: 'Phân loại', type: 'text' },
  { id: 'note', label: 'Ghi chú', type: 'text' },
];

export const SAMPLE_PROMPTS = [
  "Hôm nay ăn sáng phở bò 45k, cafe đá 20k",
  "Đổ xăng 500k, mua tạp hóa 200k ngày hôm qua",
  "Thu tiền nhà tháng này 5 triệu",
];
