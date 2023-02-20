import { Test, TestingModule } from '@nestjs/testing';
import { NetServerService } from './net-server.service';

describe('NetServerService', () => {
  let service: NetServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NetServerService],
    }).compile();

    service = module.get<NetServerService>(NetServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
