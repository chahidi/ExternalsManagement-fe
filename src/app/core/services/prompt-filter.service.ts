import { Injectable } from '@angular/core';
import { Prompt } from '../models/prompt';

@Injectable({
  providedIn: 'root'
})
export class PromptFilterService {
  constructor() {}

  searchPrompts(prompts: Prompt[], query: string): Prompt[] {
    if (!query.trim()) {
      return prompts;
    }
    const lowerQuery = query.toLowerCase();
    return prompts.filter(prompt =>
      prompt.promptCode.toLowerCase().includes(lowerQuery) ||
      prompt.promptDesc.toLowerCase().includes(lowerQuery) ||
      (prompt.schema && prompt.schema.toLowerCase().includes(lowerQuery))
    );
  }
}