// Jest type declarations for test environment only
declare const jest: {
  fn(): any;
  mock(moduleName: string, factory?: () => unknown, options?: { virtual?: boolean }): void;
  clearAllMocks(): void;
  resetAllMocks(): void;
  restoreAllMocks(): void;
  spyOn<T, K extends keyof T>(object: T, method: K): any;
};

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const afterEach: (fn: () => void | Promise<void>) => void;
declare const beforeAll: (fn: () => void | Promise<void>) => void;
declare const afterAll: (fn: () => void | Promise<void>) => void;

// Global test environment variables
declare global {
  var ResizeObserver: any;
  var fetch: any;
  
  namespace NodeJS {
    interface Global {
      ResizeObserver: any;
      fetch: any;
    }
  }
  
  interface Window {
    matchMedia: any;
  }

  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveTextContent(text: string): R;
    }
  }
}

export {};
