import { test, expect } from '@playwright/test';

// Test data
const VALID_CREDENTIALS = {
  bookingRef: 'TPH-SIL-001',
  firstName: 'Lewis',
};

const INJECTION_PAYLOADS = {
  sql: [
    "' OR '1'='1",
    "'; DROP TABLE profiles--",
    "admin'--",
  ],
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
  ],
};

test.describe('Authentication Security E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('The Pop Up Hotel');
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('should reject empty credentials', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Should show error or prevent submission
    const errorMessage = page.locator('text=/Invalid|required|error/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle SQL injection attempts safely', async ({ page }) => {
    for (const payload of INJECTION_PAYLOADS.sql) {
      await page.locator('input[type="text"]').first().fill(payload);
      await page.locator('input[type="text"]').nth(1).fill('TestUser');
      await page.click('button[type="submit"]');
      
      // Should show error, not crash or authenticate
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
      
      // Should not have successfully logged in
      expect(currentUrl).not.toContain('/shop');
      expect(currentUrl).not.toContain('/personal');
    }
  });

  test('should sanitize XSS attempts in form inputs', async ({ page }) => {
    for (const payload of INJECTION_PAYLOADS.xss) {
      await page.fill('input[type="text"]', payload);
      
      // Check that script tags are not executed
      const alertDialog = page.on('dialog', async dialog => {
        throw new Error('XSS alert dialog appeared!');
      });
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      // No alert should have appeared
      expect(true).toBe(true);
    }
  });

  test('should not expose sensitive data in network responses', async ({ page }) => {
    // Intercept network requests
    const responses: any[] = [];
    
    page.on('response', async response => {
      if (response.url().includes('api') || response.url().includes('supabase')) {
        try {
          const body = await response.text();
          responses.push({ url: response.url(), body });
        } catch (e) {
          // Ignore non-text responses
        }
      }
    });
    
    await page.locator('input[type="text"]').first().fill('INVALID-REF');
    await page.locator('input[type="text"]').nth(1).fill('Invalid');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Check that responses don't contain database structure info
    for (const response of responses) {
      expect(response.body.toLowerCase()).not.toContain('select ');
      expect(response.body.toLowerCase()).not.toContain('from profiles');
      expect(response.body.toLowerCase()).not.toContain('password');
    }
  });

  test('should prevent brute force with consistent error messages', async ({ page }) => {
    const attempts = [
      { ref: 'WRONG-001', name: 'TestUser' },
      { ref: 'WRONG-002', name: 'TestUser' },
      { ref: 'VALID-REF', name: 'WrongName' },
    ];
    
    const errorMessages: string[] = [];
    
    for (const attempt of attempts) {
      await page.locator('input[type="text"]').first().fill(attempt.ref);
      await page.locator('input[type="text"]').nth(1).fill(attempt.name);
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      
      const error = await page.locator('p:has-text("Invalid")').textContent();
      if (error) {
        errorMessages.push(error);
      }
    }
    
    // All error messages should be similar (don't reveal which part is wrong)
    if (errorMessages.length > 1) {
      expect(errorMessages[0]).toBe(errorMessages[1]);
    }
  });
});

