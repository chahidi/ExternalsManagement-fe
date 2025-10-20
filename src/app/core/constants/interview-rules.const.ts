export interface InterviewRule {
  icon: string;
  title: string;
  description: string;
}

export const INTERVIEW_RULES: InterviewRule[] = [
  {
    icon: 'pi pi-camera',
    title: 'Camera Access Required',
    description: 'Camera access is required to begin the interview session.'
  },
  {
    icon: 'pi pi-ban',
    title: 'No Tab Switching',
    description: 'Do not switch tabs, minimize, or close the window during the interview.'
  },
  {
    icon: 'pi pi-expand',
    title: 'Fullscreen Mode',
    description: 'Fullscreen mode will start automatically after you click "I\'m Ready".'
  },
  {
    icon: 'pi pi-globe',
    title: 'Browser Requirements (Chrome or Edge)',
    description: 'Use only Chrome or Edge browser for optimal performance and compatibility.'
  },
  {
    icon: 'pi pi-video',
    title: 'Session Recording',
    description: 'The entire session will be monitored and recorded for evaluation.'
  },
    {
    icon: 'pi pi-globe',
    title: 'English Language Only',
    description: 'The interview will be conducted in English. You must answer all questions using English only.'
  }
];
