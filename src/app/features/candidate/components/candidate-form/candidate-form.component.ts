import { Component } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';


@Component({
  selector: 'app-candidate-form',
  standalone:true,
  imports: [PanelModule,TabsModule],
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.scss'
})
export class CandidateFormComponent {

}
