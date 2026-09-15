import { IsEmail, MinLength, IsNotEmpty} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsNotEmpty()
    name: string;
}