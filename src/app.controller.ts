import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ValidationPipe
} from '@nestjs/common';
import { AppService } from './services/app.service';
import { FileValidator } from "@nestjs/common";
import { Readable } from 'stream';
import { createReadStream } from 'fs';
import { ParseFormDataJsonPipe } from './services/pipes/pipe-from-data-json-file'
import { join } from 'path';
import { DataIntegrityServiceClient } from './services/dip.service.wrapper';
import { BatteryPassportDto } from './dto/battery-passport.dto'
import { json, query } from 'express';
import { FormDataRequest } from 'nestjs-form-data';
import { FileInterceptor } from '@nestjs/platform-express'
import axios from 'axios';
import { stringify } from 'querystring';
import { UpdateBatteryPassportDto } from './dto/update-battery-passport.dto';
import { batteryPassIdParam } from './dto/index.dto';

const currentUser = {
  id: 1234,
  roles: ["ContactEditor"],
  isAuthenticated(): boolean {
      return true
  },
  isInRole(role: string): boolean {
      return this.roles.contains(role);
  }
}

@Controller()
export class AppController {
 
  //todo add a token service that provides the needed token

  constructor(private readonly appService: AppService,
    private readonly dipServiceClient: DataIntegrityServiceClient) {
  }

  /**
 * Creates a battery passport with the given data.
 *
 * @param {CreateBatteryPassportDto} createbatterypassportdto - The data for creating the battery passport.
 * @returns {string} The success message with the created battery ID.
 */


