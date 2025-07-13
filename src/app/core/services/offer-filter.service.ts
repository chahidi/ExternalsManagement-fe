import { Injectable } from '@angular/core';
import { Offer } from '../models/offer';

@Injectable({
  providedIn: 'root'
})
export class OfferFilterService {
  constructor() {}

  searchOffers(offers: Offer[], query: string): Offer[] {
    if (!query.trim()) {
      return offers;
    }
    const lowerQuery = query.toLowerCase();
    return offers.filter(offer =>
      offer.titre.toLowerCase().includes(lowerQuery) ||
      offer.description.toLowerCase().includes(lowerQuery)
    );
  }

  filterByDepartments(offers: Offer[], departments: string[]): Offer[] {
    if (!departments || departments.length === 0) {
      return offers;
    }
    return offers.filter(o => departments.includes(o.department));
  }

  filterByTypes(offers: Offer[], types: string[]): Offer[] {
    if (!types || types.length === 0) {
      return offers;
    }
    return offers.filter(o => types.includes(o.type));
  }

  filterByStatus(offers: Offer[], status: string): Offer[] {
    if (!status) {
      return offers;
    }
    return offers.filter(o => o.status === status);
  }


  filterAll(
    offers: Offer[],
    departments: string[],
    types: string[],
    status: string
  ): Offer[] {
    return offers.filter(o =>
      (departments.length === 0 || departments.some(d => d.trim() === o.department.toLowerCase().trim())) &&
      (types.length === 0 || types.some(t => t.trim() === o.type.toLowerCase().trim())) &&
      (!status || o.status.toLowerCase().trim() === status.toLowerCase().trim())
    );
  }
  
}
