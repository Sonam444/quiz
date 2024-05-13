document.addEventListener('DOMContentLoaded', () => {
  const quizContainer = document.getElementById('quiz-container');
  const startBtn = document.getElementById('start-btn');

  startBtn.addEventListener('click', startQuiz);

  async function startQuiz() {
    startBtn.style.display = 'none';

    const characters = await fetchCharacters();
    if (characters.length === 0) {
      quizContainer.innerHTML = '<p>Failed to fetch characters. Please try again later.</p>';
      return;
    }

    let score = 0;
    for (let i = 0; i < 5; i++) { // Adjust the number of questions as needed
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters[randomIndex];
      const question = generateQuestion(randomCharacter, characters);

      const questionElement = document.createElement('div');
      questionElement.classList.add('question');
      questionElement.innerHTML = `
        <h2>${question.question}</h2>
        <div class="choices">
          ${question.choices.map((choice, index) => `
            <button class="choice-btn" data-answer="${index}">${choice}</button>
          `).join('')}
        </div>
      `;
      quizContainer.appendChild(questionElement);

      const choiceBtns = questionElement.querySelectorAll('.choice-btn');
      choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedAnswer = parseInt(btn.getAttribute('data-answer'));
          if (selectedAnswer === question.correctAnswerIndex) {
            score++;
          }
          questionElement.remove();
          if (i === 4) {
            showResult(score);
          }
        });
      });
    }
  }

  async function fetchCharacters() {
    try {
      const response = await fetch(`https://swapi.dev/api/people/?apiKey=${SWAPI_API_KEY}`);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching characters:', error);
      return [];
    }
  }

  function generateQuestion(character, characters) {
    const correctAnswer = character.name;
    const choices = [correctAnswer];
    const correctAnswerIndex = 0;

    while (choices.length < 4) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters[randomIndex].name;
      if (!choices.includes(randomCharacter)) {
        choices.push(randomCharacter);
      }
    }

    return {
      question: `What is the name of ${character.name}?`,
      choices: shuffleArray(choices),
      correctAnswerIndex: correctAnswerIndex
    };
  }

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function showResult(score) {
    quizContainer.innerHTML = `
      <h2>Quiz complete! Your final score is: ${score}/5</h2>
      <button id="restart-btn">Restart Quiz</button>
    `;
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
      startQuiz();
    });
  }
});
