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
  isDefined,
} from 'class-validator';

import { CreateIntegrityRecordDto } from '../services/create-integrity-record.dto';
import { UpdateIntegrityRecordDto } from '../services/update-integrity-record.dto';
import { v4 as uuidv4 } from 'uuid';

// battery status: 'original', 'repurposed', 'reused', 'remanufactured', 'waste'.
type BatteryStaus = "original" | "repurposed" | "reused" | "remanufactured" | "waste";

//battery category :  ‘LMT battery‘, ‘electric vehicle battery‘ or ‘industrial battery‘.
//The latter includes the subcategory ‘stationary battery energy storage system‘ 
//complemented by “other industrial batteries” (Art. 2).

type BatteryCategory = "LMT battery" | "electric vehicle battery" | IndustryBattery ;
type IndustryBattery = "stationary battery energy storage system" | "other industrial batteries";

export class BatteryPassportDto {

  metadata: {
    record_type: string;
    data_model: string;
    data_model_version?: string;
    manufacturer_identification_code: string;
    total_battery_carbon_footprint: string;
  };
  battery_information: {
    battery_identifier: string;
    manufacturer_identification: {
      manufacturer_name: string;
      manufacturer_contact: string;
      manufacturer_address: string;
      manufacturer_email: string;
      manufacturer_website: string;
      manufacturing_date: string;
      manufacturing_place: string;
      battery_category: BatteryCategory;
      battery_weight: string;
      battery_status: BatteryStaus;
    };
  };
  labels_and_certifications: {
    eu_declaration_of_conformity: string; // File path type: e.g., "/lib/data/EU declaration of conformity-en.pdf"
    id_declaration_of_conformity: string;
    results_test_reports: string;
    separate_collection_symbol: string;
    meaning_labels_and_symbols: string;
    cadmium_and_lead_symbols: string;
  };
  carbon_footprint: {
    total_battery_carbon_footprint: string;
    carbon_footprint_per_lifecycle_stage: {
      raw_material_acquisition_and_pre_processing: string;
      main_product_production: string;
      distribution: string;
      end_of_life_and_recycling: string;
    };
    performance_class: string;
    carbon_footprint_study_link: string;
  };
  battery_material_composition: {
    critical_raw_materials: string;
    battery_chemistry: string;
    materials_information: {
      cathode: {
        name: string;
        related_identifiers: string;
        weight: string;
      };
      anode: {
        name: string;
        related_identifiers: string;
        weight: string;
      };
      electrolyte: {
        name: string;
        related_identifiers: string;
        weight: string;
      };
    };
    hazardous_substances: {
      name: string;
      classes_and_categories: string;
      related_identifiers: string;
      location: string;
      concentration_range: string;
      impact: string;
    };
  };
  circularity_and_resource_efficiency: {
    spare_parts_information: {
      manual_for_removal_of_battery_from_appliance: string;
      manual_for_disassembly_and_dismantling_of_battery_pack: string;
      postal_address: string;
      email_address: string;
      web_address: string;
      part_numbers_for_components: string;
    };
    safety_information: {
      extinguishing_agent: string;
      safety_measures_and_instructions: string;
    };
    pre_consumer_recycled_material_shares: {
      nickel: string;
      cobalt: string;
      lithium: string;
      lead: string;
    };
    post_consumer_recycled_material_shares: {
      nickel: string;
      cobalt: string;
      lithium: string;
      lead: string;
    };
    renewable_content_share: string;
    end_user_roles: {
      waste_prevention: string;
      separate_collection: string;
    };
    info_separate_collection_and_recycling_operations: string;
  };
  performance_and_durability: {
    state_of_certified_energy: string;
    rated_capacity: string;
    remaining_capacity: string;
    capacity_fade: string;
    state_of_charge: string;
    nominal_voltage: string;
    minimum_voltage: string;
    maximum_voltage: string;
    original_power_capability: string;
    remaining_power_capability: string;
    power_capability_fade: string;
    max_permitted_battery_power: string;
    initial_round_trip_energy_efficiency: string;
    round_trip_energy_efficiency_at_50_percent_cycle_life: string;
    remaining_round_trip_energy_efficiency: string;
    round_trip_energy_efficiency_fade: string;
    initial_internal_resistance_on_battery_cell_level: string;
    initial_internal_resistance_on_battery_pack_level: string;
    expected_lifetime: string;
    number_of_charge_discharge_cycles: number;
    cycle_life_reference_test: string;
    c_rate_of_relevant_cycle_life_test: string;
    capacity_threshold_for_exhaustion: string;
    warranty_period_of_the_battery: string;
    date_of_putting_the_battery_into_service: string;
    temperature_range_idle_state: {
      lower_boundary: string;
      upper_boundary: string;
    };
    time_spent_in_extreme_temps: {
      above_boundary: string;
      below_boundary: string;
    };
    time_spent_charging_in_extreme_temps: {
      above_boundary: string;
      below_boundary: string;
    };
    information_on_accidents: string;
  };
  supply_chain_due_diligence: string;
  /**
   * Maps a BatteryPassport object to an IntegrityRecord object.
   *
   * @param {UpdateBatteryPassportDto} bpObject - The BatteryPassport object to be mapped.
   * @return {UpdateIntegrityRecordDto} The mapped IntegrityRecord object.
   */
  static mapBatteryPassportToIntegrityRecord(bpObject: BatteryPassportDto): UpdateIntegrityRecordDto {
    const mappedObject = new UpdateIntegrityRecordDto();
    mappedObject.integrityRecordId = bpObject.battery_information.battery_identifier

    const level1: Array<string> = [bpObject.metadata.record_type, bpObject.metadata.manufacturer_identification_code]
    mappedObject.level1Tags = level1
    
    const level2: Array<string> = [bpObject.metadata.manufacturer_identification_code]
    mappedObject.level2Tags = level2
    
    const level3: Array<string> = [bpObject.metadata.total_battery_carbon_footprint]
    mappedObject.level3Tags = level3
    
    mappedObject.meta = [bpObject];
    return mappedObject;
  }

   /**
   * Maps an integrity record object to a battery passport object.
   *
   * @param {UpdateIntegrityRecordDto} integrityRecordObject - The integrity record object to be mapped.
   * @return {UpdateBatteryPassportDto} The mapped battery passport object.
   */
   static mapIntegrityRecordToBatteryPassport(integrityRecordObject : UpdateIntegrityRecordDto) : BatteryPassportDto{

    const mappedObject = new BatteryPassportDto();

    return mappedObject;
  }
}

