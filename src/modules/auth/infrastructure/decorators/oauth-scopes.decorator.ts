import { SetMetadata, applyDecorators } from '@nestjs/common';

export const OAUTH_AUTH_KEY = 'oauthAuth';
export const OAUTH_SCOPE_KEY = 'oauthScope';

// Base OAuth decorator
export const OAuthAuth = (scope?: string) => {
  const decorators = [SetMetadata(OAUTH_AUTH_KEY, true)];

  if (scope) {
    decorators.push(SetMetadata(OAUTH_SCOPE_KEY, scope));
  }

  return applyDecorators(...decorators);
};

// Specific scope decorators
export const OAuthAuthRead = () => {
  return applyDecorators(
    SetMetadata(OAUTH_AUTH_KEY, true),
    SetMetadata(OAUTH_SCOPE_KEY, 'read'),
  );
};

export const OAuthAuthWrite = () => {
  return applyDecorators(
    SetMetadata(OAUTH_AUTH_KEY, true),
    SetMetadata(OAUTH_SCOPE_KEY, 'write'),
  );
};

export const OAuthAuthAdmin = () => {
  return applyDecorators(
    SetMetadata(OAUTH_AUTH_KEY, true),
    SetMetadata(OAUTH_SCOPE_KEY, 'admin'),
  );
};

// Multiple scopes decorator
export const OAuthAuthScopes = (...scopes: string[]) => {
  return applyDecorators(
    SetMetadata(OAUTH_AUTH_KEY, true),
    SetMetadata(OAUTH_SCOPE_KEY, scopes.join(' ')),
  );
};
