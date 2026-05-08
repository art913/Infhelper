document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    hljs.highlightAll();
});

// ── Theme Toggle ────────────────────────────────────────────────────

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle) return;

    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-bs-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (icon) {
            icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        }
    }
}

// ── Practice: Check Answer ──────────────────────────────────────────

function checkAnswer(taskId, problemIdx, btnEl) {
    const card = btnEl.closest('.problem-card');
    const input = card.querySelector('.answer-input');
    const answer = input.value.trim();
    if (!answer) {
        input.classList.add('is-invalid');
        return;
    }
    input.classList.remove('is-invalid');
    btnEl.disabled = true;
    btnEl.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, problem_idx: problemIdx, answer })
    })
    .then(r => r.json())
    .then(data => {
        const resultDiv = card.querySelector('.result-area');
        if (data.correct) {
            card.classList.add('correct');
            resultDiv.innerHTML = `
                <div class="result-badge correct mt-3">
                    <i class="bi bi-check-circle-fill"></i> Верно!
                </div>`;
        } else {
            card.classList.add('incorrect');
            resultDiv.innerHTML = `
                <div class="result-badge incorrect mt-3">
                    <i class="bi bi-x-circle-fill"></i> Неверно. Правильный ответ: <strong>${data.expected}</strong>
                </div>`;
        }
        if (data.explanation) {
            resultDiv.innerHTML += `
                <div class="mt-3 p-3 rounded" style="background: var(--bs-tertiary-bg);">
                    <strong>Решение:</strong><br>
                    <span class="whitespace-pre-wrap">${data.explanation}</span>
                </div>`;
        }
        input.readOnly = true;
        btnEl.style.display = 'none';
    })
    .catch(() => {
        btnEl.disabled = false;
        btnEl.textContent = 'Проверить';
    });
}

// ── Test Session ────────────────────────────────────────────────────

function initTestSession(testData) {
    const timerEl = document.getElementById('timerDisplay');
    const navContainer = document.getElementById('questionNav');
    const submitBtn = document.getElementById('submitTest');
    const answers = {};
    let totalSeconds = testData.time_minutes * 60;
    let finished = false;

    const timer = setInterval(() => {
        if (finished) return;
        totalSeconds--;
        updateTimerDisplay();
        if (totalSeconds <= 0) {
            clearInterval(timer);
            finishTest();
        }
    }, 1000);

    updateTimerDisplay();

    document.querySelectorAll('.question-input').forEach(input => {
        input.addEventListener('input', () => {
            const qNum = parseInt(input.dataset.question);
            const val = input.value.trim();
            if (val) {
                answers[qNum] = val;
                document.querySelector(`.question-nav-btn[data-q="${qNum}"]`)?.classList.add('answered');
                input.closest('.question-card')?.classList.add('answered');
            } else {
                delete answers[qNum];
                document.querySelector(`.question-nav-btn[data-q="${qNum}"]`)?.classList.remove('answered');
                input.closest('.question-card')?.classList.remove('answered');
            }
            updateProgress();
        });
    });

    document.querySelectorAll('.question-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const qNum = btn.dataset.q;
            document.getElementById('question-' + qNum)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    submitBtn.addEventListener('click', () => {
        const answered = Object.keys(answers).length;
        const total = testData.questions.length;
        if (answered < total) {
            if (!confirm(`Вы ответили на ${answered} из ${total} вопросов. Завершить тест?`)) return;
        }
        finishTest();
    });

    function updateTimerDisplay() {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        timerEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

        timerEl.classList.remove('warning', 'danger');
        if (totalSeconds <= 300) timerEl.classList.add('danger');
        else if (totalSeconds <= 1800) timerEl.classList.add('warning');
    }

    function pad(n) { return n.toString().padStart(2, '0'); }

    function updateProgress() {
        const count = Object.keys(answers).length;
        const total = testData.questions.length;
        const pct = Math.round((count / total) * 100);
        const bar = document.getElementById('progressBar');
        if (bar) {
            bar.style.width = pct + '%';
            bar.textContent = `${count}/${total}`;
        }
    }

    function finishTest() {
        if (finished) return;
        finished = true;
        clearInterval(timer);

        let score = 0;
        let maxScore = 0;

        testData.questions.forEach(q => {
            maxScore += q.max_score;
            const card = document.getElementById('question-' + q.number);
            const input = card?.querySelector('.question-input');
            const resultDiv = card?.querySelector('.question-result');
            const navBtn = document.querySelector(`.question-nav-btn[data-q="${q.number}"]`);

            const userAnswer = (answers[q.number] || '').trim();
            const correct = String(q.answer).trim();
            const isCorrect = userAnswer === correct;

            if (input) input.readOnly = true;

            if (isCorrect) {
                score += q.max_score;
                card?.classList.add('result-correct');
                card?.classList.remove('answered', 'result-incorrect');
                navBtn?.classList.add('result-correct');
                navBtn?.classList.remove('answered', 'result-incorrect');
                if (resultDiv) resultDiv.innerHTML = `<span class="result-badge correct"><i class="bi bi-check-circle-fill"></i> Верно (+${q.max_score})</span>`;
            } else {
                card?.classList.add('result-incorrect');
                card?.classList.remove('answered', 'result-correct');
                navBtn?.classList.add('result-incorrect');
                navBtn?.classList.remove('answered', 'result-correct');
                if (resultDiv) resultDiv.innerHTML = `<span class="result-badge incorrect"><i class="bi bi-x-circle-fill"></i> Неверно. Ваш ответ: ${userAnswer || '—'} | Правильный: ${correct}</span>`;
            }
        });

        submitBtn.style.display = 'none';
        document.getElementById('testResults').style.display = 'block';
        document.getElementById('scoreValue').textContent = score;
        document.getElementById('scoreMax').textContent = `из ${maxScore}`;

        const pct = Math.round((score / maxScore) * 100);
        document.getElementById('scorePercent').textContent = `${pct}%`;

        let grade = '';
        if (pct >= 85) grade = 'Отлично!';
        else if (pct >= 65) grade = 'Хорошо';
        else if (pct >= 40) grade = 'Удовлетворительно';
        else grade = 'Нужно подтянуть';
        document.getElementById('scoreGrade').textContent = grade;
    }
}
