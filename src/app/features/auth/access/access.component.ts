import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-access',
    standalone: true,
    imports: [ButtonModule, RouterModule, RippleModule, ButtonModule, TranslateModule],
    templateUrl:'./access.component.html'
})
export class AccessComponent {}
