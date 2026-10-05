/**
 * Common hostile inputs. A safe app rejects or neutralises them with a
 * 4xx / validation message — never a 5xx, stack trace or executed script.
 * Only run these against environments you own or are authorised to test.
 */
export const sqlInjection = ["' OR '1'='1", "' OR 1=1 --", "admin'--", '1; DROP TABLE users'] as const;

export const xss = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "javascript:alert('xss')",
  '<svg/onload=alert(1)>',
] as const;

export const edgeStrings = {
  empty: '',
  whitespace: '   ',
  unicode: 'Ünïcødé 测试 🚀',
  long: 'a'.repeat(5_000),
} as const;

/** Security headers every HTTPS response should carry. Tune per project. */
export const requiredSecurityHeaders = [
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
] as const;

/** Headers that leak stack details and should be absent. */
export const forbiddenHeaders = ['x-powered-by', 'x-aspnet-version'] as const;
