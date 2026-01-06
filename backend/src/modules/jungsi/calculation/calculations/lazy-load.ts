// Data version: 2024-12-16-v2
import * as fs from 'fs';
import * as path from 'path';
import { 유불리Type, 점수표Type, 학교조건Type } from './types';

// 캐시
let 점수표Cache: 점수표Type | null = null;
let 점수표2026Cache: 점수표Type | null = null;
let 학교조건Cache: 학교조건Type | null = null;
let 유불리Cache: 유불리Type | null = null;

const loadJsonFile = <T>(filename: string): T => {
  const filePath = path.join(__dirname, '..', 'data', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
};

export const lazy점수표 = (): Promise<점수표Type> => {
  if (!점수표Cache) {
    점수표Cache = loadJsonFile<점수표Type>('score-table-25-jungsi.json');
  }
  return Promise.resolve(점수표Cache);
};

export const lazy점수표2026 = (): Promise<점수표Type> => {
  if (!점수표2026Cache) {
    점수표2026Cache = loadJsonFile<점수표Type>('score-table-26-jungsi.json');
  }
  return Promise.resolve(점수표2026Cache);
};

export const lazy조건 = (): Promise<학교조건Type> => {
  if (!학교조건Cache) {
    학교조건Cache = loadJsonFile<학교조건Type>('2509-condition.json');
  }
  return Promise.resolve(학교조건Cache);
};

export const lazy유불리 = (): Promise<유불리Type> => {
  if (!유불리Cache) {
    유불리Cache = loadJsonFile<유불리Type>('2026-jungsi-advantage.json');
  }
  return Promise.resolve(유불리Cache);
};
