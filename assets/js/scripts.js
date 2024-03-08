document.addEventListener("DOMContentLoaded", function () {
    const courseNameContainer = document.getElementById('course-name');
    const startBtn = document.getElementById('Start-btn');
    const nameEntryContainer = document.getElementById('nameEntryContainer');
    const usernameContainer = document.getElementById('username-container');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const timerContainer = document.getElementById('timer-container');

    // Function to get URL parameter by name
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    const selectedCourse = getParameterByName('course');
    if (selectedCourse) {
        courseNameContainer.innerHTML = `<h1 class="">"${selectedCourse.toUpperCase()} Course Quiz"</h1>`;
    }

    let currentQuestionIndex = 0;
    let userAnswers = [];
    let timer;
    let nextBtn;
    let username; 
    
    function showNameEntry() {
        nameEntryContainer.style.display = 'block';
    }

    function saveUsernameAndStartQuiz() {
        const usernameInput = document.getElementById('usernameInput');
         username = usernameInput.value.trim();
        if (username !== '') {
            usernameContainer.innerHTML = `<p class="username-card">Welcome, ${username}!</p>`;
            nameEntryContainer.style.display = 'none';
            startBtn.style.display = 'none';
            quizContainer.style.display = 'flex';
            startTimer();

            if (selectedCourse) {
                import(`./${selectedCourse}.js`).then(courseModule => {
                     questions = courseModule.default;
                     displayQuestion(questions[currentQuestionIndex]);
    
                }).catch(error => {
                    console.error(`Error importing ${selectedCourse}.js:`, error);
                });
            } else {
                console.warn('Please select a course before starting the quiz.');
            }            
        }
    }

    function startTimer() {
        let seconds = 0;
        timer = setInterval(function () {
            seconds++;
            // Update timer display
            timerContainer.innerHTML = `Time: ${seconds} seconds`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function handleNextClick() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');

        if (selectedOption) {
            userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
            currentQuestionIndex++;

            if (currentQuestionIndex >= questions.length) {
                    showResults();           
            } 
            else {
                    displayQuestion(questions[currentQuestionIndex]);
            }
        }
    }

    function displayQuestion(questionObj) {
        const optionsHTML = questionObj.options.map((option, index) => `<input type="radio" name="answer" 
            value="${index}">${option}`).join('<br>');
        quizContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center marr">
                <h3 class="mb-3">Question: ${questionObj.question}</h3>
                <form id="quiz-form" class="d-flex flex-column align-items-start">${optionsHTML}</form>
                <button id="nextBtn" class="btn btn-lg mt-5" style="background-color: rgba(209, 8, 166, 0.938); color: #FFF;">Next</button>
            </div>
        `;

        const nextBtn = document.getElementById('nextBtn');
        nextBtn.addEventListener('click', handleNextClick);
    }

    function showResults() {
        stopTimer();
        let correctCount = 0;
        let incorrectQuestions = [];

        questions.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                correctCount++;
            } else {
                incorrectQuestions.push(index + 1);
            }
        });

        const grade = calculateGrade(correctCount);

    if (nextBtn) {
        quizContainer.removeChild(nextBtn);
    }

    quizContainer.style.display = 'none';

        resultContainer.innerHTML = `
            <div class="card">
            <h1 class="card-header">Results</h1>
                <div class="card-body">
                    <p class="card-title">Name: ${username}</p>
                    <p class="card-text">Correct Answers: ${correctCount}</p>
                    <p class="card-text">Incorrect Questions: ${incorrectQuestions.join(', ')}</p>
                    <p class="card-text">Grade: ${grade}</p>
                    
                </div>
            </div>
            <button id="retry-btn" class="btn " style="background-color: rgba(209, 8, 166, 0.938); color: #FFF;">Try Again</button>
            <button id="home-btn" class="btn  mt-2" style="background-color: rgba(209, 8, 166, 0.938); color: #FFF;">Back to Home</button>
        `;

        document.getElementById('retry-btn').addEventListener('click', function () {
            window.location.reload();
         
            document.getElementById('home-btn').addEventListener('click', function () {
                window.location.href = 'index.html'; // Replace 'index.html' with your home page URL
            });    
        });
    }

    function calculateGrade(correctCount) {
        const percentage = (correctCount / questions.length) * 100;
        if (percentage >= 80) {
            return 'A+';
        } else if (percentage >= 60) {
            return 'B+';
        } else {
            return 'Fail';
        }
    }

    startBtn.addEventListener('click', showNameEntry);
    document.getElementById('saveUsernameBtn').addEventListener('click', saveUsernameAndStartQuiz);
    
});
