class FrenchMasteryApp {
    constructor() {
        this.currentView = 'dashboard';
        this.stats = this.loadStats();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.renderView(this.currentView);
    }

    loadStats() {
        const saved = localStorage.getItem('frenchMasteryStats');
        return saved ? JSON.parse(saved) : {
            xp: 0, streak: 0, lastPractice: null,
            verbsStudied: {}, vocabStudied: {}, grammarStudied: {},
            quizResults: [], totalPracticed: 0, correctAnswers: 0
        };
    }

    saveStats() {
        localStorage.setItem('frenchMasteryStats', JSON.stringify(this.stats));
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.renderView(item.dataset.view);
            });
        });
    }

    renderView(view) {
        this.currentView = view;
        const main = document.getElementById('mainContent');
        switch(view) {
            case 'dashboard': main.innerHTML = this.renderDashboard(); break;
            case 'verbs': main.innerHTML = this.renderVerbs(); this.setupVerbsView(); break;
            case 'vocab': main.innerHTML = this.renderVocab(); this.setupVocabView(); break;
            case 'grammar': main.innerHTML = this.renderGrammar(); break;
            case 'practice': main.innerHTML = this.renderPractice(); break;
            case 'stats': main.innerHTML = this.renderStats(); break;
        }
    }

    calculateLevel() {
        const xp = this.stats.xp;
        if (xp < 100) return 'A1';
        if (xp < 300) return 'A2';
        if (xp < 600) return 'B1';
        if (xp < 1000) return 'B2';
        if (xp < 1500) return 'C1';
        return 'C2';
    }

    renderDashboard() {
        const level = this.calculateLevel();
        const verbCount = typeof FRENCH_VERBS !== 'undefined' ? FRENCH_VERBS.length : 0;
        const vocabCount = typeof getVocabularyCount === 'function' ? getVocabularyCount() : 0;
        const grammarCount = typeof FRENCH_GRAMMAR !== 'undefined' ? FRENCH_GRAMMAR.length : 0;
        const connectivesCount = typeof getConnectivesCount === 'function' ? getConnectivesCount() : 0;
        const phrasesCount = typeof getPhrasesCount === 'function' ? getPhrasesCount() : 0;

        return `
            <div class="view active">
                <header class="view-header">
                    <div>
                        <h1 class="view-title">French Mastery</h1>
                        <p class="view-subtitle">Bienvenue! Let's learn French</p>
                    </div>
                    <div class="level-badge">${level}</div>
                </header>

                <div class="stats-row">
                    <div class="stat-card"><div class="stat-value">${this.stats.xp}</div><div class="stat-label">XP</div></div>
                    <div class="stat-card"><div class="stat-value">${this.stats.streak}</div><div class="stat-label">Streak</div></div>
                    <div class="stat-card"><div class="stat-value">${this.stats.totalPracticed}</div><div class="stat-label">Practiced</div></div>
                </div>

                <h2 class="section-title">Learn</h2>
                <div class="category-grid">
                    <div class="category-card" onclick="app.navigateTo('verbs')">
                        <div class="category-icon">🔄</div>
                        <div class="category-name">Verbs</div>
                        <div class="category-count">${verbCount} verbs</div>
                    </div>
                    <div class="category-card" onclick="app.navigateTo('vocab')">
                        <div class="category-icon">📚</div>
                        <div class="category-name">Vocabulary</div>
                        <div class="category-count">${vocabCount} words</div>
                    </div>
                    <div class="category-card" onclick="app.navigateTo('grammar')">
                        <div class="category-icon">📖</div>
                        <div class="category-name">Grammar</div>
                        <div class="category-count">${grammarCount} topics</div>
                    </div>
                    <div class="category-card" onclick="app.showConnectives()">
                        <div class="category-icon">🔗</div>
                        <div class="category-name">Connectives</div>
                        <div class="category-count">${connectivesCount} words</div>
                    </div>
                    <div class="category-card" onclick="app.showPhrases()">
                        <div class="category-icon">💬</div>
                        <div class="category-name">Phrases</div>
                        <div class="category-count">${phrasesCount} phrases</div>
                    </div>
                    <div class="category-card" onclick="app.showPronunciation()">
                        <div class="category-icon">🗣️</div>
                        <div class="category-name">Pronunciation</div>
                        <div class="category-count">Sound guide</div>
                    </div>
                </div>

                <h2 class="section-title mt-xl">Quick Practice</h2>
                <div class="practice-buttons">
                    <button class="btn btn-primary" onclick="app.startVerbQuiz()">🔄 Verb Quiz</button>
                    <button class="btn btn-secondary" onclick="app.startVocabQuiz()">📚 Vocab Quiz</button>
                    <button class="btn btn-secondary" onclick="app.startFlashcards()">🎴 Flashcards</button>
                </div>
            </div>
        `;
    }

    navigateTo(view) {
        const navItem = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (navItem) {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            navItem.classList.add('active');
            this.renderView(view);
        }
    }

    renderVerbs() {
        if (typeof FRENCH_VERBS === 'undefined') return '<div class="view active"><p>Loading...</p></div>';
        return `
            <div class="view active">
                <header class="view-header">
                    <h1 class="view-title">Verbs</h1>
                    <p class="view-subtitle">${FRENCH_VERBS.length} verbs</p>
                </header>
                <div class="search-box">
                    <input type="text" id="verbSearch" placeholder="Search verbs..." class="search-input">
                </div>
                <div class="filter-chips">
                    <button class="filter-chip active" data-filter="all">All</button>
                    <button class="filter-chip" data-filter="irregular">Irregular</button>
                    <button class="filter-chip" data-filter="er">-ER</button>
                    <button class="filter-chip" data-filter="ir">-IR</button>
                    <button class="filter-chip" data-filter="re">-RE</button>
                </div>
                <div class="card-list" id="verbList">
                    ${FRENCH_VERBS.map(v => `
                        <div class="list-card" data-group="${v.group}" onclick="app.showVerbDetail('${v.infinitive}')">
                            <div class="list-card-main">
                                <div class="list-card-title">${v.infinitive}</div>
                                <div class="list-card-subtitle">${v.translation}</div>
                            </div>
                            <span class="tag">${v.group}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupVerbsView() {
        const search = document.getElementById('verbSearch');
        if (search) {
            search.addEventListener('input', e => {
                const q = e.target.value.toLowerCase();
                document.querySelectorAll('#verbList .list-card').forEach(c => {
                    c.style.display = c.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
                });
            });
        }
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const f = chip.dataset.filter;
                document.querySelectorAll('#verbList .list-card').forEach(c => {
                    c.style.display = (f === 'all' || c.dataset.group === f) ? 'flex' : 'none';
                });
            });
        });
    }

    showVerbDetail(infinitive) {
        const verb = FRENCH_VERBS.find(v => v.infinitive === infinitive);
        if (!verb) return;
        this.stats.verbsStudied[infinitive] = true;
        this.saveStats();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div><h2 class="modal-title">${verb.infinitive}</h2><p class="text-muted">${verb.translation}</p></div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="tabs">
                        <button class="tab active" data-tense="present">Present</button>
                        <button class="tab" data-tense="passeCompose">Passé C.</button>
                        <button class="tab" data-tense="imparfait">Imparfait</button>
                        <button class="tab" data-tense="futur">Futur</button>
                    </div>
                    <div id="conjugationTable">${this.renderConjugation(verb, 'present')}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('conjugationTable').innerHTML = this.renderConjugation(verb, tab.dataset.tense);
            });
        });
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    renderConjugation(verb, tense) {
        const c = verb[tense];
        if (!c) return '<p class="text-muted">Not available</p>';
        const pronouns = [['je', c.je], ['tu', c.tu], ['il/elle', c.il], ['nous', c.nous], ['vous', c.vous], ['ils/elles', c.ils]];
        return `<table class="conjugation-table"><tbody>${pronouns.map(([p, f]) => `<tr><td class="pronoun">${p}</td><td class="form">${f || '-'}</td></tr>`).join('')}</tbody></table>`;
    }

    renderVocab() {
        if (typeof FRENCH_VOCABULARY === 'undefined') return '<div class="view active"><p>Loading...</p></div>';
        const cats = Object.keys(FRENCH_VOCABULARY);
        return `
            <div class="view active">
                <header class="view-header">
                    <h1 class="view-title">Vocabulary</h1>
                    <p class="view-subtitle">${typeof getVocabularyCount === 'function' ? getVocabularyCount() : 0} words</p>
                </header>
                <div class="search-box">
                    <input type="text" id="vocabSearch" placeholder="Search words..." class="search-input">
                </div>
                <div class="category-grid" id="vocabCategories">
                    ${cats.map(k => {
                        const cat = FRENCH_VOCABULARY[k];
                        return `<div class="category-card" onclick="app.showVocabCategory('${k}')">
                            <div class="category-icon">${cat.icon}</div>
                            <div class="category-name">${cat.name}</div>
                            <div class="category-count">${cat.words.length} words</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    setupVocabView() {
        const search = document.getElementById('vocabSearch');
        if (search) {
            search.addEventListener('input', e => {
                const q = e.target.value.toLowerCase();
                if (q.length >= 2) this.showVocabSearch(q);
                else this.renderView('vocab');
            });
        }
    }

    showVocabSearch(query) {
        const all = typeof getAllVocabulary === 'function' ? getAllVocabulary() : [];
        const results = all.filter(w => w.french.toLowerCase().includes(query) || w.english.toLowerCase().includes(query)).slice(0, 50);
        document.getElementById('vocabCategories').innerHTML = `
            <div class="card-list" style="grid-column:1/-1;">
                ${results.length ? results.map(w => `
                    <div class="list-card" onclick="app.speakWord('${w.french.replace(/'/g, "\\'")}')">
                        <div class="list-card-main">
                            <div class="list-card-title">${w.french}</div>
                            <div class="list-card-subtitle">${w.english}</div>
                        </div>
                        <span class="text-muted">🔊</span>
                    </div>
                `).join('') : '<p class="text-muted">No results</p>'}
            </div>
        `;
    }

    showVocabCategory(key) {
        const cat = FRENCH_VOCABULARY[key];
        if (!cat) return;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div><h2 class="modal-title">${cat.icon} ${cat.name}</h2><p class="text-muted">${cat.words.length} words</p></div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body" style="max-height:60vh;overflow-y:auto;">
                    <div class="card-list">
                        ${cat.words.map(w => `
                            <div class="list-card" onclick="app.speakWord('${w.french.replace(/'/g, "\\'")}')">
                                <div class="list-card-main">
                                    <div class="list-card-title">${w.french}</div>
                                    <div class="list-card-subtitle">${w.english}</div>
                                    ${w.phonetic ? `<div class="phonetic">[${w.phonetic}]</div>` : ''}
                                </div>
                                <span class="text-muted">🔊</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    speakWord(text) {
        if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'fr-FR';
            u.rate = 0.8;
            speechSynthesis.speak(u);
        }
    }

    renderGrammar() {
        if (typeof FRENCH_GRAMMAR === 'undefined') return '<div class="view active"><p>Loading...</p></div>';
        return `
            <div class="view active">
                <header class="view-header"><h1 class="view-title">Grammar</h1></header>
                <div class="card-list">
                    ${FRENCH_GRAMMAR.map((t, i) => `
                        <div class="list-card" onclick="app.showGrammarTopic(${i})">
                            <div class="list-card-main">
                                <div class="list-card-title">${t.title}</div>
                            </div>
                            <span class="tag">${t.level || 'All'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showGrammarTopic(index) {
        const topic = FRENCH_GRAMMAR[index];
        if (!topic) return;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal" style="max-width:700px;">
                <div class="modal-header">
                    <div><h2 class="modal-title">${topic.title}</h2><span class="tag">${topic.level || 'All'}</span></div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
                    ${topic.content ? `<p class="mb-lg">${topic.content}</p>` : ''}
                    ${topic.sections ? topic.sections.map(s => `
                        <div class="grammar-section">
                            <h3>${s.title}</h3>
                            ${s.rules ? s.rules.map(r => `
                                <div class="grammar-rule">
                                    <p><strong>${r.rule}</strong></p>
                                    ${r.examples ? r.examples.map(ex => `
                                        <div class="grammar-example">
                                            <div class="french">${ex.french}</div>
                                            <div class="english">${ex.english}</div>
                                        </div>
                                    `).join('') : ''}
                                </div>
                            `).join('') : ''}
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    renderPractice() {
        return `
            <div class="view active">
                <header class="view-header"><h1 class="view-title">Practice</h1></header>
                <div class="practice-grid">
                    <div class="practice-card" onclick="app.startVerbQuiz()"><div class="practice-icon">🔄</div><div class="practice-title">Verb Quiz</div></div>
                    <div class="practice-card" onclick="app.startVocabQuiz()"><div class="practice-icon">📚</div><div class="practice-title">Vocab Quiz</div></div>
                    <div class="practice-card" onclick="app.startFlashcards()"><div class="practice-icon">🎴</div><div class="practice-title">Flashcards</div></div>
                    <div class="practice-card" onclick="app.startMixedReview()"><div class="practice-icon">🎲</div><div class="practice-title">Mixed</div></div>
                </div>
            </div>
        `;
    }

    startVerbQuiz() {
        if (typeof FRENCH_VERBS === 'undefined') return;
        const questions = [];
        const pronouns = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
        const keys = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
        const tenses = ['present', 'imparfait', 'futur'];
        for (let i = 0; i < 10; i++) {
            const v = FRENCH_VERBS[Math.floor(Math.random() * FRENCH_VERBS.length)];
            const t = tenses[Math.floor(Math.random() * tenses.length)];
            const p = Math.floor(Math.random() * 6);
            if (v[t] && v[t][keys[p]]) {
                const correct = v[t][keys[p]];
                const options = [correct];
                while (options.length < 4) {
                    const wv = FRENCH_VERBS[Math.floor(Math.random() * FRENCH_VERBS.length)];
                    if (wv[t] && wv[t][keys[p]] && !options.includes(wv[t][keys[p]])) options.push(wv[t][keys[p]]);
                }
                questions.push({ question: `${v.infinitive} (${t}) - ${pronouns[p]}`, correct, options: options.sort(() => Math.random() - 0.5) });
            }
        }
        if (questions.length) this.runQuiz(questions, 'Verb Quiz');
    }

    startVocabQuiz() {
        if (typeof getAllVocabulary !== 'function') return;
        const all = getAllVocabulary();
        const questions = [];
        const dir = Math.random() > 0.5;
        for (let i = 0; i < 10; i++) {
            const w = all[Math.floor(Math.random() * all.length)];
            const options = [dir ? w.english : w.french];
            while (options.length < 4) {
                const wrong = all[Math.floor(Math.random() * all.length)];
                const o = dir ? wrong.english : wrong.french;
                if (!options.includes(o)) options.push(o);
            }
            questions.push({ question: dir ? w.french : w.english, correct: dir ? w.english : w.french, options: options.sort(() => Math.random() - 0.5) });
        }
        this.runQuiz(questions, 'Vocabulary Quiz');
    }

    runQuiz(questions, title) {
        let current = 0, score = 0;
        const show = () => {
            if (current >= questions.length) { this.finishQuiz(score, questions.length, title); return; }
            const q = questions[current];
            let modal = document.querySelector('.modal-overlay');
            if (!modal) { modal = document.createElement('div'); document.body.appendChild(modal); }
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <div><h2 class="modal-title">${title}</h2><p class="text-muted">${current + 1}/${questions.length}</p></div>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${(current/questions.length)*100}%"></div></div>
                        <div class="quiz-question">${q.question}</div>
                        <div class="quiz-options">${q.options.map(o => `<button class="quiz-option" data-answer="${o}">${o}</button>`).join('')}</div>
                    </div>
                </div>
            `;
            modal.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const isCorrect = btn.dataset.answer === q.correct;
                    btn.classList.add(isCorrect ? 'correct' : 'incorrect');
                    if (!isCorrect) modal.querySelector(`[data-answer="${q.correct}"]`).classList.add('correct');
                    if (isCorrect) score++;
                    modal.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
                    setTimeout(() => { current++; show(); }, 1000);
                });
            });
        };
        show();
    }

    finishQuiz(score, total, title) {
        const pct = Math.round((score/total)*100);
        const xp = score * 10;
        this.stats.xp += xp;
        this.stats.totalPracticed += total;
        this.stats.correctAnswers += score;
        this.stats.lastPractice = new Date().toDateString();
        this.saveStats();
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header"><h2 class="modal-title">Complete!</h2><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
                    <div class="modal-body text-center">
                        <div class="quiz-result-score">${pct}%</div>
                        <p>${score}/${total} correct</p>
                        <p class="text-muted">+${xp} XP</p>
                        <button class="btn btn-primary mt-lg" onclick="this.closest('.modal-overlay').remove()">Continue</button>
                    </div>
                </div>
            `;
        }
    }

    startFlashcards() {
        if (typeof getAllVocabulary !== 'function') return;
        const cards = getAllVocabulary().sort(() => Math.random() - 0.5).slice(0, 20);
        let current = 0, known = 0;
        const show = () => {
            if (current >= cards.length) { this.finishFlashcards(known, cards.length); return; }
            const c = cards[current];
            let modal = document.querySelector('.modal-overlay');
            if (!modal) { modal = document.createElement('div'); document.body.appendChild(modal); }
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <div><h2 class="modal-title">Flashcards</h2><p class="text-muted">${current+1}/${cards.length}</p></div>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="flashcard" onclick="this.classList.toggle('flipped')">
                            <div class="flashcard-inner">
                                <div class="flashcard-front"><div class="flashcard-word">${c.french}</div><div class="text-muted">Tap to flip</div></div>
                                <div class="flashcard-back"><div class="flashcard-word">${c.english}</div></div>
                            </div>
                        </div>
                        <div class="flashcard-buttons mt-lg">
                            <button class="btn btn-secondary" onclick="app.fcNext(false)">❌ Learning</button>
                            <button class="btn btn-primary" onclick="app.fcNext(true)">✓ Knew it</button>
                        </div>
                    </div>
                </div>
            `;
        };
        this.fcState = { cards, current, known, show };
        show();
    }

    fcNext(knew) { if (knew) this.fcState.known++; this.fcState.current++; this.fcState.show(); }

    finishFlashcards(known, total) {
        const xp = known * 5;
        this.stats.xp += xp;
        this.stats.totalPracticed += total;
        this.saveStats();
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header"><h2 class="modal-title">Complete!</h2><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
                    <div class="modal-body text-center">
                        <div class="quiz-result-score">${known}/${total}</div>
                        <p>Words you knew</p>
                        <p class="text-muted">+${xp} XP</p>
                        <button class="btn btn-primary mt-lg" onclick="this.closest('.modal-overlay').remove()">Continue</button>
                    </div>
                </div>
            `;
        }
    }

    startMixedReview() { Math.random() > 0.5 ? this.startVerbQuiz() : this.startVocabQuiz(); }

    showConnectives() {
        if (typeof FRENCH_CONNECTIVES === 'undefined') return;
        const cats = Object.keys(FRENCH_CONNECTIVES);
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal" style="max-width:700px;">
                <div class="modal-header"><div><h2 class="modal-title">🔗 Connectives</h2></div><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
                <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
                    <div class="tabs" style="flex-wrap:wrap;">${cats.map((k,i) => `<button class="tab ${i===0?'active':''}" data-cat="${k}">${FRENCH_CONNECTIVES[k].name}</button>`).join('')}</div>
                    <div id="connContent">${this.renderConnCat(cats[0])}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
            modal.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            document.getElementById('connContent').innerHTML = this.renderConnCat(t.dataset.cat);
        }));
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    renderConnCat(key) {
        const c = FRENCH_CONNECTIVES[key];
        return `<div class="card-list mt-lg">${c.words.map(w => `
            <div class="list-card">
                <div class="list-card-main">
                    <div class="list-card-title">${w.word}</div>
                    <div class="list-card-subtitle">${w.translation}</div>
                    <div class="grammar-example mt-sm"><div class="french">${w.example}</div><div class="english">${w.exampleTranslation}</div></div>
                </div>
            </div>
        `).join('')}</div>`;
    }

    showPhrases() {
        if (typeof FRENCH_PHRASES === 'undefined') return;
        const cats = Object.keys(FRENCH_PHRASES);
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal" style="max-width:700px;">
                <div class="modal-header"><div><h2 class="modal-title">💬 Phrases</h2></div><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
                <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
                    <div class="tabs" style="flex-wrap:wrap;">${cats.map((k,i) => `<button class="tab ${i===0?'active':''}" data-cat="${k}">${FRENCH_PHRASES[k].icon} ${FRENCH_PHRASES[k].name}</button>`).join('')}</div>
                    <div id="phraseContent">${this.renderPhraseCat(cats[0])}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
            modal.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            document.getElementById('phraseContent').innerHTML = this.renderPhraseCat(t.dataset.cat);
        }));
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    renderPhraseCat(key) {
        const c = FRENCH_PHRASES[key];
        return `<div class="card-list mt-lg">${c.phrases.map(p => `
            <div class="list-card" onclick="app.speakWord('${p.french.replace(/'/g, "\\'")}')">
                <div class="list-card-main">
                    <div class="list-card-title">${p.french}</div>
                    <div class="list-card-subtitle">${p.english}</div>
                </div>
                <span class="text-muted">🔊</span>
            </div>
        `).join('')}</div>`;
    }

    showPronunciation() {
        if (typeof PRONUNCIATION_GUIDE === 'undefined') return;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal" style="max-width:700px;">
                <div class="modal-header"><div><h2 class="modal-title">🗣️ Pronunciation</h2></div><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
                <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
                    <div class="tabs">
                        <button class="tab active" data-s="vowels">Vowels</button>
                        <button class="tab" data-s="consonants">Consonants</button>
                        <button class="tab" data-s="nasal">Nasal</button>
                        <button class="tab" data-s="rules">Rules</button>
                    </div>
                    <div id="pronContent">${this.renderPronSec('vowels')}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
            modal.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            document.getElementById('pronContent').innerHTML = this.renderPronSec(t.dataset.s);
        }));
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    renderPronSec(sec) {
        if (sec === 'rules') return `<div class="card-list mt-lg">${PRONUNCIATION_GUIDE.rules.map(r => `<div class="card"><h4 style="color:var(--accent-primary)">${r.rule}</h4><p class="text-muted">${r.explanation}</p></div>`).join('')}</div>`;
        const d = PRONUNCIATION_GUIDE[sec] || [];
        return `<table class="conjugation-table mt-lg"><thead><tr><th>Letter</th><th>Sound</th><th>Example</th></tr></thead><tbody>${d.map(i => `<tr><td><strong>${i.letter}</strong></td><td style="color:var(--accent-primary)">${i.sound}</td><td class="text-muted">${i.example}</td></tr>`).join('')}</tbody></table>`;
    }

    renderStats() {
        const level = this.calculateLevel();
        const acc = this.stats.totalPracticed > 0 ? Math.round((this.stats.correctAnswers / this.stats.totalPracticed) * 100) : 0;
        return `
            <div class="view active">
                <header class="view-header"><h1 class="view-title">Statistics</h1></header>
                <div class="stats-grid">
                    <div class="stat-card-large"><div class="stat-value">${this.stats.xp}</div><div class="stat-label">XP</div></div>
                    <div class="stat-card-large"><div class="stat-value">${this.stats.streak}</div><div class="stat-label">Streak</div></div>
                    <div class="stat-card-large"><div class="stat-value">${acc}%</div><div class="stat-label">Accuracy</div></div>
                    <div class="stat-card-large"><div class="stat-value">${level}</div><div class="stat-label">Level</div></div>
                </div>
                <div class="card mt-xl">
                    <div class="progress-item"><span>Verbs Studied</span><span>${Object.keys(this.stats.verbsStudied).length}</span></div>
                    <div class="progress-item"><span>Total Practiced</span><span>${this.stats.totalPracticed}</span></div>
                    <div class="progress-item"><span>Correct Answers</span><span>${this.stats.correctAnswers}</span></div>
                </div>
                <div class="mt-xl text-center">
                    <button class="btn btn-ghost" onclick="if(confirm('Reset?')){localStorage.removeItem('frenchMasteryStats');location.reload();}">Reset Progress</button>
                </div>
            </div>
        `;
    }

    showToast(msg, type='info') {
        const t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 24px;border-radius:8px;z-index:10000;';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new FrenchMasteryApp(); });
