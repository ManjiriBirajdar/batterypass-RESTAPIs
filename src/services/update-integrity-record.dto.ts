import {
    IsDefined,
    IsNotEmpty,
    IsAlphanumeric,
    Max,
    Min,
    IsInt,
    ValidateIf,
    IsArray,
    IsOptional,
  } from 'class-validator';
  
export class UpdateIntegrityRecordDto {
    @IsDefined()
    integrityRecordId: string;
    @IsOptional()
    @IsDefined()
    @IsArray()
    level1Tags: string[];
    @IsOptional()
    @IsDefined()
    @IsArray()
    level2Tags: string[];
    @IsOptional()
    @IsDefined()
    @IsArray()
    level3Tags: string[];
    @IsOptional()
    meta: any;
  }