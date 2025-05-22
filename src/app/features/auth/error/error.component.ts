import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TranslateModule } from '@ngx-translate/core';


@Component({
    selector: 'app-error',
    imports: [ButtonModule, RippleModule, RouterModule, ButtonModule, TranslateModule],
    standalone: true,
    templateUrl:'./error.component.html'
})
export class ErrorComponent {}
