/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Reflector } from '@nestjs/core';
import { Controller, Get } from '@nestjs/common';
import {
  OAuthAuth,
  OAuthAuthRead,
  OAuthAuthWrite,
  OAuthAuthAdmin,
  OAuthAuthScopes,
  OAUTH_AUTH_KEY,
  OAUTH_SCOPE_KEY,
} from '../oauth-scopes.decorator';

describe('OAuth Decorators', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('Constants', () => {
    it('should export OAUTH_AUTH_KEY constant', () => {
      expect(OAUTH_AUTH_KEY).toBe('oauthAuth');
    });

    it('should export OAUTH_SCOPE_KEY constant', () => {
      expect(OAUTH_SCOPE_KEY).toBe('oauthScope');
    });
  });

  describe('OAuthAuth decorator', () => {
    it('should set OAuth auth metadata without scope', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth()
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
      expect(scopeMetadata).toBeUndefined();
    });

    it('should set OAuth auth metadata with scope', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth('read')
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

    it('should set OAuth auth metadata with custom scope', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth('custom:scope')
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
      expect(scopeMetadata).toBe('custom:scope');
    });

    it('should handle empty string scope', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth('')
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
      expect(scopeMetadata).toBeUndefined();
    });

    it('should handle null scope', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth(null as unknown as string)
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
      expect(scopeMetadata).toBeUndefined();
    });

    it('should handle undefined scope', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth(undefined)
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
      expect(scopeMetadata).toBeUndefined();
    });
  });

  describe('OAuthAuthRead decorator', () => {
    it('should set OAuth auth metadata with read scope', () => {
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

    it('should work on class level', () => {
      // Arrange
      @OAuthAuthRead()
      @Controller()
      class TestController {
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(OAUTH_AUTH_KEY, TestController);
      const scopeMetadata = reflector.get(OAUTH_SCOPE_KEY, TestController);

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('read');
    });
  });

  describe('OAuthAuthWrite decorator', () => {
    it('should set OAuth auth metadata with write scope', () => {
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

    it('should work on class level', () => {
      // Arrange
      @OAuthAuthWrite()
      @Controller()
      class TestController {
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(OAUTH_AUTH_KEY, TestController);
      const scopeMetadata = reflector.get(OAUTH_SCOPE_KEY, TestController);

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('write');
    });
  });

  describe('OAuthAuthAdmin decorator', () => {
    it('should set OAuth auth metadata with admin scope', () => {
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

    it('should work on class level', () => {
      // Arrange
      @OAuthAuthAdmin()
      @Controller()
      class TestController {
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(OAUTH_AUTH_KEY, TestController);
      const scopeMetadata = reflector.get(OAUTH_SCOPE_KEY, TestController);

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('admin');
    });
  });

  describe('OAuthAuthScopes decorator', () => {
    it('should set OAuth auth metadata with single scope', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes('read')
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

    it('should set OAuth auth metadata with multiple scopes', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes('read', 'write')
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
      expect(scopeMetadata).toBe('read write');
    });

    it('should set OAuth auth metadata with multiple complex scopes', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes('read', 'write', 'admin', 'custom:scope')
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
      expect(scopeMetadata).toBe('read write admin custom:scope');
    });

    it('should handle empty scopes array', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes()
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
      expect(scopeMetadata).toBe('');
    });

    it('should handle scopes with spaces', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes('read data', 'write data')
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
      expect(scopeMetadata).toBe('read data write data');
    });

    it('should work on class level', () => {
      // Arrange
      @OAuthAuthScopes('read', 'write', 'admin')
      @Controller()
      class TestController {
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.get(OAUTH_AUTH_KEY, TestController);
      const scopeMetadata = reflector.get(OAUTH_SCOPE_KEY, TestController);

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('read write admin');
    });
  });

  describe('decorator combination and inheritance', () => {
    it('should handle multiple decorators on same method', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuth('custom')
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
      // The first decorator should win
      expect(scopeMetadata).toBe('custom');
    });

    it('should handle class and method level decorators', () => {
      // Arrange
      @OAuthAuthRead()
      @Controller()
      class TestController {
        @OAuthAuthWrite()
        @Get()
        testMethod() {
          return 'test';
        }

        @Get()
        otherMethod() {
          return 'other';
        }
      }

      // Act
      const classAuthMetadata = reflector.get(OAUTH_AUTH_KEY, TestController);
      const classScopeMetadata = reflector.get(OAUTH_SCOPE_KEY, TestController);
      const methodAuthMetadata = reflector.get(
        OAUTH_AUTH_KEY,
        TestController.prototype.testMethod,
      );
      const methodScopeMetadata = reflector.get(
        OAUTH_SCOPE_KEY,
        TestController.prototype.testMethod,
      );
      const otherMethodAuthMetadata = reflector.get(
        OAUTH_AUTH_KEY,
        TestController.prototype.otherMethod,
      );
      const otherMethodScopeMetadata = reflector.get(
        OAUTH_SCOPE_KEY,
        TestController.prototype.otherMethod,
      );

      // Assert
      expect(classAuthMetadata).toBe(true);
      expect(classScopeMetadata).toBe('read');
      expect(methodAuthMetadata).toBe(true);
      expect(methodScopeMetadata).toBe('write');
      expect(otherMethodAuthMetadata).toBeUndefined();
      expect(otherMethodScopeMetadata).toBeUndefined();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle decorators on different method types', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthRead()
        @Get()
        getMethod() {
          return 'get';
        }

        @OAuthAuthWrite()
        @Get()
        postMethod() {
          return 'post';
        }

        @OAuthAuthAdmin()
        @Get()
        deleteMethod() {
          return 'delete';
        }
      }

      // Act & Assert
      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.getMethod),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.getMethod),
      ).toBe('read');

      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.postMethod),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.postMethod),
      ).toBe('write');

      expect(
        reflector.get(OAUTH_AUTH_KEY, TestController.prototype.deleteMethod),
      ).toBe(true);
      expect(
        reflector.get(OAUTH_SCOPE_KEY, TestController.prototype.deleteMethod),
      ).toBe('admin');
    });

    it('should handle special characters in scopes', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes('read:user', 'write:user', 'admin:*')
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
      expect(scopeMetadata).toBe('read:user write:user admin:*');
    });

    it('should handle numeric and boolean values in scopes', () => {
      // Arrange
      @Controller()
      class TestController {
        @OAuthAuthScopes('scope1', 'scope2', '123', 'true')
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
      expect(scopeMetadata).toBe('scope1 scope2 123 true');
    });
  });

  describe('backward compatibility', () => {
    it('should maintain consistent metadata keys', () => {
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
        'oauthAuth',
        TestController.prototype.testMethod,
      );
      const scopeMetadata = reflector.get(
        'oauthScope',
        TestController.prototype.testMethod,
      );

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('test');
    });

    it('should work with getAllAndOverride for metadata inheritance', () => {
      // Arrange
      @OAuthAuthRead()
      @Controller()
      class TestController {
        @OAuthAuthWrite()
        @Get()
        testMethod() {
          return 'test';
        }
      }

      // Act
      const authMetadata = reflector.getAllAndOverride(OAUTH_AUTH_KEY, [
        TestController.prototype.testMethod,
        TestController,
      ]);
      const scopeMetadata = reflector.getAllAndOverride(OAUTH_SCOPE_KEY, [
        TestController.prototype.testMethod,
        TestController,
      ]);

      // Assert
      expect(authMetadata).toBe(true);
      expect(scopeMetadata).toBe('write'); // Method level should override class level
    });
  });
});
