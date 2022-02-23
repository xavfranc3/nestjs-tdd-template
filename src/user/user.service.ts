import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserEntity from './user.entity';
import CreateUserDto from './dto/createUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    if (user) return user;
    throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
  }

  async createUser(userData: CreateUserDto) {
    const newUser = await this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    return newUser;
  }
}
