(function() {
    // Ensure the script only runs once
    if (document.getElementById('ai-assistant-container')) {
        return;
    }

    // --- Create Main Elements ---
    const container = document.createElement('div');
    container.id = 'ai-assistant-container';
    document.body.appendChild(container);

    const fab = document.createElement('div');
    fab.id = 'ai-fab';
    fab.textContent = 'AI';
    container.appendChild(fab);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'ai-buttons-container';
    container.appendChild(buttonsContainer);

    let userRole = null;
    let areButtonsVisible = false;

    // --- Create Role Selection Buttons ---
    const roleSelectionWrapper = document.createElement('div');
    buttonsContainer.appendChild(roleSelectionWrapper);

    const teacherButton = document.createElement('button');
    teacherButton.className = 'ai-button';
    teacherButton.textContent = '我是教师';
    roleSelectionWrapper.appendChild(teacherButton);
    
    const studentButton = document.createElement('button');
    studentButton.className = 'ai-button';
    studentButton.textContent = '我是学生';
    roleSelectionWrapper.appendChild(studentButton);

    // --- Create Teacher-specific Buttons ---
    const teacherButtonsWrapper = document.createElement('div');
    buttonsContainer.appendChild(teacherButtonsWrapper);

    const smartComposeButton = document.createElement('button');
    smartComposeButton.className = 'ai-button';
    smartComposeButton.textContent = '智能组卷';
    teacherButtonsWrapper.appendChild(smartComposeButton);

    smartComposeButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({action: "openComposer"});
    });

    // --- Create Student-specific Buttons ---
    const studentButtonsWrapper = document.createElement('div');
    buttonsContainer.appendChild(studentButtonsWrapper);

    const wrongQuestionDiagButton = document.createElement('button');
    wrongQuestionDiagButton.className = 'ai-button';
    wrongQuestionDiagButton.textContent = '错题诊断';
    studentButtonsWrapper.appendChild(wrongQuestionDiagButton);
    
    // --- Create Switch Role Button ---
    const switchRoleButton = document.createElement('button');
    switchRoleButton.className = 'ai-switch-role-button';
    switchRoleButton.textContent = '切换身份';
    container.appendChild(switchRoleButton);

    // --- UI State Functions ---
    function updateSwitchButtonVisibility() {
        if (userRole && !areButtonsVisible) {
            switchRoleButton.style.display = 'block';
        } else {
            switchRoleButton.style.display = 'none';
        }
    }

    function showRoleSelection() {
        teacherButton.style.display = 'block';
        studentButton.style.display = 'block';
        areButtonsVisible = true;
        updateSwitchButtonVisibility();
    }

    function showTeacherButtons() {
        smartComposeButton.style.display = 'block';
        areButtonsVisible = true;
        updateSwitchButtonVisibility();
    }

    function showStudentButtons() {
        wrongQuestionDiagButton.style.display = 'block';
        areButtonsVisible = true;
        updateSwitchButtonVisibility();
    }

    function hideAllButtons() {
        teacherButton.style.display = 'none';
        studentButton.style.display = 'none';
        smartComposeButton.style.display = 'none';
        wrongQuestionDiagButton.style.display = 'none';
        areButtonsVisible = false;
        updateSwitchButtonVisibility();
    }
    
    // Hide all buttons initially
    hideAllButtons();

    // --- Load User Role ---
    chrome.storage.sync.get(['userRole'], function(result) {
        userRole = result.userRole;
        updateSwitchButtonVisibility();
    });

    // --- Event Listeners for Buttons ---
    teacherButton.addEventListener('click', () => {
        userRole = 'teacher';
        chrome.storage.sync.set({userRole: 'teacher'}, () => {
            console.log('User role set to teacher.');
            hideAllButtons();
        });
    });

    studentButton.addEventListener('click', () => {
        userRole = 'student';
        chrome.storage.sync.set({userRole: 'student'}, () => {
            console.log('User role set to student.');
            hideAllButtons();
        });
    });

    switchRoleButton.addEventListener('click', () => {
        if (userRole === 'teacher') {
            userRole = 'student';
        } else if (userRole === 'student') {
            userRole = 'teacher';
        } else {
            return; // No role set, do nothing.
        }
        chrome.storage.sync.set({userRole: userRole}, () => {
            console.log(`User role switched to ${userRole}.`);
        });
    });

    // --- Drag and Click Logic for FAB ---
    let isDragging = false;
    let hasDragged = false;
    let startPos = { x: 0, y: 0 };
    let startOffset = { x: 0, y: 0 };

    fab.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasDragged = false;
        fab.style.cursor = 'grabbing';

        startPos = { x: e.clientX, y: e.clientY };
        
        const rect = container.getBoundingClientRect();
        if (container.style.right && container.style.bottom) {
             // Initial position is set by right/bottom, convert to left/top
            startOffset.x = rect.left;
            startOffset.y = rect.top;
            container.style.right = 'auto';
            container.style.bottom = 'auto';
        } else {
            startOffset.x = container.offsetLeft;
            startOffset.y = container.offsetTop;
        }

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasDragged = true;
        }
        
        let newX = startOffset.x + dx;
        let newY = startOffset.y + dy;
        
        const containerRect = container.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, window.innerWidth - containerRect.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - containerRect.height));

        container.style.left = `${newX}px`;
        container.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        fab.style.cursor = 'grab';

        // --- Click Logic ---
        if (!hasDragged) {
            if (areButtonsVisible) {
                hideAllButtons();
            } else {
                if (!userRole) {
                    showRoleSelection();
                } else if (userRole === 'teacher') {
                    showTeacherButtons();
                } else if (userRole === 'student') {
                    showStudentButtons();
                }
            }
        }
    });

})();
