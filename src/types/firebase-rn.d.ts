import type { Persistence } from '@firebase/auth';

// Tipe bawaan firebase tidak mengekspos getReactNativePersistence pada resolusi TypeScript,
// padahal Metro memuat build React Native saat runtime.
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
