import { DevAuthGuard } from './dev-auth.guard';

describe('DevAuthGuard', () => {
  it('should be defined', () => {
    expect(new DevAuthGuard()).toBeDefined();
  });
});
