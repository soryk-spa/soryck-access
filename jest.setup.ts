import '@testing-library/jest-dom';
import React from 'react';

// Ensure this file is only processed in test environment
if (typeof jest !== 'undefined' && process.env.NODE_ENV === 'test') {
  // Mock Next.js modules
  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));

  jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      return React.createElement('img', { ...props, alt: props.alt || '' });
    },
  }));

  // Mock Clerk authentication
  jest.mock('@clerk/nextjs', () => ({
    useUser: () => ({
      isSignedIn: true,
      user: {
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
      },
    }),
    useAuth: () => ({
      isSignedIn: true,
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      getToken: jest.fn().mockResolvedValue('mock-token'),
    }),
    SignedIn: ({ children }: { children: React.ReactNode }) => children,
    SignedOut: () => null,
    UserButton: () => React.createElement('div', {}, 'User Button'),
    SignInButton: ({ children }: { children: React.ReactNode }) => children,
  }));

  // Mock sonner toast
  jest.mock('sonner', () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  }));

  // Global test utilities
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock fetch globally
  global.fetch = jest.fn();

  // Mock clipboard
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
      readText: jest.fn().mockResolvedValue(''),
    },
  });
}
