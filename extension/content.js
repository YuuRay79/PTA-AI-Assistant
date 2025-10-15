(function () {
  if (document.getElementById('ai-assistant-container')) {
    return;
  }

  // 创建主容器和机器人FAB
  const container = document.createElement('div');
  container.id = 'ai-assistant-container';
  document.body.appendChild(container);

  const fab = document.createElement('div');
  fab.id = 'ai-fab';
  fab.innerHTML = `
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="26" fill="url(#fabGradient)"/>
      <defs>
        <linearGradient id="fabGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFB6D9"/>
          <stop offset="100%" style="stop-color:#FFA6C9"/>
        </linearGradient>
      </defs>
      <rect x="16" y="20" width="24" height="20" rx="3" fill="white" opacity="0.9"/>
      <circle cx="22" cy="28" r="2" fill="#FFA6C9"/>
      <circle cx="34" cy="28" r="2" fill="#FFA6C9"/>
      <path d="M22 34 Q28 36 34 34" stroke="#FFA6C9" stroke-width="2" fill="none"/>
      <line x1="28" y1="20" x2="28" y2="14" stroke="white" stroke-width="2"/>
      <circle cx="28" cy="12" r="2" fill="white"/>
    </svg>
  `;
  container.appendChild(fab);

  const dialogContainer = document.createElement('div');
  dialogContainer.id = 'robot-dialog-bubble';
  dialogContainer.className = 'robot-dialog-bubble';
  container.appendChild(dialogContainer);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'ai-buttons-container';
  container.appendChild(buttonsContainer);

  let userRole = null;
  let areButtonsVisible = false;

  // 创建身份选择按钮
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

  // 创建教师功能按钮
  const teacherButtonsWrapper = document.createElement('div');
  buttonsContainer.appendChild(teacherButtonsWrapper);

  const smartComposeButton = document.createElement('button');
  smartComposeButton.className = 'ai-button';
  smartComposeButton.textContent = '智能组卷';
  teacherButtonsWrapper.appendChild(smartComposeButton);

  smartComposeButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "openComposer" });
  });

  // 创建学生功能按钮
  const studentButtonsWrapper = document.createElement('div');
  buttonsContainer.appendChild(studentButtonsWrapper);

  const wrongQuestionDiagButton = document.createElement('button');
  wrongQuestionDiagButton.className = 'ai-button';
  wrongQuestionDiagButton.textContent = '错题诊断';
  studentButtonsWrapper.appendChild(wrongQuestionDiagButton);

  wrongQuestionDiagButton.addEventListener('click', () => {
    hideAllButtons();
    showInstantFunctionBubbles();
  });

  // 创建切换身份按钮
  const switchRoleButton = document.createElement('button');
  switchRoleButton.className = 'ai-switch-role-button';
  switchRoleButton.textContent = '切换身份';
  container.appendChild(switchRoleButton);

  // UI状态管理函数
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

  hideAllButtons();

  chrome.storage.sync.get(['userRole'], function (result) {
    userRole = result.userRole;
    updateSwitchButtonVisibility();
  });

  // 按钮事件监听
  teacherButton.addEventListener('click', () => {
    userRole = 'teacher';
    chrome.storage.sync.set({ userRole: 'teacher' }, () => {
      hideAllButtons();
    });
  });

  studentButton.addEventListener('click', () => {
    userRole = 'student';
    chrome.storage.sync.set({ userRole: 'student' }, () => {
      hideAllButtons();
    });
  });

  switchRoleButton.addEventListener('click', () => {
    if (userRole === 'teacher') {
      userRole = 'student';
    } else if (userRole === 'student') {
      userRole = 'teacher';
    } else {
      return;
    }
    chrome.storage.sync.set({ userRole: userRole });
  });

  // 机器人FAB拖拽和点击逻辑
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

    if (!hasDragged) {
      if (areButtonsVisible) {
        hideAllButtons();
        hideInstantFunctionBubbles();
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

  // ========== 学生错题诊断系统 ==========

  function showInstantFunctionBubbles() {
    hideInstantFunctionBubbles();

    const wrongQuestions = findWrongQuestions();
    if (wrongQuestions.length === 0) {
      showRobotDialog('🎉 太棒了！当前页面没有发现错题！', [
        { text: '确定', onClick: null }
      ]);
      return;
    }

    const bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'instant-bubbles-container';
    bubblesContainer.id = 'instant-bubbles';
    container.appendChild(bubblesContainer);

    const functions = [
      { id: 'error-analysis', icon: '🔍', label: '错因解析', color: '#FFB6D9' },
      { id: 'instant-variation', icon: '📝', label: '即时变式', color: '#FFA6C9' },
      { id: 'personal-graph', icon: '📊', label: '个性图谱', color: '#FF9AC9' }
    ];

    const radius = 80;
    const angleStep = (2 * Math.PI) / functions.length;
    const startAngle = -Math.PI / 2;

    functions.forEach((func, index) => {
      const angle = startAngle + angleStep * index;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const bubble = document.createElement('div');
      bubble.className = 'instant-bubble';
      bubble.id = `bubble-${func.id}`;
      bubble.style.setProperty('--bubble-x', `${x}px`);
      bubble.style.setProperty('--bubble-y', `${y}px`);
      bubble.style.background = `linear-gradient(135deg, ${func.color} 0%, #FFA6C9 100%)`;
      bubble.innerHTML = `
        <div class="bubble-icon">${func.icon}</div>
        <div class="bubble-label">${func.label}</div>
      `;

      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        handleInstantFunctionClick(func.id, wrongQuestions);
      });

      bubblesContainer.appendChild(bubble);
      setTimeout(() => bubble.classList.add('show'), index * 100);
    });

    areButtonsVisible = true;
    updateSwitchButtonVisibility();
  }

  function hideInstantFunctionBubbles() {
    const bubblesContainer = document.getElementById('instant-bubbles');
    if (bubblesContainer) {
      bubblesContainer.remove();
    }
    document.querySelectorAll('.pta-diagnosis-icon').forEach(icon => icon.remove());
    hideRobotDialog();
  }
  function handleInstantFunctionClick(functionId, wrongQuestions) {
    hideInstantFunctionBubbles();

    switch (functionId) {
      case 'error-analysis':
        handleErrorAnalysis(wrongQuestions);
        break;
      case 'instant-variation':
        handleInstantVariation(wrongQuestions);
        break;
      case 'personal-graph':
        handlePersonalGraph(wrongQuestions);
        break;
    }
  }
  function handleErrorAnalysis(wrongQuestions) {
    if (wrongQuestions.length === 0) return;

    const questionNumber = wrongQuestions[0].index + 1;
    showRobotDialog(
      `题目${questionNumber}这道题有问题哦~让我来帮你分析一下吧！\n\n` +
      `📊 错误分析：\n` +
      `• 对C语言位运算符的运算规则理解不透彻\n` +
      `• 没有正确计算左移运算的结果\n` +
      `• 混淆了位运算与算术运算的关系\n\n` +
      `✅ 正确理解：\n` +
      `左移运算符(<<)将二进制数向左移动n位，右边补0。\n` +
      `例如：2<<1 表示将2(二进制10)左移1位，得到4(二进制100)，而不是5。\n` +
      `通用公式：a<<n 相当于 a×2^n\n\n` +
      `💡 学习建议：\n` +
      `• 复习C语言位运算符的基本概念\n` +
      `• 理解二进制表示和位移运算的关系\n` +
      `• 做题时先转换为二进制再计算`,
      [{ text: '返回', onClick: null }]
    );
  }

  function handleInstantVariation(wrongQuestions) {
    showRobotDialog(
      '我刚为你准备好了几道同类型题目举一反三，快来练练手吧~(*^_^*)',
      [
        {
          text: '接受',
          onClick: () => showVariationStep2(wrongQuestions)
        },
        { text: '忽略', onClick: null }
      ]
    );
  }

  function showVariationStep2(wrongQuestions) {
    showRobotDialog(
      '这就是我为你准备的题目了，快来试试吧！相信你一定可以的！',
      [
        {
          text: '看原题',
          onClick: () => showVariationPanel(wrongQuestions)
        }
      ]
    );
  }
  function showVariationPanel(wrongQuestions) {
    // 题目配置（包含正确答案）
    const questions = [
      {
        id: 1,
        title: '变式 1：位运算基础',
        content: '表达式 (3&lt;&lt;2) 的值是12。',
        correctAnswer: '正确',
        explanation: '正确！3左移2位：二进制11左移2位得到1100，即十进制12。公式：3×2²=12'
      },
      {
        id: 2,
        title: '变式 2：左移运算理解',
        content: 'C语言中，左移运算符(&lt;&lt;)将操作数的二进制位向左移动，右边补0，相当于乘以2的n次方。',
        correctAnswer: '正确',
        explanation: '正确！左移运算的本质就是乘以2的幂次。例如：a<<n = a×2^n'
      },
      {
        id: 3,
        title: '变式 3：运算结果判断',
        content: '表达式 (5&lt;&lt;1) 的值是11。',
        correctAnswer: '错误',
        explanation: '错误！5左移1位：二进制101左移1位得到1010，即十进制10，而不是11。公式：5×2¹=10'
      }
    ];

    const panel = document.createElement('div');
    panel.className = 'pta-diagnosis-panel show';

    // 构建题目HTML
    const questionsHTML = questions.map(q => `
      <div class="variation-item" data-question-id="${q.id}">
        <p class="var-title">${q.title}</p>
        <p class="var-content">${q.content}</p>
        <div class="var-options">
          <button class="var-option" data-answer="正确">正确</button>
          <button class="var-option" data-answer="错误">错误</button>
        </div>
        <div class="var-result" style="display: none;"></div>
      </div>
    `).join('');

    panel.innerHTML = `
      <div class="panel-header">
        <h2>📝 即时变式练习</h2>
        <button class="close-btn">&times;</button>
      </div>
      
      <div class="panel-content">
        <h3>🎯 举一反三练习</h3>
        <p style="color: #666; margin-bottom: 20px;">
          基于你的 ${wrongQuestions.length} 道错题，为你准备了以下变式题目
        </p>
        
        <div class="variation-list">
          ${questionsHTML}
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #FFF5F9; border-radius: 12px;">
          <h4 style="color: #FFA6C9; margin: 0 0 10px 0;">💡 提示</h4>
          <p style="margin: 0; color: #555; line-height: 1.8;">
            这些题目是根据你的错题自动生成的，难度相似但角度不同，帮助你更好地理解知识点。
          </p>
        </div>
        
        <div id="submit-section" style="margin-top: 20px; text-align: center;">
          <button class="submit-btn" style="
            padding: 12px 40px;
            background: linear-gradient(135deg, #FFB6D9 0%, #FFA6C9 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 182, 217, 0.3);
            transition: all 0.3s ease;
          ">提交答案</button>
        </div>
        
        <div id="result-section" style="display: none;">
          <div id="score-display" style="
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #FFF5F9 0%, #FFE5F3 100%);
            border-radius: 15px;
            text-align: center;
          "></div>
          
          <div style="margin-top: 20px; text-align: center;">
            <button class="return-btn">返回</button>
          </div>
        </div>
      </div>
    `;

    // 关闭按钮
    panel.querySelector('.close-btn').onclick = () => panel.remove();

    const userAnswers = {};

    panel.querySelectorAll('.var-option').forEach(option => {
      option.onclick = function () {
        const item = this.closest('.variation-item');
        const questionId = item.dataset.questionId;
        const answer = this.dataset.answer;

        item.querySelectorAll('.var-option').forEach(opt => {
          opt.classList.remove('selected');
          opt.style.background = 'white';
          opt.style.borderColor = '#ddd';
        });
        this.classList.add('selected');
        this.style.background = '#FFF5F9';
        this.style.borderColor = '#FFA6C9';

        userAnswers[questionId] = answer;
      };
    });

    panel.querySelector('.submit-btn').onclick = function () {
      if (Object.keys(userAnswers).length < questions.length) {
        showRobotDialog(
          '请先完成所有题目哦~还有题目没有选择答案呢！',
          [{ text: '好的', onClick: null }]
        );
        return;
      }

      let correctCount = 0;
      questions.forEach(q => {
        const item = panel.querySelector(`[data-question-id="${q.id}"]`);
        const resultDiv = item.querySelector('.var-result');
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;

        if (isCorrect) correctCount++;

        resultDiv.style.display = 'block';
        resultDiv.style.marginTop = '15px';
        resultDiv.style.padding = '15px';
        resultDiv.style.borderRadius = '10px';
        resultDiv.style.lineHeight = '1.8';

        if (isCorrect) {
          resultDiv.style.background = '#E8F5E9';
          resultDiv.style.border = '2px solid #81C784';
          resultDiv.innerHTML = `
            <div style="color: #2E7D32; font-weight: 600; margin-bottom: 8px;">
              ✅ 回答正确！
            </div>
            <div style="color: #555; font-size: 14px;">
              ${q.explanation}
            </div>
          `;
        } else {
          resultDiv.style.background = '#FFEBEE';
          resultDiv.style.border = '2px solid #E57373';
          resultDiv.innerHTML = `
            <div style="color: #C62828; font-weight: 600; margin-bottom: 8px;">
              ❌ 回答错误
            </div>
            <div style="color: #555; font-size: 14px; margin-bottom: 8px;">
              <strong>你的答案：</strong>${userAnswer} | <strong>正确答案：</strong>${q.correctAnswer}
            </div>
            <div style="color: #555; font-size: 14px;">
              ${q.explanation}
            </div>
          `;
        }

        item.querySelectorAll('.var-option').forEach(opt => {
          opt.style.cursor = 'not-allowed';
          opt.style.opacity = '0.6';
          opt.onclick = null;
        });
      });
      const score = (correctCount / questions.length * 100).toFixed(0);
      const scoreDisplay = panel.querySelector('#score-display');

      let encouragement = '';
      let emoji = '';
      if (correctCount === questions.length) {
        emoji = '🎉';
        encouragement = '太棒了！全部正确！你已经完全掌握了位运算的知识点！';
      } else if (correctCount >= questions.length * 0.67) {
        emoji = '👍';
        encouragement = '做得不错！大部分题目都答对了，继续加油！';
      } else if (correctCount >= questions.length * 0.34) {
        emoji = '💪';
        encouragement = '还不错！还有进步空间，建议重新复习错题涉及的知识点。';
      } else {
        emoji = '📚';
        encouragement = '需要加强！建议认真复习教材，理解位运算的基本概念后再练习。';
      }

      scoreDisplay.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px; line-height: 1;">${emoji}</div>
        <div style="font-size: 32px; font-weight: 700; color: #FFA6C9; margin-bottom: 10px;">
          ${correctCount}/${questions.length} 正确
        </div>
        <div style="font-size: 18px; color: #666; margin-bottom: 15px;">
          得分：${score}分
        </div>
        <div style="font-size: 16px; color: #555; line-height: 1.8; max-width: 500px; margin: 0 auto;">
          ${encouragement}
        </div>
      `;

      panel.querySelector('#submit-section').style.display = 'none';
      panel.querySelector('#result-section').style.display = 'block';
      panel.querySelector('.return-btn').onclick = () => panel.remove();
      panel.querySelector('.panel-content').scrollTop = 0;
    };

    document.body.appendChild(panel);
  }
  function handlePersonalGraph(wrongQuestions) {
    showRobotDialog(
      `你当前的易错点是：\n\n` +
      `☆ 位运算符的使用\n` +
      `☆ 二进制与十进制转换\n` +
      `☆ 左移右移运算规则\n\n` +
      `💡 建议：\n` +
      `重点复习C语言位运算相关知识点，掌握二进制运算规则，多做相关练习题。`,
      [{ text: '返回', onClick: null }]
    );
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  function showRobotDialog(message, buttons) {
    const dialogBubble = document.getElementById('robot-dialog-bubble');
    const buttonsHTML = buttons.map(btn =>
      `<button class="dialog-btn">${btn.text}</button>`
    ).join('');
    const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');

    dialogBubble.innerHTML = `
      <div class="dialog-content">${escapedMessage}</div>
      <div class="dialog-buttons">${buttonsHTML}</div>
    `;

    dialogBubble.querySelectorAll('.dialog-btn').forEach((btnEl, index) => {
      btnEl.addEventListener('click', () => {
        if (buttons[index].onClick) {
          buttons[index].onClick();
        } else {
          hideRobotDialog();
        }
      });
    });

    updateDialogPosition();
    dialogBubble.classList.add('show');
    fab.classList.add('speaking');
  }
  function updateDialogPosition() {
    const dialogBubble = document.getElementById('robot-dialog-bubble');
    const containerRect = container.getBoundingClientRect();
    const dialogOffset = 70;

    if (containerRect.right > window.innerWidth / 2) {
      dialogBubble.style.right = dialogOffset + 'px';
      dialogBubble.style.left = 'auto';
      dialogBubble.classList.add('position-left');
      dialogBubble.classList.remove('position-right');
    } else {
      dialogBubble.style.left = dialogOffset + 'px';
      dialogBubble.style.right = 'auto';
      dialogBubble.classList.add('position-right');
      dialogBubble.classList.remove('position-left');
    }

    dialogBubble.style.bottom = '0';
    dialogBubble.style.top = 'auto';
  }
  function hideRobotDialog() {
    const dialogBubble = document.getElementById('robot-dialog-bubble');
    dialogBubble.classList.remove('show');
    fab.classList.remove('speaking');
  }
  function findWrongQuestions() {
    const questionContainers = document.querySelectorAll('.pc-x.pt-2.pl-4');
    const wrongQuestions = [];

    questionContainers.forEach((container, index) => {
      if (container.textContent.includes('答案错误')) {
        wrongQuestions.push({
          index: index,
          element: container,
          info: extractQuestionInfo(container)
        });
      }
    });

    return wrongQuestions;
  }

  function extractQuestionInfo(container) {
    const questionText = container.querySelector('.rendered-markdown p');
    const resultSpan = container.querySelector('[style*="color"]');

    return {
      content: questionText ? questionText.textContent : '题目内容',
      result: resultSpan ? resultSpan.textContent : '答案错误',
      type: '判断题'
    };
  }
  function showBubbleTip(message, onConfirm = null) {
    const existing = document.querySelector('.pta-bubble-tip');
    if (existing) existing.remove();

    const bubble = document.createElement('div');
    bubble.className = 'pta-bubble-tip show';
    const hasButton = onConfirm !== null;
    const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');

    bubble.innerHTML = `
      <div class="bubble-content">
        <div class="bubble-text">${escapedMessage}</div>
        ${hasButton ? '<button class="bubble-btn">返回</button>' : ''}
      </div>
    `;

    if (hasButton) {
      bubble.querySelector('.bubble-btn').onclick = () => {
        bubble.remove();
        if (onConfirm) onConfirm();
      };
    }

    document.body.appendChild(bubble);

    if (!hasButton) {
      setTimeout(() => {
        bubble.classList.remove('show');
        setTimeout(() => bubble.remove(), 300);
      }, 3000);
    }
  }

})();
