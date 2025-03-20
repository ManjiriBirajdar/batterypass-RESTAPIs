import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { ResponseType, Method } from 'axios';
import * as FormData from 'form-data';
import { Readable } from 'stream';
import { CreateIntegrityRecordDto } from './create-integrity-record.dto';
import { UpdateIntegrityRecordDto } from './update-integrity-record.dto';

@Injectable()
export class DataIntegrityServiceClient {
  _integrityRecordServiceUri: any;
  _tenant: string;

  constructor(configService: ConfigService) {
    const tenantAtUri = configService
      .getOrThrow<string>('INTEGRITY_RECORD_SERVICE_TENANT_AT_URI')
      ?.split('@');
    if (tenantAtUri.length != 2) {
      throw Error(
        'expecting IntegrityRecordServiceTenantAtUri to have a uri and a tenant in the form of tenant@https://dip.dev.arxum.app/suite/api/v2/',
      );
    }
    this._tenant = tenantAtUri[0];
    this._integrityRecordServiceUri = tenantAtUri[1];
  }

  public async healthCheck() {
    throw new NotImplementedException();
  }

  public async create(integrityRecord: CreateIntegrityRecordDto,fileStream: Readable, currentUserSessionToken: string) {
    try {
      const formData = new FormData();
      formData.append('integrityRecord', JSON.stringify(integrityRecord));
      formData.append('file', fileStream);

      const result = await HTTPRequester.post(
        `${this._integrityRecordServiceUri}/integrity-records`,
        formData,
        {
          ...formData.getHeaders(),
          Authorization: `Bearer ${currentUserSessionToken}`,
        },
      );
      return result;
    } catch (error) {
      throw Error(`error while creating an integrityRecord-> ${error.message}`);
    }
  }

  public async find(id: string, currentUserSessionToken: string): Promise<any> {
    try {
      return await HTTPRequester.get(
        `${this._integrityRecordServiceUri}/integrity-records/${id}`,
        { Authorization: `Bearer ${currentUserSessionToken}` },
      );
    } catch (error) {
      if (error.message.includes(404)) {
        return 'notfound';
      } else throw error;
    }
  }

  async findByLevel1Tag(currentUserSessionToken: string): Promise<any[]> {
    const tag1= "batterypassport"
    const tag2 = "DEEVTECH6428WOL"

    try {
      return await HTTPRequester.get(
        `${this._integrityRecordServiceUri}/integrity-records?skip=0&limit=99&level1Tags=${tag1}&level1Tags=${tag2}`,
        { Authorization: `Bearer ${currentUserSessionToken}` },
      );
    } catch (error) {
      if (error.message.includes(404)) {
        throw new Error(
          'dip connection error: getting items by level1tag from ->' +
          error.response.data.message,
        )
      } else throw error;
    }
  }

  public async getHistory(integrityRecordId: string, currentUserSessionToken: string) {
    try {
      return await HTTPRequester.get(
        `${this._integrityRecordServiceUri}/integrity-records/${integrityRecordId}/events`,
        { Authorization: `Bearer ${currentUserSessionToken}` },
      );
    } catch (error) {
      throw error;
    }
  }

  public async update(integrityRecord: UpdateIntegrityRecordDto, fileStream: Readable, currentUserSessionToken: string) {
    try {
      const formData = new FormData();
      formData.append('integrityRecord', JSON.stringify(integrityRecord));
      formData.append('file', fileStream);

      const result = await HTTPRequester.patch(
        `${this._integrityRecordServiceUri}/integrity-records/${integrityRecord.integrityRecordId}`,
        formData,
        {
          ...formData.getHeaders(),
          Authorization: `Bearer ${currentUserSessionToken}`,
        },
      );
      return result;
    } catch (error) {
      throw Error(`error while creating an integrityRecord-> ${error.message}`);
    }
  }

  public async delete(id: string, currentUserSessionToken: string) {
    try {
      const result = await HTTPRequester.delete(
        `${this._integrityRecordServiceUri}/integrity-records/${id}`,
        { Authorization: `Bearer ${currentUserSessionToken}` },
      );
      return result;
    } catch (error) {
      throw Error(`error while creating an integrityRecord-> ${error.message}`);
    }
  }


  public async getIpfsFile(id: string, createEventId: string, currentUserSessionToken: string): Promise<Readable> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this._integrityRecordServiceUri}/integrity-records/${id}/events/${createEventId}/ipfs-file`,
      headers: {
        Authorization: 'Bearer ' + currentUserSessionToken,
      },
      responseType: 'stream' as ResponseType,
    }

    try {
      const axiosResponse = await axios.request(config);
      return axiosResponse.data;
    } catch (error) {
      throw new Error(
        'error in getting ipfs item in dip: ' + error.response.data.message,
      );
    }
  }
}

const executeRequest = async function (type: string, url: string, data: any, headers: any = {}) {
  console.log(`🚀🚀🚀 dip.service.ts:153->runnign requst ${type} ` + url);
  try {
    const result = await axios({
      method: type as Method,
      headers,
      url,
      data,
    });
    return result.data;
  } catch (error) {
    const err = new Error();

    err.message = error.message;
    if (error.response && error.response.data) {
      err.message = JSON.stringify(error.response.data);
    }

    throw err;
  }
};


export class HTTPRequester {
  public static async get(url: string, headers: any = {}) {
    return executeRequest('GET', url, {}, headers);
  }

  public static async getWithBody(url: string, data: any, headers: any = {}) {
    return executeRequest('GET', url, data, headers);
  }

  /**
   * sends a head request to the url
   * @param url
   * @returns
   */
  public static async head(url: string) {
    return axios.head(url);
  }

  public static async getStream(url: string, headers: any = {}): Promise<any> {
    const result = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers,
    });

    return result.data;
  }

  public static async postAndGetStream(url: string, data: any, headers: any = {}): Promise<any> {
    const result = await axios({
      url,
      method: 'POST',
      responseType: 'stream',
      headers,
      data,
    });
    return result.data;
  }

  public static async post(url: string, data: any, headers: any = {}) {
    return executeRequest('POST', url, data, headers);
  }
  public static async patch(url: string, data: any, headers: any = {}) {
    return executeRequest('PATCH', url, data, headers);
  }
  static delete(url: string, headers: any = {}) {
    return executeRequest('DELETE', url, {}, headers);
  }
}
