import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { tokens } from './types/token.types';
import * as argon from 'argon2';
import { loginUserDto } from './dto/login.user.dto';
import { logOutDto } from './dto/logOut.user.dto';



@Injectable()
export class AuthService {
    constructor(private Prisma: PrismaService, private JwtService: JwtService) { }

    async hashData(data) {
        return await bcrypt.hash(data, 10);
    }

    async getToken(userId: number, email: string, role: string): Promise<tokens> {

        const [at, rt] = await Promise.all([
            // At => Access Token
            this.JwtService.signAsync({
                sub: userId,
                email,
                role
            }, {
                secret: "at-secret",
                expiresIn: 60 * 15
            }),
            // Rt => Refresh Token
            this.JwtService.signAsync({
                sub: userId,
                email,
                role
            }, {
                secret: "rt-secret",
                expiresIn: 60 * 60 * 24 * 7
            })
        ]);

        return {
            ACCESS_TOKEN: at,
            REFRESH_TOKEN: rt
        }
    };

    async updateRtHash(userId: number, rt: string) {
        const hash = await this.hashData(rt);
        const result = await this.Prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRt: hash
            },
        });

        return result
    }

    async signUp(createUserDto: CreateUserDto) {

        const existUser = await this.Prisma.user.findUnique({
            where: {
                email: createUserDto.email
            }
        });

        if (existUser) {
            throw new ConflictException({
                success: false,
                message: "User already exist",
                error: "Eamil already used"
            })
        };

        const hastPassword = await bcrypt.hash(createUserDto.password, 10)

        const result = await this.Prisma.user.create({
            data: {
                email: createUserDto.email,
                fullName: createUserDto.fullName,
                password: hastPassword,
                phone: createUserDto.phone
            }
        });



        const tokens = await this.getToken(result.id, result.email, result.role);

        const updateUser = await this.updateRtHash(result.id, tokens.REFRESH_TOKEN);
        const { password, ...rest } = updateUser;
        const data = {
            tokens,
            user: rest
        }

        return data;
    };

    async signIn(logInUserDto: loginUserDto) {
        const findUser = await this.Prisma.user.findUnique({
            where: {
                email: logInUserDto.email
            }
        });

        if (!findUser) throw new ForbiddenException("Access Denied");

        const isMatchPassword = await bcrypt.compare(logInUserDto.password, findUser.password);

        if (!isMatchPassword) throw new ForbiddenException("Invalid Password");

        const tokens = await this.getToken(findUser.id, findUser.email, findUser.role);


        const updateUser = await this.updateRtHash(findUser.id, tokens.REFRESH_TOKEN);

        const { password, ...rest } = updateUser;
        const data = {
            tokens,
            user: rest
        }

        return data;

    };

    async logOut(logOutDto: logOutDto) {

        const user = await this.Prisma.user.findUnique({
            where: {
                id: logOutDto.userId
            }
        });

        if (!user || !user.hashedRt) {
            throw new ConflictException({
                success: true,
                message: "You have already logged out"
            })
        }

        const result = await this.Prisma.user.update({
            where: {
                id: logOutDto.userId,
                hashedRt: {
                    not: null
                }
            },
            data: {
                hashedRt: null
            }
        });

        return result

    };

    async refresh() {

    };

}
