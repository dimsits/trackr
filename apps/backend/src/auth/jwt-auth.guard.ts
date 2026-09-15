import { Inject, Injectable, Optional } from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

/**
 * Guard used by every authenticated controller via `@UseGuards(JwtAuthGuard)`.
 *
 * `AuthGuard('jwt')` declares its `AuthModuleOptions` constructor parameter as
 * `@Optional()`, which is what lets the guard be used in modules that do not
 * import `PassportModule`. NestJS 12 no longer lets a subclass inherit
 * `@Optional()` from the class it extends, so the marker has to be re-declared
 * here; without it Nest fails to resolve `JwtAuthGuard` at boot in all nine
 * modules that use it. See https://docs.nestjs.com/migration-guide
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Optional() @Inject(AuthModuleOptions) options?: AuthModuleOptions,
  ) {
    super(options);
  }
}
