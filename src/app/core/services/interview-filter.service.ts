import { Injectable } from '@angular/core';
import { Prompt } from '../models/prompt';
import { InterviewInstance } from '../models/interview-instance';

@Injectable({
  providedIn: 'root'
})
export class InterviewFilterService {
  constructor() {}

  searchInterviews(interviews: InterviewInstance[], query: string): InterviewInstance[] {
    if (!query.trim()) {
      return interviews;
    }
    const lowerQuery = query.toLowerCase();
    return interviews.filter(interview =>
      interview.candidateFullName.toLowerCase().includes(lowerQuery) || interview.candidateMainTech.toLowerCase().includes(lowerQuery) || interview.offerTitle.toLowerCase().includes(lowerQuery)
    );
  }
}
