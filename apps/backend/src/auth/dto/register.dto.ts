import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "user@trackr.dev" })
  @IsEmail()
  email!:string

  @ApiProperty({ example: "password123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!:string

  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
