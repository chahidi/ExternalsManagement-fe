import { Injectable } from '@angular/core';
import { Offer } from '../models/offer';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferFilterService {
  constructor() { }


  searchOffers(offers : Offer[] ,query : string) : Offer[] {
    if(!query.trim()){
      return offers
    }
    const lowerQuery = query.toLowerCase()
    return offers.filter(offer=>offer.titre.toLowerCase().includes(lowerQuery)
    ||
    offer.description.toLowerCase().includes(lowerQuery))
  }

  filterByDepartement(offers : Offer[] , department:string) : Offer[]{
    if(!department){
      return offers
    }
    return offers.filter(o=> o.department === department)
  }

  filterByType(offers : Offer[] , type : string ) : Offer[]{
    if(!type){
      return offers
    }
    return offers.filter(o => o.type === type)
  }
  filterByStatus(offers : Offer[] , status: string) : Offer[]{
    if(!status){
      return offers
    }
    return offers.filter(o => o.status === status)
  }

  filterBySalaryRange(offers: Offer[], range: [number, number]): Offer[] {
    if (!range || range.length !== 2) return offers;
    return offers.filter(o => o.salary >= range[0] && o.salary <= range[1]);
  }
  
}
