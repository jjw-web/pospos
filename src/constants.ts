// src/constants.ts
import { MenuCategory } from './types';

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    category: 'SỮA CHUA DẺO',
    items: [
      { id: 25, name: 'Sữa chua dẻo hoa quả', price: 45000 },
      { id: 26, name: 'Sữa chua dẻo bơ', price: 45000 },
      { id: 34, name: 'Sữa chua dẻo cacao', price: 35000 },
    ],
  },
  {
    category: 'SINH TỐ',
    items: [
      { id: 82, name: 'Bơ', price: 40000 },
      { id: 93, name: 'Chuối sữa chua', price: 40000 },
    ],
  },
  {
    category: 'NƯỚC ÉP',
    items: [
      { id: 53, name: 'Lựu', price: 45000 },
      { id: 52, name: 'Cóc', price: 35000 },
      { id: 60, name: 'Cam', price: 40000 },
      { id: 51, name: 'Ổi', price: 35000 },
      { id: 50, name: 'Bưởi', price: 45000 },
    ],
  },
  {
    category: 'NƯỚC ÉP MIX',
    items: [
      { id: 76, name: 'Cam dứa', price: 40000 },
      { id: 67, name: 'Cóc dứa', price: 35000 },
      { id: 64, name: 'Cóc ổi', price: 35000 },
    ],
  },
  {
    category: 'HOA QUẢ DẦM',
    items: [
      { id: 45, name: 'Bơ mãng cầu dầm sữa chua', price: 45000 },
      { id: 41, name: 'Bơ dầm sữa chua', price: 45000 },
    ],
  },
  {
    category: 'SNACK & THUỐC LÁ',
    items: [
      { id: 101, name: 'Sài gòn bạc', price: 20000 },
      { id: 102, name: 'Thăng long mềm', price: 20000 },
      { id: 103, name: 'Thăng long cứng', price: 20000 },
      { id: 104, name: 'Thăng long dẹt', price: 20000 },
      { id: 105, name: 'Man trắng', price: 35000 },
      { id: 106, name: 'Camel dưa hấu', price: 35000 },
      { id: 107, name: 'Camel trà đen', price: 45000 },
      { id: 108, name: 'Kent bấm', price: 45000 },
      { id: 109, name: 'Hướng dương', price: 15000 },
    ],
  }
];
