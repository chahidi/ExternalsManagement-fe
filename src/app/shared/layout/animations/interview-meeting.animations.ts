import { trigger, state, style, transition, animate } from '@angular/animations';

export const cameraTransition = trigger('cameraTransition', [
    transition(':enter', [
        style({
            transform: 'scale(0.5) translateX(-50%) translateY(-30%)',
            borderRadius: '12px',
            opacity: 0.8
        }),
        animate(
            '800ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({
                transform: 'scale(1) translateX(0) translateY(0)',
                borderRadius: '16px',
                opacity: 1
            })
        )
    ])
]);

export const slideInInterview = trigger('slideInInterview', [
    transition(':enter', [
        style({
            opacity: 0,
            transform: 'translateY(100%)'
        }),
        animate(
            '600ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({
                opacity: 1,
                transform: 'translateY(0)'
            })
        )
    ])
]);

export const fadeInControls = trigger('fadeInControls', [
    transition(':enter', [
        style({
            opacity: 0,
            transform: 'translateY(20px)'
        }),
        animate(
            '500ms 400ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({
                opacity: 1,
                transform: 'translateY(0)'
            })
        )
    ])
]);

export const slideInTranscript = trigger('slideInTranscript', [
    transition(':enter', [
        style({
            opacity: 0,
            transform: 'translateX(100%)'
        }),
        animate(
            '400ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({
                opacity: 1,
                transform: 'translateX(0)'
            })
        )
    ]),
    transition(':leave', [
        animate(
            '300ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({
                opacity: 0,
                transform: 'translateX(100%)'
            })
        )
    ])
]);


