// import { DipWrapperService } from "./services/dip-wrapper-service";

// //call dip - DIP wrapper

//     const token = DipWrapperService.login();

//     //wait for answer from DIP 201 accepted
//       //fetch data every 5 secs
//         //get tx and send back to ascon


const DipWrapperService = require('./services/dip-wrapper-service');


const baseUrl = process.env.BATTERYPASSURL;
const dipservice = new DipWrapperService(baseUrl);


function createSampleBatteryPassportData () {

  const generalInformation = {
    serialNumber: 'ABC12345',
    capacity: '3000mAh',
    manufacturer: 'Example Batteries Inc.',
    voltage: '3.7V',
    chemistry: 'Lithium-ion',
    // Add manufacturing information and other general information as needed
  };
  
  const labelsAndCertifications = {
    certificationNumber: 'CERT123',
    compliance: 'RoHS',
    // Add more labels and certifications data as needed
  };
  
  const supplyChainDueDiligence = {
    supplierName: 'Supplier XYZ',
    dueDiligenceReport: 'Due diligence report content',
    // Add more supply chain due diligence data as needed
  };
  
  const carbonFootprintInformation = {
    emissions: '100 kg CO2e',
    reductionPlan: 'Carbon reduction plan',
    // Add more carbon footprint information as needed
  };
  
  const materialsAndCompositions = {
    mainMaterial: 'Lithium-ion',
    components: ['Cathode', 'Anode', 'Electrolyte'],
    // Add more materials and compositions data as needed
  };
  
  const circularityAndResourceEfficiency = {
    recyclingProgram: 'Recycling program details',
    circularityScore: 'A',
    // Add more circularity and resource efficiency data as needed
  };
  
  const performanceAndDurability = {
    performanceMetrics: 'Performance metrics',
    durabilityTests: 'Durability test results',
    // Add more performance and durability data as needed
  };

  return {
    generalInformation,
    labelsAndCertifications,
    supplyChainDueDiligence,
    carbonFootprintInformation,
    materialsAndCompositions,
    circularityAndResourceEfficiency,
    performanceAndDurability,
  };
}

// Define the URL and headers
const apiUrl = 'https://battery-pass.dev.arxum.app/suite/api/v1/integrity-records';
const token = ''; // Replace with your access token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'multipart/form-data',
};

// Make the API request
// axios.post(apiUrl, data, { headers })
//   .then((response) => {
//     if (response.status === 200) {
//       console.log('Successfully created the battery passport:', response.data);
//     } else {
//       console.error('Failed to create the battery passport:', response.data);
//     }
//   })
//   .catch((error) => {
//     console.error('Error:', error.message);
//   });

(async () => {
    /**
    *  Test Login function
    */
    const username = process.env.EMAIL;
    const password = process.env.PASSWORD;

    dipservice.login(username, password)
    .then((token) => {
    console.log(`Logged in successfully. \n Token: ${token} \n\n`);


    const sampleData = createSampleBatteryPassportData();

    //create integrity record DTO
    // BatteryPAss DTO


    dipservice.createBatteryPassport('B1', 
      sampleData.generalInformation,
      sampleData.labelsAndCertifications,
      sampleData.supplyChainDueDiligence,
      sampleData.carbonFootprintInformation,
      sampleData.materialsAndCompositions,
      sampleData.circularityAndResourceEfficiency,
      sampleData.performanceAndDurability   
    )
    .then((passportId) => {
      console.log(`Battery passport created successfully. Passport ID: ${passportId}`);
    })
    .catch((error) => {
      console.error(`Battery passport creation error: ${error.message}`);
    });

    })
    .catch((error) => {
      console.error(`Login error: ${error.message}`);
    });
  
})();