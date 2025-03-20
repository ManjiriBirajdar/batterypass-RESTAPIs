import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common'
import * as _ from 'lodash'
// import { getLoggerFor } from '../logger/logger'

type TParseFormDataJsonOptions = {
  except?: string[]
}

export class ParseFormDataJsonPipe implements PipeTransform {
  // logger: any
  constructor(private options?: TParseFormDataJsonOptions) {
    // this.logger = getLoggerFor(this.constructor.name)
  }

  transform(value: any, _metadata: ArgumentMetadata) {
    const { except } = this.options
    const serializedValue = value
    const originProperties = {}
    if (except?.length) {
      _.merge(originProperties, _.pick(serializedValue, ...except))
    }
    try {
      const deserializedValue = JSON.parse(value)
      return { ...deserializedValue, ...originProperties }
    } catch (error) {
      // this.logger.debug(
      //   `pipe-from-data-json-file.ts:32-> : ${JSON.stringify(
      //     _metadata,
      //     null,
      //     2,
      //   )}`,
      // )
      throw new BadRequestException('input is not a valid json')
    }
  }
}
