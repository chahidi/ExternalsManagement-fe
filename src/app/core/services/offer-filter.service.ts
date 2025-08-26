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
      offer.title.toLowerCase().includes(lowerQuery) ||
      offer.description.toLowerCase().includes(lowerQuery)
    );
  }
}
