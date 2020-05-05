import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './strategies/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return await this.userService.create(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    let user: User;
    if (authCredentialsDto.username) {
      user = await this.userService.findOneByUsername(
        authCredentialsDto.username,
      );
    } else if (authCredentialsDto.email) {
      user = await this.userService.findOneByEmail(authCredentialsDto.email);
    }

    if (!user || !(await user.validatePassword(authCredentialsDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateJwtToken(user.username);
  }

  private generateJwtToken(username: string) {
    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);
    // this.logger.debug(
    //   `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    // );
    return { accessToken };
  }
}
