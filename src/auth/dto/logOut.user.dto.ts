import { IsNotEmpty, IsNumber } from "class-validator";

export class logOutDto{
    @IsNotEmpty()
    @IsNumber()
    userId : number
}