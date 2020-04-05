const colorsEqual = (color1, color2) => (
  color1.every((value, index) => value === color2[index])
);

function extractScore(score) {
  if (!score) return null;
  const match = score.text().match(/\d+/);
  if (!match) return null;
  return Number(match[0]);
}

function score() {
  const $score = Cypress.$('#score')

  if (!$score) return null;

  const match = $score.text().match(/\d+/);

  if (!match) return null;

  return Number(match[0]);
}

function rightBall() {
  const colorRGBValue = Cypress.$('#rgb-color').text().match(/\d+/g);
  const ball = Array.from(Cypress.$('.ball')).find((ball) => {
    const ballRGBValue = Cypress.$(ball).css('background-color').match(/\d+/g);
    return colorsEqual(colorRGBValue, ballRGBValue);
  });
  return cy.wrap(ball);
}

function wrongBall() {
  const colorRGBValue = Cypress.$('#rgb-color').text().match(/\d+/g);
  const ball = Array.from(Cypress.$('.ball')).find((ball) => {
    const ballRGBValue = Cypress.$(ball).css('background-color').match(/\d+/g);
    return !colorsEqual(colorRGBValue, ballRGBValue);
  });
  return cy.wrap(ball);
}

describe('Color Guess Project', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('A página deve possuir um título centralizado com o nome do seu jogo', () => {
    cy.get('#title').invoke('text').should('not.be.empty');
  });

  it('A página deve conter um texto centralizado com o RGB a ser adivinhado', () => {
    const rgbTextRegex = /\((\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\)/;
    cy.get('#rgb-color').invoke('text').should('match', rgbTextRegex);
  });

  it('A página deve conter 6 bolas como opção de cor de adivinhação', () => {
    cy.get('.ball')
      .should('have.length', 6)
      .each((ball) => {
        expect(ball.height()).to.equal(ball.width());
        expect(ball.css('border-radius')).not.to.be.empty;
      })
  });

  it('Ao clicar em uma bola, deve ser mostrado um texto que indica se a cor ' +
     'selecionada foi a correta', () => {
    cy.get('#answer')
      .invoke('text')
      .should('match', /Escolha uma cor/);

    wrongBall().click();

    cy.get('#answer')
      .invoke('text')
      .should('match', /Errou! Tente novamente/);

    rightBall().click();

    cy.get('#answer')
      .invoke('text')
      .should('match', /Acertou!/);
  });

  it('As cores das bolas devem ser geradas aleatoriamente via JavaScript', () => {
    let currentBallColors, previousBallColors;

    cy.get('.ball').then((balls) => {
      // get the initial ball colors
      previousBallColors = Array.from(balls).map((ball) => (
        Cypress.$(ball).css('background-color')
      ));

      // reload the page 5 times and check that the colors change each time
      for (let i = 0; i < 5; i += 1) {
        cy.reload();
        cy.get('.ball').should((balls) => {
            currentBallColors = Array.from(balls).map((ball) => (
              Cypress.$(ball).css('background-color')
            ));

            expect(currentBallColors).not.to.deep.equal(previousBallColors);
            previousBallColors = currentBallColors;
        });
      }
    });
  });

  it('Deve haver um botão para reiniciar o jogo', () => {
    let currentRGBColor, previousRGBColor, currentBallColors, previousBallColors;

    // get the initial RGB color
    cy.get('#rgb-color').then((rgbColor) => {
      previousRGBColor = rgbColor.text();

      // get the initial ball colors
      cy.get('.ball').then((balls) => {
        previousBallColors = Array.from(balls).map((ball) => (
          Cypress.$(ball).css('background-color')
        ));
      
        // click the reset game button 5 times
        for (let i = 0; i < 5; i += 1) {
          cy.get('#reset-game').click();

          // check that the RGB color changed
          cy.get('#rgb-color').should((foo) => {
            currentRGBColor = foo.text();
            expect(currentRGBColor).not.to.equal(previousRGBColor);
            previousRGBColor = currentRGBColor;
          });

          // check that the ball colors changed
          cy.get('.ball').should((balls) => {
            currentBallColors = Array.from(balls).map((ball) => (
              Cypress.$(ball).css('background-color')
            ));

            expect(currentBallColors).not.to.deep.equal(previousBallColors);
            previousBallColors = currentBallColors;
          });

          // check that the initial text was reset
          cy.get('#answer')
            .invoke('text')
            .should('match', /Escolha uma cor/);
        }
      });
    });
  });

  it('Crie um placar que incremente 3 pontos para cada acerto no jogo', () => {
    expect(score()).to.equal(0);

    rightBall().click().should(() => {
      expect(score()).to.equal(3);
    });

    cy.get('#reset-game').click().then(() => {
      rightBall().click().should(() => {
        expect(score()).to.equal(6);
      });
    });
  });

  it('Crie uma regra que decremente 1 ponto para cada erro', () => {
  });

  it("Crie uma regra de incremento e decremento progressivos", () => {

  });
});
