import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { sendResponse } from 'src/utils/sendResponst';
import type { Response } from 'express';
import { loginUserDto } from './dto/login.user.dto';
import { logOutDto } from './dto/logOut.user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/signUp")
  async signUp(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const result = await this.authService.signUp(createUserDto);

    return sendResponse(res, {
      success: true,
      statusCode: 201,
      message: `Well done, ${result?.user?.fullName}! Your registration was successful.`,
      data: result
    })

  };


  @Post("/signIn")
  async signIn(@Body() logInUserDto: loginUserDto, @Res() res: Response) {
    const result = await this.authService.signIn(logInUserDto);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Wellcome back, ${result.user.fullName}! You have successfully signed in.`,
      data: result
    })

  };

  @UseGuards(AuthGuard("jwt"))
  @Post("/logOut")
  async logOut(@Body() logOutDto: logOutDto, @Res() res: Response) {
    await this.authService.logOut(logOutDto);
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "You’ve been logged out successfully."
    });
  };


  @Post("/refresh")
  async refresh() {
    this.authService.refresh();
  };

}
