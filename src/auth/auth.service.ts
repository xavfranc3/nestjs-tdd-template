import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import RegisterDto from './dto/register.dto';
import PostgresErrorCode from '../core/database/postgresErrorCode.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  public async register(registrationData: RegisterDto) {
    try {
      const createdUser = await this.userService.createUser(registrationData);
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(password, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
    }
  }

  private static verifyPassword(requestPassword, dbPassword) {
    const isMatching = bcrypt.compareSync(requestPassword, dbPassword);
    if (!isMatching)
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
  }
}
