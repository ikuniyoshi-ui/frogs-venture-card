import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/frogs-venture-card/', // ★新しいリポジトリ名に合わせてください
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // APIキーの定義が必要な場合はここに追加しますが、
  // GitHub Pagesでは後述する「ユーザー入力方式」が安全です。
});