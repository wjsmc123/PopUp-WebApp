import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Global test utilities
export const SECURITY_TEST_DATA = {
  validUser: {
    booking_ref: 'TEST-SEC-001',
    first_name: 'Security',
  },
  injectionPayloads: {
    sql: [
      "' OR '1'='1",
      "'; DROP TABLE profiles--",
      "admin'--",
      "1' UNION SELECT * FROM profiles--",
    ],
    xss: [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      "<svg/onload=alert('XSS')>",
      "{{7*7}}",
      "${7*7}",
    ],
    nosql: [
      "{ $gt: '' }",
      "{ $ne: null }",
      "admin' || '1'=='1",
    ],
    pathTraversal: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32",
      "....//....//....//etc/passwd",
    ],
  },
};
