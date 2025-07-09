/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Reflector } from '@nestjs/core';
import { Controller, Get } from '@nestjs/common';

// Import from oauth-auth.decorator.ts to test re-exports
import {
  OAuthAuth,
  OAuthAuthRead,
  OAuthAuthWrite,
  OAuthAuthAdmin,
  OAuthAuthScopes,
  OAUTH_AUTH_KEY,
  OAUTH_SCOPE_KEY,
} from '../oauth-auth.decorator';

describe('OAuth Auth Decorator Re-exports', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('Re-exported constants', () => {
    it('should re-export OAUTH_AUTH_KEY constant', () => {
      expect(OAUTH_AUTH_KEY).toBe('oauthAuth');
    });

    it('should re-export OAUTH_SCOPE_KEY constant', () => {
      expect(OAUTH_SCOPE_KEY).toBe('oauthScope');
    });
  });

  describe('Re-exported decorators', () => {
    it('should re-export OAuthAuth decorator', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth('test')
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(
        OAUTH_AUTH_KEY,
        TestController.prototype.testMethod,
      );
      const scopeMetadata = reflector.get(
        OAUTH_SCOPE_KEY,
        TestController.prototype.testMethod,
      );

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('test');
    });

    it('should re-export OAuthAuthRead decorator', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthRead()
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(
        OAUTH_AUTH_KEY,
        TestController.prototype.testMethod,
      );
      const scopeMetadata = reflector.get(
        OAUTH_SCOPE_KEY,
        TestController.prototype.testMethod,
      );

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('read');
    });

    it('should re-export OAuthAuthWrite decorator', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthWrite()
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(
        OAUTH_AUTH_KEY,
        TestController.prototype.testMethod,
      );
      const scopeMetadata = reflector.get(
        OAUTH_SCOPE_KEY,
        TestController.prototype.testMethod,
      );

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('write');
    });

    it('should re-export OAuthAuthAdmin decorator', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthAdmin()
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(
        OAUTH_AUTH_KEY,
        TestController.prototype.testMethod,
      );
      const scopeMetadata = reflector.get(
        OAUTH_SCOPE_KEY,
        TestController.prototype.testMethod,
      );

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('admin');
    });

    it('should re-export OAuthAuthScopes decorator', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes('read', 'write', 'admin')
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(
        OAUTH_AUTH_KEY,
        TestController.prototype.testMethod,
      );
      const scopeMetadata = reflector.get(
        OAUTH_SCOPE_KEY,
        TestController.prototype.testMethod,
      );

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('read write admin');
    });
  });

  describe('Backward compatibility', () => {
    it('should maintain same behavior as original decorators', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth()
        @Get()
        withoutScope() {
          return 'test';
        }

        @OAuthAuth('custom')
        @Get()
        withScope() {
          return 'test';
        }

        @OAuthAuthRead()
        @Get()
        readScope() {
          return 'test';
        }

        @OAuthAuthWrite()
        @Get()
        writeScope() {
          return 'test';
        }

        @OAuthAuthAdmin()
        @Get()
        adminScope() {
          return 'test';
        }

        @OAuthAuthScopes('read', 'write')
        @Get()
        multipleScopes() {
          return 'test';
        }
      }

      // Act & Assert
      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.withoutScope),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.withoutScope),
      ).toBeUndefined();

      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.withScope),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.withScope),
      ).toBe('custom');

      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.readScope),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.readScope),
      ).toBe('read');

      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.writeScope),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.writeScope),
      ).toBe('write');

      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.adminScope),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.adminScope),
      ).toBe('admin');

      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.multipleScopes),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.multipleScopes),
      ).toBe('read write');
    });
  });
});
