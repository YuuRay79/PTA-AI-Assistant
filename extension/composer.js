document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const views = {
        '题目库管理': document.getElementById('question-bank-view'),
        '手动组卷': document.getElementById('manual-composition-view'),
        '智能组卷': null,
        '试卷管理': document.getElementById('paper-management-view'),
        'welcome': document.getElementById('welcome-view')
    };

    // --- Modal Elements ---
    const modal = document.getElementById('create-question-modal');
    const createQuestionBtn = document.getElementById('create-question-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    const createQuestionForm = document.getElementById('create-question-form');

    // --- Manual Composition Elements ---
    const paperDetailsForm = document.getElementById('paper-details-form');
    const paperDetailsFormContainer = document.getElementById('paper-details-form-container');
    const compositionInterface = document.getElementById('composition-interface');
    const compositionQuestionList = document.getElementById('composition-question-list');
    const filterClass = document.getElementById('filter-class');
    const filterKnowledge = document.getElementById('filter-knowledge');
    const filterDifficulty = document.getElementById('filter-difficulty');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const finishCompositionBtn = document.getElementById('finish-composition-btn');

    // --- Paper Management Elements ---
    const paperListContainer = document.getElementById('paper-list-container');
    const paperDisplayView = document.getElementById('paper-display-view');
    const backToPaperListBtn = document.getElementById('back-to-paper-list-btn');

    // --- Question Bank Elements ---
    const deleteQuestionBtn = document.getElementById('delete-question-btn');
    const questionListContainer = document.getElementById('question-list');
    
    // --- Mock Data ---
    let questionBank = [
        {
            id: 1,
            stem: '有四个数字：1、2、3、4，能组成多少个互不相同且无重复数字的三位数？各是多少？',
            class: '基础语法',
            knowledge: '变量',
            difficulty: '简单',
            date: '2025/8/15'
        },
        {
            id: 2,
            stem: '“for”循环和“while”循环有什么区别？',
            class: '循环结构',
            knowledge: '循环',
            difficulty: '简单',
            date: '2025/8/16'
        }
    ];
    let papers = [];
    let currentPaper = { name: '', description: '', questionIds: [] };

    // --- Functions ---
    function switchView(viewName) {
        Object.values(views).forEach(view => {
            if (view) view.style.display = 'none';
        });
        if (views[viewName]) {
            views[viewName].style.display = 'block';
        }
    }

    function renderQuestionBank() {
        questionListContainer.innerHTML = ''; // Clear existing list
        questionBank.forEach(q => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question-item';
            questionElement.dataset.id = q.id;
            
            questionElement.innerHTML = `
                <div class="question-content">
                    <p>${q.stem}</p>
                    <div class="question-tags">
                        <span class="tag">课堂: ${q.class}</span>
                        <span class="tag">知识点: ${q.knowledge}</span>
                        <span class="tag">难度: ${q.difficulty}</span>
                        <span class="tag">日期: ${q.date}</span>
                    </div>
                </div>
                <input type="checkbox" class="question-checkbox">
            `;
            questionListContainer.appendChild(questionElement);
        });
    }

    function populateFilters() {
        const classes = [...new Set(questionBank.map(q => q.class))];
        const knowledges = [...new Set(questionBank.map(q => q.knowledge))];
        const difficulties = [...new Set(questionBank.map(q => q.difficulty))];

        filterClass.innerHTML = '<option value="">所有课堂</option>' + classes.map(c => `<option>${c}</option>`).join('');
        filterKnowledge.innerHTML = '<option value="">所有知识点</option>' + knowledges.map(k => `<option>${k}</option>`).join('');
        filterDifficulty.innerHTML = '<option value="">所有难度</option>' + difficulties.map(d => `<option>${d}</option>`).join('');
    }

    function renderCompositionQuestions() {
        compositionQuestionList.innerHTML = '';
        
        const filteredQuestions = questionBank.filter(q => {
            return (filterClass.value === '' || q.class === filterClass.value) &&
                   (filterKnowledge.value === '' || q.knowledge === filterKnowledge.value) &&
                   (filterDifficulty.value === '' || q.difficulty === filterDifficulty.value);
        });

        filteredQuestions.forEach(q => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question-item';
            questionElement.dataset.id = q.id;

            const selectedIndex = currentPaper.questionIds.indexOf(q.id);
            const checkboxHTML = `
                <div class="composition-checkbox ${selectedIndex !== -1 ? 'selected' : ''}" data-id="${q.id}">
                    ${selectedIndex !== -1 ? selectedIndex + 1 : ''}
                </div>
            `;
            
            questionElement.innerHTML = `
                <div class="question-content">
                     <p>${q.stem}</p>
                     <div class="question-tags">
                         <span class="tag">课堂: ${q.class}</span>
                         <span class="tag">知识点: ${q.knowledge}</span>
                         <span class="tag">难度: ${q.difficulty}</span>
                     </div>
                </div>
                ${checkboxHTML}
            `;
            compositionQuestionList.appendChild(questionElement);
        });
    }

    function renderPapers() {
        const paperList = document.getElementById('paper-list');
        paperList.innerHTML = '';
        papers.forEach(paper => {
            const paperElement = document.createElement('div');
            paperElement.className = 'paper-list-item';
            paperElement.dataset.id = paper.id;
            paperElement.innerHTML = `
                <h3>${paper.name}</h3>
                <p>${paper.description}</p>
            `;
            paperList.appendChild(paperElement);

            paperElement.addEventListener('click', () => {
                showPaperDetails(paper.id);
            });
        });
    }

    function showPaperDetails(paperId) {
        const paper = papers.find(p => p.id === paperId);
        if (!paper) return;

        document.getElementById('display-paper-name').textContent = paper.name;
        document.getElementById('display-paper-description').textContent = paper.description;
        const questionsContainer = document.getElementById('display-paper-questions');
        questionsContainer.innerHTML = '';

        paper.questionIds.forEach((qId, index) => {
            const question = questionBank.find(q => q.id === qId);
            if (question) {
                const questionElement = document.createElement('div');
                questionElement.className = 'question-item';
                questionElement.innerHTML = `
                    <div class="question-content">
                        <p><b>${index + 1}.</b> ${question.stem}</p>
                        <div class="question-tags">
                            <span class="tag">课堂: ${question.class}</span>
                            <span class="tag">知识点: ${question.knowledge}</span>
                            <span class="tag">难度: ${question.difficulty}</span>
                        </div>
                    </div>
                `;
                questionsContainer.appendChild(questionElement);
            }
        });

        paperListContainer.style.display = 'none';
        paperDisplayView.style.display = 'block';
    }
    
    function showModal() {
        modal.style.display = 'flex';
    }

    function hideModal() {
        modal.style.display = 'none';
        createQuestionForm.reset();
    }

    // --- Event Listeners ---
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const viewName = item.textContent;
            switchView(viewName);
            
            if (viewName === '题目库管理') {
                renderQuestionBank();
            } else if (viewName === '手动组卷') {
                paperDetailsFormContainer.style.display = 'block';
                compositionInterface.style.display = 'none';
                currentPaper = { name: '', description: '', questionIds: [] };
            } else if (viewName === '试卷管理') {
                paperListContainer.style.display = 'block';
                paperDisplayView.style.display = 'none';
                renderPapers();
            }
        });
    });

    createQuestionBtn.addEventListener('click', showModal);
    closeModalBtn.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    paperDetailsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPaper.name = document.getElementById('paper-name').value;
        currentPaper.description = document.getElementById('paper-description').value;
        
        paperDetailsFormContainer.style.display = 'none';
        compositionInterface.style.display = 'block';
        
        populateFilters();
        renderCompositionQuestions();
    });

    [filterClass, filterKnowledge, filterDifficulty].forEach(filter => {
        filter.addEventListener('change', renderCompositionQuestions);
    });

    resetFiltersBtn.addEventListener('click', () => {
        filterClass.value = '';
        filterKnowledge.value = '';
        filterDifficulty.value = '';
        renderCompositionQuestions();
    });
    
    compositionQuestionList.addEventListener('click', (e) => {
        if (e.target.classList.contains('composition-checkbox')) {
            const questionId = parseInt(e.target.dataset.id);
            const index = currentPaper.questionIds.indexOf(questionId);
            if (index === -1) {
                currentPaper.questionIds.push(questionId);
            } else {
                currentPaper.questionIds.splice(index, 1);
            }
            renderCompositionQuestions();
        }
    });

    finishCompositionBtn.addEventListener('click', () => {
        if (currentPaper.questionIds.length === 0) {
            alert('请至少选择一道题目。');
            return;
        }
        const newPaper = {
            id: Date.now(),
            name: currentPaper.name,
            description: currentPaper.description,
            questionIds: [...currentPaper.questionIds]
        };
        papers.push(newPaper);
        
        alert('试卷创建成功！');
        document.querySelector('.menu-item.active').classList.remove('active');
        menuItems.forEach(item => {
            if (item.textContent === '试卷管理') {
                item.classList.add('active');
            }
        });
        switchView('试卷管理');
        paperListContainer.style.display = 'block';
        paperDisplayView.style.display = 'none';
        renderPapers();
    });

    backToPaperListBtn.addEventListener('click', () => {
        paperListContainer.style.display = 'block';
        paperDisplayView.style.display = 'none';
    });

    createQuestionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newQuestion = {
            id: Date.now(), // Simple unique ID
            stem: document.getElementById('question-stem').value,
            class: document.getElementById('question-class').value,
            knowledge: document.getElementById('question-knowledge').value,
            difficulty: document.getElementById('question-difficulty').value,
            date: new Date().toLocaleDateString('zh-CN', { year:'numeric', month: 'numeric', day: 'numeric'})
        };
        
        questionBank.push(newQuestion);
        renderQuestionBank();
        hideModal();
    });

    deleteQuestionBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.question-checkbox:checked');
        const idsToDelete = Array.from(checkboxes).map(cb => {
            return parseInt(cb.closest('.question-item').dataset.id);
        });
        
        if (idsToDelete.length === 0) {
            alert('请先选择要删除的题目。');
            return;
        }

        questionBank = questionBank.filter(q => !idsToDelete.includes(q.id));
        renderQuestionBank();
    });

    // --- Initial State ---
    switchView('welcome');
    menuItems[0].classList.add('active'); // Set default active menu item
});
