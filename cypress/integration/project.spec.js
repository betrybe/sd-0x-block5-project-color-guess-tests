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

describe('O seu site deve possuir um título com o nome do seu jogo', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('O id do seu título deve ser title', () => {
    cy.get('#title')
      .invoke('text')
      .should('not.be.empty');
  });
});

describe('A página deve possuir o texto RGB a ser adivinhado', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('O seu id deve ser rgb-color', () => {
    cy.get('#rgb-color')
      .should('exist');
  });

  it('Esse texto deve conter os três números das cores RGB a ser adivinhada, no seguinte formato: `(168, 34, 1)`', () => {
    const rgbTextRegex = /\((\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\)/;
    cy.get('#rgb-color')
      .invoke('text')
      .should('match', rgbTextRegex);
  });
});

describe('A página deve conter opções de cores para serem adivinhadas', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('Deve conter 6 circulos como opção de cor de adivinhação', () => {
    cy.get('.ball')
      .should('have.length', 6)
      .each((ball) => {
        expect(ball.height())
          .to.equal(ball.width());
        expect(ball.css('border-radius'))
          .not.to.be.empty;
      })
  });

  it('A class de todos os circulos deve ser ball', () => {
    cy.get('.ball')
      .should('exist')
  });
});

describe('As cores das bolas devem ser geradas', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('Ao carregar a página, as cores de cada um dos 6 circulos coloridos deve ser geradas via JavaScript', () => {
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
});

describe('Ao clicar em uma bola, deve ser mostrado um texto', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('O seu **id** do elemento deve ser `answer`', () => {
    cy.get('#answer')
      .should('exist');
  });
  
  it('Quando o jogo é iniciado, o texto exibido deve ser `"Escolha uma cor"`', () => {
    cy.get('#answer')
      .invoke('text')
      .should('match', /Escolha uma cor/);
  });

  it('Se o circulo colorido for o **correto**, deve ser exibido o texto "Acertou!"', () => {
    rightBall().click();

    cy.get('#answer')
      .invoke('text')
      .should('match', /Acertou!/);
  });

  it('Se o circulo colorido for o **incorreta**, deve ser exibido o texto "Errou! Tente novamente!"', () => {
    wrongBall().click();

    cy.get('#answer')
      .invoke('text')
      .should('match', /Errou! Tente novamente/);
  });
});

describe('Crie um botão para iniciar/reiniciar o jogo', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('O botão deve ter o id reset-game', () => {
    cy.get('#reset-game')
      .should('exist');

  });

  it('Ao clicar no botão, novas cores devem ser geradas via JavaScript e o elemento rgb-color deve ser atualizado', () => {
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
        }
      });
    });
  });

  it('Ao clicar no botão, o elemento answer deve voltar ao estado inicial, exibindo o texto "Escolha uma cor"', () => {
    // click the reset game button 5 times
    for (let i = 0; i < 5; i += 1) {
      cy.get('.ball').then((balls) => {
        balls[0].click()
      });

      cy.get('#reset-game')
        .click();

      // check that the initial text was reset
      cy.get('#answer')
        .invoke('text')
        .should('match', /Escolha uma cor/);
    }    
  });
});

describe('Crie um placar que incremente 3 pontos para cada acerto no jogo', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('O elemento deve ter o **id** `score`.', () => {
    cy.get("#score")
      .should('exist');
  });

  it('O valor inicial dele deve ser 0.', () => {
    expect(score()).to.equal(0);
  });

  it('A cada acerto, é incrementado 3 pontos ao placar', () => {
    rightBall().click().should(() => {
      expect(score()).to.equal(3);
    });
  });

  it('Ao clicar no botão reiniciar, o placar NÃO deve ser resetado', () => {
    rightBall()
      .click()

    cy.get('#reset-game').click().then(() => {
      rightBall().click().should(() => {
        expect(score()).to.equal(6);
      });
    });
  });
});
