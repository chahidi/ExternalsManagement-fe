export interface InterviewRule {
  icon: string;
  title: string;
  description: string;
}

export const INTERVIEW_RULES: InterviewRule[] = [
  {
    icon: 'pi pi-camera',
    title: 'INTERVIEW.CAMERA_ACCESS_TITLE',
    description: 'INTERVIEW.CAMERA_ACCESS_DESCRIPTION'
  },
  {
    icon: 'pi pi-ban',
    title: 'INTERVIEW.NO_TAB_SWITCHING_TITLE',
    description: 'INTERVIEW.NO_TAB_SWITCHING_DESCRIPTION'
  },
  {
    icon: 'pi pi-expand',
    title: 'INTERVIEW.FULLSCREEN_TITLE',
    description: 'INTERVIEW.FULLSCREEN_DESCRIPTION'
  },
  {
    icon: 'pi pi-globe',
    title: 'INTERVIEW.BROWSER_REQUIREMENTS_TITLE',
    description: 'INTERVIEW.BROWSER_REQUIREMENTS_DESCRIPTION'
  },
  {
    icon: 'pi pi-video',
    title: 'INTERVIEW.SESSION_RECORDING_TITLE',
    description: 'INTERVIEW.SESSION_RECORDING_DESCRIPTION'
  },
  {
    icon: 'pi pi-language',
    title: 'INTERVIEW.ENGLISH_ONLY_TITLE',
    description: 'INTERVIEW.ENGLISH_ONLY_DESCRIPTION'
  }
];
