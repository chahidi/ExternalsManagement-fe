import { City } from './city';

export interface Country {
  id: string; 
  name: string;
  englishName: string;
  cities: City[]; 
}
