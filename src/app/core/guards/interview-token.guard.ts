import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TokenValidationService } from '../services/token-validation.service';
@Injectable({
  providedIn: 'root'
})
export class InterviewTokenGuard implements CanActivate {

  constructor(
    private tokenValidationService: TokenValidationService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const token = route.params['token'];

    if (!token) {
      this.router.navigate(['/token-error']);
      return of(false);
    }

    return this.tokenValidationService.validateToken(token).pipe(
      map((isValid: boolean) => {
        if (isValid) {
          return true;
        } else {
          this.router.navigate(['/token-error']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/token-error']);
        return of(false);
      })
    );
  }
}
