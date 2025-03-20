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
} from 'class-validator'
import {} from '@nestjs/common'

export class batteryPassIdParam {
  @IsDefined()
  @IsNotEmpty()
  batteryPassId
}
