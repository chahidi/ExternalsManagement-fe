import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { Location } from '@angular/common';




@Component({
  selector: 'app-interview-cloture',
  imports: [CommonModule, CardModule, DividerModule],
  templateUrl: './interview-cloture.component.html',
  styleUrl: './interview-cloture.component.scss',
  standalone: true
})
export class InterviewClotureComponent implements OnInit {

  constructor(
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.preventBackNavigation();
  }

  private preventBackNavigation() {
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', () => {
      history.pushState(null, '', location.href);
    });
  }

}
