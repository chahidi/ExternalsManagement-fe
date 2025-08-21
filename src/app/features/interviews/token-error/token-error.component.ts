import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-token-error',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div class="max-w-md w-full">
        <p-card>
          <ng-template pTemplate="content">
            <div class="text-center space-y-6">
              <div class="text-red-500 text-6xl">
                <i class="pi pi-exclamation-triangle"></i>
              </div>

              <div class="space-y-2">
                <h2 class="text-2xl font-bold text-gray-800">Invalid Interview Link</h2>
                <p class="text-gray-600">
                  The interview link you're trying to access is invalid or has expired.
                </p>
              </div>

              <div class="space-y-3">
                <p class="text-sm text-gray-500">
                  Please check your link or contact the interviewer for a new one.
                </p>

                <p-button
                  label="Go to Home"
                  icon="pi pi-home"
                  severity="secondary"
                  (onClick)="goHome()"
                  styleClass="w-full">
                </p-button>
              </div>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `
})
export class TokenErrorComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
