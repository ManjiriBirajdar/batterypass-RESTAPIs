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

import { UpdateIntegrityRecordDto } from '../services/update-integrity-record.dto';

export class UpdateBatteryPassportDto {

  @IsDefined()
  @IsNotEmpty()
  batteryPassId: string;

  @IsDefined()
  @IsNotEmpty()
  generalInformation: string[] = [];

  @IsDefined()
  @IsNotEmpty()
  labelsAndCertifications: string[] = [];

  @IsDefined()
  @IsNotEmpty()
  supplyChainDueDiligence: string[] = [];

  @IsDefined()
  @IsNotEmpty()
  carbonFootprintInformation: string[] = [];

  @IsDefined()
  @IsNotEmpty()
  materialsAndCompositions: string[] = [];

  @IsDefined()
  @IsNotEmpty()
  circularityAndResourceEfficiency: string[] = [];

  @IsDefined()
  @IsNotEmpty()
  performanceAndDurability: string[] = [];

}