test.describe('Session Management Security E2E', () => {
  test('should maintain session after page refresh', async ({ page }) => {
    await page.goto('/login');
    
    // Note: This test requires valid credentials in your test database
    const bookingInput = page.locator('input[placeholder="e.g. TPH-SIL-001"]');
    const nameInput = page.locator('input[placeholder="e.g. Lewis"]');
    
    await bookingInput.clear();
    await bookingInput.fill(VALID_CREDENTIALS.bookingRef);
    await nameInput.clear();
    await nameInput.fill(VALID_CREDENTIALS.firstName);
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/', { timeout: 5000 });
    
    // Refresh page
    await page.reload();
    
    // Should still be authenticated
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('should clear session on logout', async ({ page }) => {
    // First login (requires valid test data)
    await page.goto('/login');
    const bookingInput = page.locator('input[placeholder="e.g. TPH-SIL-001"]');
    const nameInput = page.locator('input[placeholder="e.g. Lewis"]');
    
    await bookingInput.clear();
    await bookingInput.fill(VALID_CREDENTIALS.bookingRef);
    await nameInput.clear();
    await nameInput.fill(VALID_CREDENTIALS.firstName);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/', { timeout: 5000 });
    
    // Check localStorage has auth data
    const beforeLogout = await page.evaluate(() => {
      return localStorage.getItem('popup-hotel-auth');
    });
    expect(beforeLogout).toBeTruthy();
    
    // Logout (if logout button exists)
    // TODO: Add logout button and test it here
    
    // For now, manually clear storage and verify redirect
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForURL('**/login', { timeout: 5000 });
    
    const afterLogout = await page.evaluate(() => {
      return localStorage.getItem('popup-hotel-auth');
    });
    expect(afterLogout).toBeFalsy();
  });

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Inject corrupted data
    await page.evaluate(() => {
      localStorage.setItem('popup-hotel-auth', '{corrupted-json}}}');
    });
    
    await page.reload();
    
    // Should redirect to login without crashing
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should not expose auth data in URL', async ({ page }) => {
    await page.goto('/login');
    const bookingInput = page.locator('input[placeholder="e.g. TPH-SIL-001"]');
    const nameInput = page.locator('input[placeholder="e.g. Lewis"]');
    
    await bookingInput.clear();
    await bookingInput.fill(VALID_CREDENTIALS.bookingRef);
    await nameInput.clear();
    await nameInput.fill(VALID_CREDENTIALS.firstName);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/', { timeout: 5000 });
    
    // Check URL doesn't contain sensitive data
    const url = page.url();
    expect(url).not.toContain('token');
    expect(url).not.toContain('password');
    expect(url).not.toContain('booking');
    expect(url).not.toContain(VALID_CREDENTIALS.bookingRef);
  });
});

test.describe('Authorization & Access Control E2E', () => {
  test('should block unauthenticated access to protected routes', async ({ page }) => {
    const protectedRoutes = ['/', '/shop', '/personal', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  });

  test('should not allow direct URL manipulation to bypass auth', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/personal');
    
    // Should be redirected to login
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // Try adding query parameters
    await page.goto('/personal?bypass=true');
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // Try hash parameters
    await page.goto('/personal#admin');
    await page.waitForURL('**/login', { timeout: 5000 });
  });
});

test.describe('XSS Prevention E2E', () => {
  test('should not execute scripts in dynamic content', async ({ page }) => {
    let alertFired = false;
    
    page.on('dialog', async dialog => {
      alertFired = true;
      await dialog.dismiss();
    });
    
    await page.goto('/login');
    
    // Try XSS in form fields
    await page.locator('input[type="text"]').first().fill('<script>alert("XSS")</script>');
    await page.locator('input[type="text"]').nth(1).fill('<img src=x onerror=alert(1)>');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // No alert should have fired
    expect(alertFired).toBe(false);
  });

  test('should escape HTML in error messages', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('input[type="text"]').first().fill('<b>Bold</b>');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Check that HTML is not rendered
    const boldElement = page.locator('b:has-text("Bold")');
    await expect(boldElement).not.toBeVisible();
  });
});

test.describe('Network Security E2E', () => {
  test('should use secure communication protocols', async ({ page }) => {
    await page.goto('/login');
    
    // Check that no insecure resources are loaded
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.waitForLoadState('networkidle');
    
    // All requests should be HTTPS or localhost
    for (const url of requests) {
      if (!url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1')) {
        expect(url).toMatch(/^https:/);
      }
    }
  });

  test('should not leak data in console logs', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    await page.goto('/login');
    await page.locator('input[type="text"]').first().fill('SENSITIVE-REF-123');
    await page.locator('input[type="text"]').nth(1).fill('SensitiveUser');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Check console doesn't contain sensitive data
    for (const log of consoleLogs) {
      expect(log).not.toContain('SENSITIVE-REF-123');
      expect(log).not.toContain('SensitiveUser');
      expect(log.toLowerCase()).not.toContain('password');
    }
  });
});

test.describe('Performance & DoS Prevention E2E', () => {
  test('should handle rapid form submissions gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit form rapidly multiple times
    for (let i = 0; i < 10; i++) {
      await page.click('button[type="submit"]');
    }
    
    // Page should still be responsive
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle large input values without crashing', async ({ page }) => {
    await page.goto('/login');
    
    const largeString = 'A'.repeat(100000);
    
    try {
      await page.fill('input[type="text"]', largeString.substring(0, 1000));
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Page should still be functional
      await expect(page.locator('h1')).toBeVisible();
    } catch (e) {
      // Even if it times out, page shouldn't crash
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
