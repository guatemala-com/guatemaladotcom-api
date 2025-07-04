# Test Setup and Utilities

This directory contains the Jest setup configuration and global test utilities.

## Setup File (`setup.ts`)

The `test/setup.ts` file is automatically loaded by Jest and provides:

### Global Mock Cleanup

- Automatically clears all mocks before and after each test
- No need to manually call `jest.clearAllMocks()` in individual tests

### Global Test Utilities

Accessible via `global.testUtils` in all test files:

```typescript
// Create mock data with overrides
const mockData = testUtils.createMockData(baseData, { status: 'error' });

// Wait for async operations
await testUtils.waitFor(100);

// Create mock errors
const error = testUtils.createMockError('Custom error message');
```

### Environment Setup

- Sets `NODE_ENV=test`
- Sets `PORT=3001`
- Optional console log suppression with `SUPPRESS_LOGS=true`

## Usage Examples

### Using Global Utilities

```typescript
import { mockHealthData } from '../__mocks__/healthcheck.mocks';

describe('HealthCheckService', () => {
  it('should handle error status', async () => {
    // Use global utility to create mock data with overrides
    const errorData = testUtils.createMockData(mockHealthData, {
      status: 'error',
    });

    // Use global utility to wait for async operations
    await testUtils.waitFor(50);

    // Test implementation...
  });
});
```

### Automatic Mock Cleanup

```typescript
describe('SomeService', () => {
  it('should work correctly', () => {
    // Mocks are automatically cleared before this test
    const mockFn = jest.fn();

    // Test implementation...

    // Mocks are automatically cleared after this test
  });
});
```

## Configuration

The setup file is configured in `package.json`:

```json
{
  "jest": {
    "setupFilesAfterEnv": ["<rootDir>/../test/setup.ts"]
  }
}
```

## TypeScript Support

Global types are defined in `test/types/global.d.ts` and included in `tsconfig.json`.

## Benefits

1. **Consistency**: All tests use the same cleanup and utility functions
2. **DRY Principle**: No need to repeat common test setup code
3. **Maintainability**: Centralized configuration and utilities
4. **Type Safety**: Full TypeScript support for global utilities
