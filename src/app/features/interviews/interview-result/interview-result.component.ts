import {Component} from '@angular/core';
import {TableModule} from 'primeng/table';
import {CommonModule} from '@angular/common';
import { InterviewScore } from '../../../core/models/interview-score.model';

const ELEMENT_DATA: InterviewScore[] = [
    {id: 1, candidateName: 'Samir El Moutawakil', mainTech: "Front End", interviewDate: '2023-03-07'},
    {id: 2, candidateName: 'Zineb Akkaoui', mainTech: "Front End", interviewDate: '2023-04-19'},
    {id: 3, candidateName: 'Rachid Naciri', mainTech: "Front End", interviewDate: '2023-05-28'},
    {id: 4, candidateName: 'Khadija El Omari', mainTech: "Front End", interviewDate: '2023-06-14'},
    {id: 5, candidateName: 'Hassan Bennis', mainTech: "Front End", interviewDate: '2023-07-22'},
    {id: 6, candidateName: 'Sanaa Moujtahid', mainTech: "Front End", interviewDate: '2023-08-30'},
    {id: 7, candidateName: 'Tarik El Filali', mainTech: "Front End", interviewDate: '2023-09-11'},
    {id: 8, candidateName: 'Noura Safi', mainTech: "Front End", interviewDate: '2023-10-05'},
    {id: 9, candidateName: 'Anas Kabbaj', mainTech: "Front End", interviewDate: '2023-11-17'},
    {id: 10, candidateName: 'Imane Rhanem', mainTech: "Front End", interviewDate: '2023-12-21'}
];

@Component({
    selector: 'app-interview-result',
    imports: [TableModule, CommonModule],
    templateUrl: './interview-result.component.html',
    styleUrl: './interview-result.component.css'
})
export class InterviewResultComponent {
    dataSource = ELEMENT_DATA;
}
