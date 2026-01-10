import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceAccessService } from './workspace-access.service';

describe('WorkspaceAccessService', () => {
  let service: WorkspaceAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceAccessService],
    }).compile();

    service = module.get<WorkspaceAccessService>(WorkspaceAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
