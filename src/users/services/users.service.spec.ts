import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new UsersService(prismaMock);
  });

  describe('createUser', () => {
    it('calls prisma.user.create with correct data and returns user', async () => {
      const data: Prisma.UserCreateInput = {
        email: 'testuser@example.com',
        phone: '+250788123456',
        name: 'Test User',
        password: 'securePassword123',
        role: 'CLIENT',
        username: 'testuser',
        gender: 'male',
        dob: new Date('1990-01-01'),
        address: '123 Main St',
        country: 'Rwanda',
        province: 'Kigali',
        district: 'Gasabo',
        isVerified: false,
        isActive: true,
        language: 'EN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = { id: '1', ...data };
      prismaMock.user.create.mockResolvedValue(user);

      await expect(service.createUser(data)).resolves.toEqual(user);
      expect(prismaMock.user.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findByLoginIdentifier', () => {
    it('calls prisma.user.findFirst with correct OR query', async () => {
      const identifier = 'TestUser';
      const user = { id: '1', username: 'testuser' };
      prismaMock.user.findFirst.mockResolvedValue(user);

      const result = await service.findByLoginIdentifier(identifier);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: identifier.toLowerCase() },
            { phone: identifier },
            { username: identifier.toLowerCase() },
          ],
        },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findFirst', () => {
    it('calls prisma.user.findFirst with given args', async () => {
      const args = { where: { email: 'test@example.com' } };
      const user = { id: '1', email: args.where.email };
      prismaMock.user.findFirst.mockResolvedValue(user);

      await expect(service.findFirst(args)).resolves.toEqual(user);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith(args);
    });
  });

  describe('update', () => {
    it('calls prisma.user.update with given args', async () => {
      const args = { where: { id: '1' }, data: { name: 'New Name' } };
      const user = { id: '1', name: 'New Name' };
      prismaMock.user.update.mockResolvedValue(user);

      await expect(service.update(args)).resolves.toEqual(user);
      expect(prismaMock.user.update).toHaveBeenCalledWith(args);
    });
  });

  describe('findAll', () => {
    it('calls prisma.user.findMany and returns array', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      prismaMock.user.findMany.mockResolvedValue(users);

      await expect(service.findAll()).resolves.toEqual(users);
      expect(prismaMock.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('calls prisma.user.findUnique with given id', async () => {
      const id = '1';
      const user = { id };
      prismaMock.user.findUnique.mockResolvedValue(user);

      await expect(service.findById(id)).resolves.toEqual(user);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('delete', () => {
    it('calls prisma.user.delete with given id', async () => {
      const id = '1';
      const user = { id };
      prismaMock.user.delete.mockResolvedValue(user);

      await expect(service.delete(id)).resolves.toEqual(user);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
