import { Routes } from "@angular/router";

export const OFFER_ROUTES: Routes = [
    {
      path: '',
      loadComponent: () =>
        import('./components/offer-list/offer-list.component').then(m => m.OfferListComponent),
      title: 'Offer List'
    },


    {
        path : 'new-offer' ,
        loadComponent : ()=>
            import('./components/new-offer/new-offer.component').then(m=>m.NewOfferComponent),
        title : 'New Offer'
    },

  ];