  @Post('api/createbatterypass')
  @authorize
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10485760, files: 1 } }),
  )
  async createBatteryPassport(@Body() createbatterypassportdto: BatteryPassportDto) {

    const file = createReadStream(join(process.cwd(), 'batpass.txt'));
    const mappedToIntegrityRecordValue = BatteryPassportDto.mapBatteryPassportToIntegrityRecord((createbatterypassportdto));

    try {
      const token = await this.getBearerToken();
      if (!token) {
        return 'error on logging to dip';
      }
      const response = await this.dipServiceClient.create(mappedToIntegrityRecordValue, file, token);
      
      if(response.status == "Accepted"){
        return (
          'Battery Passport created successfully with Battery ID :  ' +
          mappedToIntegrityRecordValue.integrityRecordId
        );
      }     
    }
    catch (error) {
      return { "statusCode": 400, "message": "Battery Passport already exist!" }
    }
  }

   /**
   * Retrieves the battery passport for a given battery pass ID.
   *
   * @param {string} batteryPassId - The ID of the battery pass.
   * @return {Promise<string>} A promise that resolves to the battery passport details.
   */

  @Get('api/getbatterypass/:batteryPassId')
  async getBatteryPassport(@Param('batteryPassId') batteryPassId: string): Promise<string> {

    // get an access token
    try {
      const token = await this.getBearerToken();
      if (!token) {
        return 'error on logging to dip';
      }

      const response = await this.dipServiceClient.find(batteryPassId, token);
     // console.log('Battery Passport details :  \n' + response);
      return (
        response
      );
    }
    catch (error) {
      throw error;
    }
  }

  @Get('api/getallbatterypasss')
  async getAllBatteryPassports(
  ): Promise<any[]> {

    // get an access token
    const token = await this.getBearerToken();
    
    try {
      const items = await this.dipServiceClient.findByLevel1Tag(token)
      // console.log("count = ", items.length)
      return items
    }

    catch (error) {
      throw error;
    }
  }

  /**
   * Updates the battery passport with the provided data and file.
   *
   * @param {batteryPassIdParam} params - The parameter for the battery passport ID.
   * @param {UpdateBatteryPassportDto} updateBatteryPassportDto - The data to update the battery passport.
   * @param file - The file to upload.
   * @return {Promise<{ status: string }>} - A promise that resolves to an object with the status of the update.
   */

  @Patch('api/updatebatterypass/:batteryPassId')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10485760, files: 1 } }),
  )
  public async updateBatteryPassport(
    @Param(new ValidationPipe()) params: batteryPassIdParam,
    @Body(
      'updateBatteryPassportDto',
      new ParseFormDataJsonPipe({ except: ['file'] }),
      new ValidationPipe(),
    )
    updateBatteryPassportDto: UpdateBatteryPassportDto,
    @UploadedFile() file)
    : Promise<{ status: string }> {
    try {
      if (file != null) {
        //size validation
        if (file.size > 10485760) {
          throw new BadRequestException('File too large')
        }
        if (file.size == 0) {
          throw new BadRequestException('File size is zero')
        }
      }
      else{
        return { status: 'Please updaload at least one file!' }
      }

      // get an access token
      const token = await this.getBearerToken();
      if (!token) {
        return { status: 'Rejected due to authorization problem!' }
      }
      // map battery passport values to integrity record    
      const mappedToIntegrityRecordValue = BatteryPassportDto.mapBatteryPassportToIntegrityRecord(JSON.parse(JSON.stringify(updateBatteryPassportDto)));
      //console.log("mappedToIntegrityRecordValue = \n", mappedToIntegrityRecordValue);

      //uploading file to the IPFS
      const fileStream = Readable.from(file.buffer)      

      //update in blockchain
      const response = await this.dipServiceClient.update(mappedToIntegrityRecordValue, fileStream, token);
      //console.log('Battery Passport details :  \n' + response);
      return (
        response
      );
    }
    catch (error) {
      throw error;
    }
  }

   /**
   * Retrieves the history of a battery passport.
   *
   * @param {string} batteryPassId - The ID of the battery passport.
   * @return {Promise<string>} - A promise that resolves to the history of the battery passport.
   */

  @Get('api/gethistoryofbatterypass/:batteryPassId')
  async getHistoryOfBatteryPassport(@Param('batteryPassId') batteryPassId: string): Promise<string> {

    // get an access token
    try {
      const token = await this.getBearerToken();
      if (!token) {
        return 'error on logging to dip';
      }

      //get history of the battery passport
      const response = await this.dipServiceClient.getHistory(batteryPassId, token);

      console.log('\nBattery Passport details :');
      console.log("Battery ID = ", response[0].integrityRecordId);

      //Display eventType, eventId, proofs
      for (var batteryPass of response) {
          console.log("Event = ", batteryPass.eventType);
          console.log("Event Id = ", batteryPass.eventId);
          console.log("Proof = ", batteryPass.proofs[0]);
      }

      //map IntegrityRecord To Battery Passport
      const mappedBatteryPassportObj = BatteryPassportDto.mapIntegrityRecordToBatteryPassport(response);
      
      return (
        response
      );
    }
    catch (error) {
      throw error;
    }
  }

    /**
   * Retrieves the first create event record for a given battery pass ID.
   *
   * @param {string} batteryPassId - The ID of the battery pass.
   * @return {Promise<string>} - The integrity record of the first create event.
   */
  @Get('api/getfirstcreateeventrecord/:batteryPassId')
  async getFirstCreateEventRecord(@Param('batteryPassId') batteryPassId: string): Promise<string> {

    let firstEventRecord : any; 

    // get an access token
    try {
      const token = await this.getBearerToken();
      if (!token) {
        return 'error on logging to dip';
      }

      const response = await this.dipServiceClient.getHistory(batteryPassId, token);

      //first event : create
      if(response[0].eventType == "create"){
        console.log("Create event record returned successfully!");
        // console.log('\nFirst Create Event Record for :');
        // console.log("Battery Id = ", response[0].integrityRecordId);
        // console.log("Event = ", response[0].eventType);
        // console.log("Event Id = ", response[0].eventId);
        // console.log("Proof = ", response[0].proofs[0]);
        // console.log("Battery Passport Data = ", response[0].integrityRecord);

        //Return battery passport data
        return(response[0].integrityRecord);
      }
      else{
        return "First create event doesnot exist!! ";
      }
    }
    catch (error) {
      throw error;
    }
  }

    /**
   * Retrieves the last update event record for a given battery pass ID.
   *
   * @param {string} batteryPassId - The ID of the battery pass.
   * @return {Promise<string>} The integrity record of the last update event.
   */
  @Get('api/getlastupdateeventrecord/:batteryPassId')
  async getLastUpdateEventRecord(@Param('batteryPassId') batteryPassId: string): Promise<string> {

    let updateRecordArray = [];

    // get an access token
    try {
      const token = await this.getBearerToken();
      if (!token) {
        return 'error on logging to dip';
      }

      const response = await this.dipServiceClient.getHistory(batteryPassId, token);
      
      //for loop because of multiple update events, we need last update event
      for (var batteryPass of response) {
         //last event : update
        if(batteryPass.eventType == "update"){
          updateRecordArray.push(batteryPass);         
        } 
    }   

    console.log("Last update event record returned successfully!");
    // console.log('\Last Update Event Record for :');
    // console.log("Battery Id = ", updateRecordArray[updateRecordArray.length-1].integrityRecordId);
    // console.log("Event = ", updateRecordArray[updateRecordArray.length-1].eventType);
    // console.log("Event Id = ", updateRecordArray[updateRecordArray.length-1].eventId);
    // console.log("Proof = ", updateRecordArray[updateRecordArray.length-1].proofs[0]);
    // console.log("Battery Passport Data = ", updateRecordArray[updateRecordArray.length-1].integrityRecord);
    // console.log("\n") 
      
    //Return last updated battery passport data
    return( updateRecordArray[updateRecordArray.length-1].integrityRecord);
    }
    catch (error) {
      throw error;
    }
  }

  // /**
  //  * Retrieves the battery passport diff for a given `batteryPassId`.
  //  *
  //  * @param {string} batteryPassId - The ID of the battery passport.
  //  * @return {Promise<string>} A Promise that resolves to a string representing the battery passport diff.
  //  */
  // @Get('api/getdiffofbatterypass/events/:batteryPassId')
  // async getDiffBatteryPassport(@Param('batteryPassId') batteryPassId: string): Promise<string> {

  //   // get an access token
  //   try {
  //     const token = await this.getBearerToken();
  //     if (!token) {
  //       return 'error on logging to dip';
  //     }

  //     const response = await this.dipServiceClient.getHistory(batteryPassId, token);

  //     console.log('\nBattery Passport details :  ');
  //     console.log("Battery ID = ", response[0].integrityRecordId,"\n");

  //     // let firstEventRecord : any;
  //     // let lastUpdateEventRecord : any;      

  //     // //first event : create
  //     // if(response[0].eventType == "create"){
  //     //   const feventRecord = JSON.stringify(response[0]);
  //     //   firstEventRecord = feventRecord;
  //     // }

  //     // //last event : update
  //     // if(response[response.length-1].eventType == "update"){
  //     //   const leventRecord = JSON.stringify(response[response.length-1]);
  //     //   lastUpdateEventRecord = leventRecord;
  //     // } 

  //     //Display eventType, eventId, proofs
  //     for (var batteryPass of response) {
  //         console.log("Event = ", batteryPass.eventType);
  //         console.log("Event Id = ", batteryPass.eventId);
  //         console.log("Proof = ", batteryPass.proofs[0]);

  //         // console.log("Show what has been recently updated : ")
  //         // const eventRecord = JSON.stringify(batteryPass);
  //         // console.log('Each Event Record :  \n' +eventRecord);
  //         // console.log("\n")
  //     }

  //     // Compare : WHAT HAS BEEN UPDATED?
  //     //console.log(diffString(firstEventRecord, lastUpdateEventRecord, { full: true }));
  //     //console.log(diff(firstEventRecord, lastUpdateEventRecord));

  //     return (
  //       response
  //     );
  //   }
  //   catch (error) {
  //     throw error;
  //   }
  // }


  /**
   * Delete Product Passport
   * DELETE /product/passport/{id}
   * */

  /**
   * Search Product Passport : findByTags
   * GET /product/passport/search
   * */
  

  /**
   * Get Product Passport Status
   * GET /product/passport/{id}/status
   * */

  /**
   * Verify Product Passport
   * GET /product/passport/{id}/verify
   * */


  /**
   * Get Product Passport Manufacturer Information
   * GET /product/passport/{id}/manufacturer
   * */

  /**
   * Get Product Passport Product’s Information
   * GET /product/passport/{id}/product
   * */

  /**
   * Get Product Passport IPFS Data
   * GET /product/passport/{id}/ipfs
   * */

  @Get('api/getipfsdata/:batteryPassId')
  async getIPFSData(
    @Param('batteryPassId') batteryPassId: string, @Res() res: Response): Promise<any> {

    // get an access token
    try {
      const token = await this.getBearerToken();
      if (!token) {
        console.log('error on logging to dip');
      }

      //get event id for create

      let createEventId : string;
      const batteryPassport = await this.dipServiceClient.getHistory(batteryPassId, token);

      //first event : create
      if(batteryPassport[0].eventType == "create"){
        createEventId = batteryPassport[0].eventId;
       // console.log("event id : ", batteryPassport[0].eventId);
      }
      else{
        console.log("Error in file retrival from ipfs!")
      }

      //get file from ipfs for create event
      const fileStream = await this.dipServiceClient.getIpfsFile(batteryPassId, createEventId, token);
      fileStream.pipe(res);
    }
    catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the bearer token for authentication.
   *
   * @return {Promise<string>} The bearer token.
   */
  private async getBearerToken() {
    try {
      const data = JSON.stringify({
        email: process.env.INTEGRITY_RECORD_SERVICE_USER_NAME,
        password: process.env.INTEGRITY_RECORD_SERVICE_PASSWORD,
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://dip.dev.arxum.app/suite/api/login',
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      const loginResponse = await axios.request(config);
      return loginResponse.data.token;
    } catch (error) {
      console.log(
        `error while logging into dip error.message : ${JSON.stringify(
          error.message,
          null,
          2,
        )}`,
      );
      return undefined;
    }
  }
}

/**
 * Authorizes the user to perform a specific action.
 *
 * @param {AppController} target - The target controller
 * @param {string} propertyKey - The key of the property
 * @param {TypedPropertyDescriptor} descriptor - The property descriptor
 * @return {void | TypedPropertyDescriptor} The wrapped property descriptor or void
 */
function authorize(target: AppController, propertyKey: 'createBatteryPassport', descriptor: TypedPropertyDescriptor<(createbatterypassportdto: BatteryPassportDto) => Promise<string | { statusCode: number; message: string; }>>): void | TypedPropertyDescriptor<(createbatterypassportdto: BatteryPassportDto) => Promise<string | { statusCode: number; message: string; }>> {
  const wrapped = descriptor.value
  descriptor.value = function() {

    if(!currentUser.isAuthenticated()){
      throw Error("User is not authorized!");
    }
    return wrapped.apply(this, arguments);
  }
}

