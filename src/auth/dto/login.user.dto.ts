import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class loginUserDto {

    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    @IsString()
    password: string
}