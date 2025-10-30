import { Component, OnInit, OnDestroy } from '@angular/core';
import { OfferService } from '../../../../core/services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../../../core/services/utils/notification.service';
import { Offer } from '../../../../core/models/offer';
import { OfferFormattedDescription } from '../../../../core/models/offerFormattedDescription';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { OfferFormattedDescriptionLanguage } from '../../../../core/models/offerFormattedDescriptionLanguage';
import { LoaderService } from '../../../../core/services/loader.service';
import { LoaderComponent } from '../../../../shared/layout/components/loader/loader.component';
import { ListboxModule } from 'primeng/listbox';
import { RecommendedCandidatesComponent } from '../recommended-candidates/recommended-candidates.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [
    LoaderComponent,
    CommonModule,
    TagModule,
    CardModule,
    ChipModule,
    ListboxModule,
    RecommendedCandidatesComponent,
    TranslateModule
  ],
  providers: [MessageService, NotificationService],
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit, OnDestroy {

  isLoading$!: any;
  loadingMessage$!: any;
  skillsList: string[] = [];
  mainResponsibilitiesList: string[] = [];
  educationList: string[] = [];
  keywordsList: string[] = [];
  offerTitle: string = '';
  languages: OfferFormattedDescriptionLanguage[] = [];
  description: string = '';
  mainTech: string = '';
  yearsOfExperience: number = 0;
  offerId!: string;

  private languageSubscription?: Subscription;

  constructor(
    private offerServ: OfferService,
    private router: Router,
    private route: ActivatedRoute,
    private notify: NotificationService,
    private loader: LoaderService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    const globalLanguage = this.languageService.getCurrentLanguage();
    this.translate.use(globalLanguage);

    this.languageSubscription = this.languageService.getLanguageObservable().subscribe(lang => {
      this.translate.use(lang);
    });

    this.isLoading$ = this.loader.isLoading$;
    this.loadingMessage$ = this.loader.loadingMessage$;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.translate.get(['offerDetails.errorTitle', 'offerDetails.errors.idNotFound']).subscribe(translations => {
        this.notify.showError(
          translations['offerDetails.errorTitle'],
          translations['offerDetails.errors.idNotFound']
        );
      });
      return;
    }

    this.offerId = id;

    this.translate.get('offerDetails.loading.message').subscribe(msg => {
      this.loader.show(msg);
    });

    this.loadOfferFormattedDescriptionAndOfferTitle(id);
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadOfferFormattedDescriptionAndOfferTitle(offerId: string): void {
    this.offerServ.getOfferById(offerId).subscribe({
      next: (offer: Offer) => {
        this.offerTitle = offer.title;
      },
      error: () => {
        this.translate.get(['offerDetails.errorTitle', 'offerDetails.errors.loadFailed']).subscribe(translations => {
          this.notify.showError(
            translations['offerDetails.errorTitle'],
            translations['offerDetails.errors.loadFailed']
          );
        });
        this.loader.hide();
      }
    });

    this.offerServ.getOfferFormattedDescription(offerId).subscribe({
      next: (offerFormattedDescription: OfferFormattedDescription) => {
        this.skillsList = offerFormattedDescription.skills.split('-').filter(s => s.trim());
        this.mainResponsibilitiesList = offerFormattedDescription.mainResponsibilities.split('-').filter(r => r.trim());
        this.educationList = offerFormattedDescription.education.split('-').filter(e => e.trim());
        this.keywordsList = offerFormattedDescription.keywords.split('-').filter(k => k.trim());
        this.languages = offerFormattedDescription.languages;
        this.description = offerFormattedDescription.description;
        this.mainTech = offerFormattedDescription.mainTech;
        this.yearsOfExperience = offerFormattedDescription.yearsOfExperience;

        this.loader.hide();
      },
      error: () => {
        this.translate.get(['offerDetails.errorTitle', 'offerDetails.errors.loadFormattedFailed']).subscribe(translations => {
          this.notify.showError(
            translations['offerDetails.errorTitle'],
            translations['offerDetails.errors.loadFormattedFailed']
          );
        });
        this.loader.hide();
      }
    });
  }

  getLanguageLevel(level: string): string {
    const translationKey = `offerDetails.languageLevels.${level}`;
    const translatedLevel = this.translate.instant(translationKey);
    return translatedLevel === translationKey ? level : translatedLevel;
  }
}
