import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService({} as never);
  });

  it('returns invalid for short usernames', async () => {
    await expect(service.validUserName('ab')).resolves.toEqual({ valid: false });
  });

  it('returns valid when username is not taken', async () => {
    jest.spyOn(service, 'findByUsername').mockResolvedValueOnce(null);

    await expect(service.validUserName('new_username')).resolves.toEqual({ valid: true });
  });

  it('returns invalid when username is already taken', async () => {
    jest.spyOn(service, 'findByUsername').mockResolvedValueOnce({ id: '1' } as User);

    await expect(service.validUserName('taken_username')).resolves.toEqual({ valid: false });
  });
});
