import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty({ message: "FullName must be required" })
    @IsString()
    fullName: string;

    @IsNotEmpty({ message: "Email must be required" })
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: "Phone number must be required" })
    @IsString()
    phone: string

    @IsNotEmpty({ message: "Password must be required" })
    @IsString()
    @MinLength(6, { message: "Password must be al last 6 characters" })
    password: string;

}