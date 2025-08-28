import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
    selector: 'app-token-error',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    templateUrl: './token-error.component.html',
    styleUrls: ['./token-error.component.scss']
})
export class TokenErrorComponent {
    constructor(private router: Router) {}
}
