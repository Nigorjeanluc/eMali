import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const usersArray = [{ id: '1' }, { id: '2' }];
      mockUsersService.findAll.mockResolvedValue(usersArray);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(usersArray);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const user = { id: '1', name: 'Test User' };
      mockUsersService.findById.mockResolvedValue(user);

      const result = await controller.findOne('1');

      expect(service.findById).toHaveBeenCalledWith('1');
      expect(result).toBe(user);
    });
  });

  describe('remove', () => {
    it('should delete a user by id', async () => {
      const deletedUser = { id: '1', name: 'Deleted User' };
      mockUsersService.delete.mockResolvedValue(deletedUser);

      const result = await controller.remove('1');

      expect(service.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(deletedUser);
    });
  });
});
