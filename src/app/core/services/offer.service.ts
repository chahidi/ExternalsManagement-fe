import { Injectable } from '@angular/core';
import { Offer } from '../models/offer';
import { faker } from '@faker-js/faker';
import { Observable ,of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private offers: Offer[] = [];

  constructor() {
    this.generateMockOffers();
  }

  private generateMockOffers() {
    for (let i = 0; i < 20; i++) {
      const date = faker.date.recent({ days: 30 });
      const  departmentOptions = [
        { label: 'Data Analyst', value: 'Data Analyst' },
        { label: 'Front End', value: 'Front End' },
        { label: 'Back End', value: 'Back End' },
        { label: 'Full-stuck ', value: 'Full-Stuck' },
        { label: 'Tester', value: 'Tester' },
        { label: 'Java developer', value: 'Java developer' },
        { label: 'Angular Developer', value: 'Angular developer' },
        { label: 'Devops', value: 'Devops' },
        { label: 'networking systhem', value: 'networking systhem' },
        { label: 'database administrator', value: 'database Adminstrator' }
      ];
      this.offers.push({
        id: faker.string.uuid(),
        titre: faker.name.jobTitle(),
        description: faker.lorem.paragraph(2),
        salary: faker.number.int({ min: 3000, max: 6000 }),
        createdAt: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`,
        status: faker.helpers.arrayElement(['open', 'closed']),
        type: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract', 'internship']),
        department: faker.helpers.arrayElement(departmentOptions.map(dep => dep.value))}
    )}
  }

  getOffers(): Offer[] {
    return this.offers;
  }

  addOffer(offer: Offer) {
    this.offers.push({
      ...offer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'open'
    });
  }
  updateOffer(offer: Offer): Offer | undefined {
    const index = this.offers.findIndex(o => o.id === offer.id);
    if (index > -1) {
      this.offers[index] = { ...offer };
      return this.offers[index];
    }
    return undefined;
  }


  deleteOffer(offerId : string){
    this.offers = this.offers.filter(o => o.id !== offerId )

  }

  getOfferById(id: string): Offer | undefined {
    return this.offers.find(o => o.id === id);
  }
  
}
