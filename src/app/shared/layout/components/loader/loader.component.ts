import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
    @Input() size: string = '50px';
    @Input() strokeWidth: string = '4';
    @Input() color: string = '#1976d2';
    @Input() animationDuration: string = '1s';
    @Input() withOverlay: boolean = false;
    @Input() message: string | null = null;
}
