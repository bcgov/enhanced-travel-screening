import { Entry } from './Entry';

export interface PhacEntry extends Entry {
  covid_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  arrival_date: string;
  end_of_isolation: string;
  destination_type: string;
  address_1: string;
  city: string;
  postal_code: string;
  province_territory: string;
  type?: string;
  home_phone?: string;
  mobile_phone?: string;
  other_phone?: string;
  email_address?: string;
  port_of_entry?: string;
  land_port_of_entry?: string;
  other_port_of_entry?: string;
  occupancy_status?: string;
  notes?: string;
  derivedTravellerKey?: string;
}
