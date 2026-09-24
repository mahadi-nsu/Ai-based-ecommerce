import { IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator";

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must be lowercase kebab-case"
  })
  slug!: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true
  })
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logoPublicId?: string;
}
