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

export class CreateIntegrityRecordDto {
    @IsDefined()
    @IsNotEmpty()
    integrityRecordId: string;
  
    @IsDefined()
    @IsArray()
    level1Tags: string[];
    @IsDefined()
    @IsArray()
    level2Tags: string[];
    @IsDefined()
    @IsArray()
    level3Tags: string[];
    @IsDefined()
    meta: any;
  }