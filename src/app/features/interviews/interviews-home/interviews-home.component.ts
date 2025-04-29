import { Component } from '@angular/core';
import { LayoutComponent } from '../../../shared/layout/layout.component';  // adjust path if needed
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-interviews-home',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent], 
  templateUrl: './interviews-home.component.html',
  styleUrls: ['./interviews-home.component.scss']
})
export class InterviewsHomeComponent {}
