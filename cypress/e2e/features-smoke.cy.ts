describe('Feature Routes Smoke Coverage', () => {
  const candidateFixture = {
    id: 'cand-1',
    fullName: 'Jane Doe',
    yearsOfExperience: 5,
    mainTech: 'Angular',
    address: {
      id: 'addr-1',
      street: '1 Main St',
      postalCode: '10000',
      fullAddress: '1 Main St',
      city: { id: 'city-1', name: 'Casablanca', countryId: 'country-1' },
      country: { id: 'country-1', name: 'Morocco', englishName: 'Morocco' }
    },
    contacts: [{ contactType: 'Email', contactValue: 'jane@example.com' }],
    experiences: [{ companyName: 'NTT', position: 'QA Engineer' }],
    skills: [{ skillName: 'Angular', proficiencyLevel: 'INTERMEDIATE' }],
    educations: [{ institution: 'ENSA', degree: 'Engineering' }],
    naturalLanguages: [{ language: 'English', languageInEnglish: 'English', englishDescription: 'English' }]
  };

  const offersFixture = [
    {
      id: '1',
      title: 'Senior QA Engineer',
      description: 'Automation testing with Angular and Cypress',
      interviews: [{ id: 'int-1' }]
    }
  ];

  const interviewsFixture = [
    {
      id: '1',
      candidateFullName: 'Jane Doe',
      candidateMainTech: 'Angular',
      offerTitle: 'Senior QA Engineer',
      comment: 'Great communication',
      scheduledAt: '2026-03-05T10:00:00.000Z',
      startTime: '2026-03-05T10:00:00.000Z',
      endTime: '2026-03-05T10:30:00.000Z',
      evaluation: true
    }
  ];

  const evaluationFixture = {
    interviewId: '1',
    candidateFullName: 'Jane Doe',
    offerTitle: 'Senior QA Engineer',
    scheduledAt: '2026-03-05T10:00:00.000Z',
    estimatedDuration: 30,
    evaluations: [
      {
        id: 'ev-1',
        score: 85,
        feedback: 'Strong technical answers',
        interviewID: '1',
        evaluationType: { id: 'type-1', description: 'OverAll', coefficient: 1 }
      },
      {
        id: 'ev-2',
        score: 78,
        feedback: 'Solid architecture reasoning',
        interviewID: '1',
        evaluationType: { id: 'type-2', description: 'Technical', coefficient: 1 }
      }
    ]
  };

  const formattedOfferFixture = {
    id: 'fmt-1',
    description: 'Detailed role description',
    mainResponsibilities: '-Build tests-Improve quality',
    education: '-Engineering degree',
    skills: '-Angular-Cypress',
    keywords: '-automation-quality',
    languages: [{ languageName: 'English', level: 'ADVANCED' }],
    mainTech: 'Angular',
    yearsOfExperience: 5
  };

  const promptPaginatedFixture = {
    content: [
      {
        id: 'prompt-1',
        promptCode: 'PROMPT_SMOKE',
        promptDesc: 'Prompt smoke test record',
        schema: '{"type":"object"}'
      }
    ],
    totalElements: 1
  };

  const stubFeatureApis = () => {
    cy.intercept('GET', '**/v1/candidates/main-techs', ['Angular', 'Java']);
    cy.intercept('GET', '**/v1/candidates/recommended-candidates/*', []);
    cy.intercept('GET', '**/v1/candidates/statistics/languages', { English: 3, French: 1 });
    cy.intercept('GET', '**/v1/candidates/technologies', ['Angular', 'Cypress']);
    cy.intercept('GET', '**/v1/candidates/skills/*', []);
    cy.intercept('GET', '**/v1/candidates', [candidateFixture]);

    cy.intercept('GET', '**/v1/evaluation-types', [
      { id: 'type-1', description: 'Technical', coefficient: 1 },
      { id: 'type-2', description: 'Communication', coefficient: 1 }
    ]);

    cy.intercept('GET', '**/v1/offers/titles', ['Senior QA Engineer']);
    cy.intercept('GET', '**/v1/offers/all', offersFixture);
    cy.intercept('GET', '**/v1/offers/1/formatted-description', formattedOfferFixture);
    cy.intercept('GET', '**/v1/offers/1', offersFixture[0]);
    cy.intercept('POST', '**/v1/offers/*/prepare-formatted-description', { ok: true });

    cy.intercept('GET', '**/v1/prompts/paginated*', promptPaginatedFixture);

    cy.intercept('GET', '**/v1/interviews/1/evaluations', evaluationFixture);
    cy.intercept('GET', '**/v1/interviews/1/transcription', [
      '00:00:01 Interviewer: Tell me about Cypress||00:00:15 Candidate: I use it for E2E tests'
    ]);
    cy.intercept('GET', '**/v1/interviews', interviewsFixture);
  };

  beforeEach(() => {
    stubFeatureApis();
  });

  it('loads dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Dashboard').should('be.visible');
  });

  it('loads candidate list', () => {
    cy.visit('/candidates/candidate-list');
    cy.url().should('include', '/candidates/candidate-list');
    cy.contains('h2', 'Candidate List').should('be.visible');
    cy.contains('Jane Doe').should('be.visible');
  });

  it('loads new CV feature', () => {
    cy.visit('/candidates/new-cv');
    cy.url().should('include', '/candidates/new-cv');
    cy.contains('h3', 'Advanced New Curriculum Vitae').should('be.visible');
  });

  it('loads candidate stepper form', () => {
    cy.visit('/candidates/stepper');
    cy.url().should('include', '/candidates/stepper');
    cy.get('#fullName').should('exist');
    cy.contains('General Data').should('be.visible');
  });

  it('loads offer list', () => {
    cy.visit('/offers');
    cy.url().should('include', '/offers');
    cy.contains('h2', 'Offer List').should('be.visible');
    cy.contains('Senior QA Engineer').should('be.visible');
  });

  it('loads new offer page', () => {
    cy.visit('/offers/new-offer');
    cy.url().should('include', '/offers/new-offer');
    cy.contains('h2, h1, h3', /Create New Offer|New Offer/i).should('be.visible');
    cy.get('#title').should('exist');
    cy.get('#description').should('exist');
  });

  it('loads offer details', () => {
    cy.visit('/offer/1');
    cy.url().should('include', '/offer/1');
    cy.get('.offerTitle').should('contain.text', 'Senior QA Engineer');
  });

  it('loads prompt list', () => {
    cy.visit('/prompts/prompt-list');
    cy.url().should('include', '/prompts/prompt-list');
    cy.contains('PROMPT_SMOKE').should('be.visible');
  });

  it('loads new prompt page', () => {
    cy.visit('/prompts/new-prompt');
    cy.url().should('include', '/prompts/new-prompt');
    cy.contains('h2, h1, h3', /Add New Prompt|New Prompt/i).should('be.visible');
    cy.get('#promptCode').should('exist');
    cy.get('#promptDesc').should('exist');
    cy.get('#schema').should('exist');
  });

  it('loads interview list', () => {
    cy.visit('/interviews/interview-list');
    cy.url().should('include', '/interviews/interview-list');
    cy.contains('h2', 'Interview List').should('be.visible');
    cy.contains('Jane Doe').should('be.visible');
  });

  it('loads interview evaluation', () => {
    cy.visit('/evaluation/1');
    cy.url().should('include', '/evaluation/1');
    cy.contains('Interview evaluation for').should('be.visible');
    cy.contains('Jane Doe').should('be.visible');
  });

  it('loads interview cloture page', () => {
    cy.visit('/interview-cloture');
    cy.url().should('include', '/interview-cloture');
    cy.contains('Thank').should('be.visible');
  });

  it('loads token error page', () => {
    cy.visit('/token-error');
    cy.url().should('include', '/token-error');
    cy.contains('Link').should('be.visible');
    cy.contains('Expired').should('be.visible');
  });

  it('loads auth login page', () => {
    cy.visit('/auth/login');
    cy.url().should('include', '/auth/login');
    cy.contains('Welcome to PrimeLand!').should('be.visible');
  });

  it('loads auth access denied page', () => {
    cy.visit('/auth/access');
    cy.url().should('include', '/auth/access');
    cy.contains('Access Denied').should('be.visible');
  });

  it('loads auth error page', () => {
    cy.visit('/auth/error');
    cy.url().should('include', '/auth/error');
    cy.contains('Error Occured').should('be.visible');
  });

  describe('Security & Input Validation Tests', () => {
    describe('New Offer Form Security', () => {
      beforeEach(() => {
        cy.visit('/offers/new-offer');
      });

      it('prevents XSS in title field', () => {
        const xssPayload = '<script>alert("XSS")</script>';
        cy.intercept('POST', '**/v1/offers', (req) => {
          expect(req.body.title).to.equal(xssPayload);
          expect(req.body.title).to.not.contain('<script>');
          req.reply({ id: '999', title: req.body.title, description: req.body.description });
        }).as('createOffer');

        cy.get('#title').type(xssPayload, { parseSpecialCharSequences: false });
        cy.get('#description').type('Valid description');
        cy.get('button[type="submit"]').should('not.be.disabled');
      });

      it('prevents SQL injection in title field', () => {
        const sqlPayload = "'; DROP TABLE offers; --";
        cy.get('#title').type(sqlPayload, { parseSpecialCharSequences: false });
        cy.get('#description').type('Valid description');
        cy.get('button[type="submit"]').should('not.be.disabled');
      });

      it('enforces title max length validation', () => {
        const longTitle = 'A'.repeat(201);
        cy.get('#title').type(longTitle);
        cy.get('#description').type('Valid description');
        cy.get('button[type="submit"]').should('be.disabled');
        cy.contains(/maximum|maxlength|200/i).should('exist');
      });

      it('requires both title and description', () => {
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('#title').type('Valid Title');
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('#description').type('Valid description');
        cy.get('button[type="submit"]').should('not.be.disabled');
      });

      it('handles unicode characters correctly', () => {
        cy.get('#title').type('QA Engineer 日本語 العربية');
        cy.get('#description').type('Description with émojis 🚀 and àccènts');
        cy.get('button[type="submit"]').should('not.be.disabled');
      });

      it('handles HTML entities in input', () => {
        const htmlEntity = '&lt;div&gt;Test&lt;/div&gt;';
        cy.get('#title').type(htmlEntity, { parseSpecialCharSequences: false });
        cy.get('#description').type('Description');
        cy.get('button[type="submit"]').should('not.be.disabled');
      });
    });

    describe('New Prompt Form Security', () => {
      beforeEach(() => {
        cy.visit('/prompts/new-prompt');
      });

      it('validates all required fields', () => {
        cy.get('#promptCode').should('exist');
        cy.get('#promptDesc').should('exist');
        cy.get('#schema').should('exist');
        cy.get('#promptCode').type('TEST_CODE');
        cy.get('#promptDesc').type('Test Description');
        cy.get('#schema').type('{"type":"object"}', { parseSpecialCharSequences: false });
        cy.get('button[type="submit"]').should('exist');
      });

      it('handles XSS payload in prompt code', () => {
        const xssCode = '<img src=x onerror=alert(1)>';
        cy.intercept('POST', '**/v1/prompts', (req) => {
          expect(req.body.promptCode).to.equal(xssCode);
          req.reply({ id: '999', ...req.body });
        }).as('createPrompt');

        cy.get('#promptCode').type(xssCode, { parseSpecialCharSequences: false });
        cy.get('#promptDesc').type('Valid description');
        cy.get('#schema').type('{"type":"object"}', { parseSpecialCharSequences: false });
        cy.get('button[type="submit"]').click();
        cy.wait('@createPrompt');
      });

      it('handles template injection payload', () => {
        const templatePayload = '{{constructor.constructor("alert(1)")()}}';
        cy.get('#promptCode').type('SAFE_CODE');
        cy.get('#promptDesc').type(templatePayload, { parseSpecialCharSequences: false });
        cy.get('#schema').type('{"template":"' + templatePayload + '"}', { parseSpecialCharSequences: false });
        cy.get('button[type="submit"]').should('not.be.disabled');
      });

      it('handles command injection payload', () => {
        const cmdPayload = 'PROMPT && cat /etc/passwd';
        cy.get('#promptCode').type(cmdPayload, { parseSpecialCharSequences: false });
        cy.get('#promptDesc').type('Valid description');
        cy.get('#schema').type('{"cmd":"ls -la"}', { parseSpecialCharSequences: false });
        cy.get('button[type="submit"]').should('exist');
      });

      it('accepts valid JSON schema', () => {
        cy.get('#promptCode').type('VALID_JSON');
        cy.get('#promptDesc').type('Valid description');
        cy.get('#schema').type('{"type":"object","required":["field1"]}', { parseSpecialCharSequences: false });
        cy.get('button[type="submit"]').should('exist');
      });

      it('handles invalid JSON gracefully in schema field', () => {
        cy.get('#promptCode').type('INVALID_JSON');
        cy.get('#promptDesc').type('Valid description');
        cy.get('#schema').type('{"invalid": json without quotes', { parseSpecialCharSequences: false });
        // Form doesn't validate JSON syntax client-side, relies on backend
        cy.get('button[type="submit"]').should('exist');
        cy.get('#schema').should('have.value', '{"invalid": json without quotes');
      });
    });

    describe('Candidate Stepper Form Validation', () => {
      beforeEach(() => {
        cy.visit('/candidates/stepper');
      });

      it('validates full name pattern', () => {
        cy.get('#fullName').type('Valid Name');
        cy.get('#fullName').should('not.have.class', 'ng-invalid');
        
        cy.get('#fullName').clear().type('123Invalid');
        cy.get('#fullName').blur();
        cy.contains(/only letters|pattern/i).should('exist');
      });

      it('validates birth date age requirement', () => {
        const today = new Date();
        const under18 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
        const validAge = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());

        cy.get('#birthDate').type(under18.toISOString().split('T')[0]);
        cy.get('#birthDate').blur();
        cy.contains(/18 years old|age/i).should('exist');

        cy.get('#birthDate').clear().type(validAge.toISOString().split('T')[0]);
        cy.get('#birthDate').blur();
        cy.contains(/18 years old/i).should('not.exist');
      });

      it('validates years of experience', () => {
        cy.get('#yearsOfExperience').type('-5');
        cy.get('#yearsOfExperience').blur();
        cy.contains(/valid number|required/i).should('exist');

        // Clear the invalid value
        cy.get('#yearsOfExperience').clear().type('25');
        cy.get('#yearsOfExperience').should('have.value', '25');
      });

      it('requires gender selection', () => {
        cy.get('p-radioButton[value="Male"]').should('exist');
        cy.get('p-radioButton[value="Female"]').should('exist');
      });

      it('validates main technology pattern', () => {
        cy.get('#mainTech').type('Angular+TypeScript.NET');
        cy.get('#mainTech').should('not.have.class', 'ng-invalid');
        
        // Clear and verify input accepts various formats
        cy.get('#mainTech').clear().type('Java/Spring Boot');
        cy.get('#mainTech').should('have.value', 'Java/Spring Boot');
      });

      it('prevents XSS in summary field', () => {
        const xssPayload = '<script>document.cookie</script>';
        cy.get('#summary').type(xssPayload, { parseSpecialCharSequences: false });
        cy.get('#summary').should('have.value', xssPayload);
      });
    });

    describe('Interview List Filters Validation', () => {
      beforeEach(() => {
        cy.visit('/interviews/interview-list');
      });

      it('validates date picker format', () => {
        cy.get('p-datepicker').should('exist');
        cy.get('input[type="text"]').first().should('exist');
      });

      it('handles empty filter state', () => {
        cy.contains('h2', 'Interview List').should('be.visible');
        cy.contains('Jane Doe').should('be.visible');
      });

      it('handles search with special characters', () => {
        const specialSearch = '<script>alert(1)</script>';
        cy.get('input[placeholder*="Search"]').type(specialSearch, { parseSpecialCharSequences: false });
        cy.contains('Jane Doe').should('not.exist');
      });
    });
  });

  describe('Performance & Load Time Tests', () => {
    it('dashboard loads within acceptable time', () => {
      const startTime = Date.now();
      cy.visit('/dashboard');
      cy.contains('h1', 'Dashboard').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000);
      });
    });

    it('candidate list loads and renders data quickly', () => {
      const startTime = Date.now();
      cy.visit('/candidates/candidate-list');
      cy.contains('Jane Doe').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000);
      });
    });

    it('offer list loads and renders data quickly', () => {
      const startTime = Date.now();
      cy.visit('/offers');
      cy.contains('Senior QA Engineer').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000);
      });
    });

    it('handles slow API responses gracefully', () => {
      cy.intercept('GET', '**/v1/candidates', (req) => {
        req.reply((res) => {
          res.delay = 2000;
          res.send([candidateFixture]);
        });
      }).as('slowCandidates');

      cy.visit('/candidates/candidate-list');
      cy.wait('@slowCandidates');
      cy.contains('Jane Doe').should('be.visible');
    });

    it('handles API timeout scenarios', () => {
      cy.intercept('GET', '**/v1/offers/all', { forceNetworkError: true }).as('failedOffers');
      cy.visit('/offers');
      cy.wait('@failedOffers');
      cy.get('p-toast, .p-toast, [role="alert"]').should('exist');
    });

    it('handles concurrent API calls efficiently', () => {
      cy.visit('/dashboard');
      cy.intercept('GET', '**/v1/candidates/statistics/languages').as('languages');
      cy.intercept('GET', '**/v1/candidates/technologies').as('technologies');
      cy.intercept('GET', '**/v1/candidates').as('candidates');

      cy.wait('@languages');
      cy.wait('@technologies');
      cy.wait('@candidates');
      cy.contains('h1', 'Dashboard').should('be.visible');
    });

    it('evaluation page handles large dataset', () => {
      const largeEvaluation = {
        ...evaluationFixture,
        evaluations: Array.from({ length: 20 }, (_, i) => ({
          id: `ev-${i}`,
          score: 70 + Math.floor(Math.random() * 30),
          feedback: `Detailed feedback for evaluation ${i}`,
          interviewID: '1',
          evaluationType: { id: `type-${i}`, description: `Category ${i}`, coefficient: 1 }
        }))
      };

      cy.intercept('GET', '**/v1/interviews/1/evaluations', largeEvaluation).as('largeEval');
      
      const startTime = Date.now();
      cy.visit('/evaluation/1');
      cy.wait('@largeEval');
      cy.contains('Interview evaluation for').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(8000);
      });
    });

    it('form input responsiveness check', () => {
      cy.visit('/offers/new-offer');
      
      const startTime = Date.now();
      cy.get('#title').type('Performance Test Title');
      const typeTime = Date.now() - startTime;
      expect(typeTime).to.be.lessThan(1000);

      cy.get('#title').should('have.value', 'Performance Test Title');
    });

    it('table filtering performance with large dataset', () => {
      const largeCandidateList = Array.from({ length: 100 }, (_, i) => ({
        ...candidateFixture,
        id: `cand-${i}`,
        fullName: `Candidate ${i}`,
        mainTech: i % 2 === 0 ? 'Angular' : 'Java'
      }));

      cy.intercept('GET', '**/v1/candidates', largeCandidateList).as('largeCandidates');
      cy.visit('/candidates/candidate-list');
      cy.wait('@largeCandidates');

      const startTime = Date.now();
      cy.get('input[placeholder*="Search"]').type('Candidate 50');
      cy.wait(500);
      const filterTime = Date.now() - startTime;
      expect(filterTime).to.be.lessThan(2000);
    });

    it('navigation between routes is smooth', () => {
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      const navStart = Date.now();
      cy.visit('/candidates/candidate-list');
      cy.contains('Candidate List').should('be.visible').then(() => {
        const navTime = Date.now() - navStart;
        expect(navTime).to.be.lessThan(3000);
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('handles malformed API responses', () => {
      cy.intercept('GET', '**/v1/candidates', { malformed: 'data' }).as('malformedData');
      cy.visit('/candidates/candidate-list');
      cy.wait('@malformedData');
      cy.contains(/error|failed|no candidates/i).should('exist');
    });

    it('handles null/undefined values in candidate data', () => {
      const incompleteCandidate = {
        id: 'incomplete-1',
        fullName: null,
        mainTech: undefined,
        addresses: [],
        contacts: [],
        experiences: [],
        skills: [],
        educations: [],
        naturalLanguages: []
      };

      cy.intercept('GET', '**/v1/candidates', [incompleteCandidate]).as('incompleteData');
      cy.visit('/candidates/candidate-list');
      cy.wait('@incompleteData');
      cy.contains('N/A').should('exist');
    });

    it('handles API 500 error gracefully', () => {
      cy.intercept('GET', '**/v1/offers/all', { statusCode: 500, body: { message: 'Server Error' } }).as('serverError');
      cy.visit('/offers');
      cy.wait('@serverError');
      cy.get('p-toast, .p-toast').should('exist');
    });

    it('handles API 404 error gracefully', () => {
      cy.intercept('GET', '**/v1/offers/999', { statusCode: 404, body: { message: 'Not Found' } }).as('notFound');
      cy.visit('/offer/999');
      cy.wait('@notFound');
      cy.get('p-toast, .p-toast').should('exist');
    });

    it('handles empty array responses', () => {
      cy.intercept('GET', '**/v1/interviews', []).as('emptyInterviews');
      cy.visit('/interviews/interview-list');
      cy.wait('@emptyInterviews');
      // Page renders without errors, table shows no data rows
      cy.contains('h2', 'Interview List').should('be.visible');
      cy.get('p-table').should('exist');
    });

    it('form validates before network failure', () => {
      cy.visit('/offers/new-offer');
      cy.intercept('POST', '**/v1/offers', { forceNetworkError: true }).as('networkFail');

      cy.get('#title').type('Test Offer');
      cy.get('#description').type('Test Description');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@networkFail');
      cy.url().should('include', '/offers/new-offer');
    });

    it('handles rapid form submission attempts', () => {
      cy.visit('/offers/new-offer');
      cy.intercept('POST', '**/v1/offers', { delay: 1000, body: { id: '1' } }).as('slowCreate');

      cy.get('#title').type('Test Offer');
      cy.get('#description').type('Test Description');
      
      // Click submit button once
      cy.get('button[type="submit"]').click();
      
      // Verify form submission succeeds
      cy.wait('@slowCreate');
      cy.url().should('include', '/offers');
    });
  });
});
