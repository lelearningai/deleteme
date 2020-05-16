import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from './strategies/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUpWithPassword(signUpDto: SignUpDto): Promise<User> {
    return await this.userService.createWithPassword(signUpDto);
  }

  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<any> {
    let user = await this.userService.findOneByUsername(
      authCredentialsDto.username,
    );
    if (!user) {
      user = await this.userService.findOneByEmail(authCredentialsDto.username);
    }

    if (!user || !(await user.validatePassword(authCredentialsDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async validateOAuthLogin({
    profile,
    accessToken,
    refreshToken,
    code,
  }: {
    profile: any;
    accessToken: string;
    refreshToken: string;
    code: string;
  }): Promise<User> {
    return await this.userService.findOrCreateOneByOAuth({
      profile,
      accessToken,
      refreshToken,
      code,
    });
  }

  public generateJwtToken(user: User) {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    // this.logger.debug(
    //   `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    // );
    return { accessToken };
  }
}
