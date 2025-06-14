// ==UserScript==
// @name         AutoSchool (All Subjects Fork)
// @namespace    https://github.com/Nomikon/
// @version      2.0
// @description  Enhanced AutoSchool script for GooBoo: supports Math, Literature, Art, and History.
// @author       lucidobservor (original), Nomikon (fork & enhancements)
// @license      MIT
// @match        https://html-classic.itch.zone/html/9100894/index.html
// @match        https://tendsty.github.io/gooboo/
// @match        https://tendsty.itch.io/gooboo
// @icon         https://tendsty.github.io/gooboo/favicon-32x32.png
// @downloadURL  https://github.com/N0mikon/AutoSchool-AllSubjects/raw/main/AutoSchool-AllSubjects.user.js
// @updateURL    https://github.com/N0mikon/AutoSchool-AllSubjects/raw/main/AutoSchool-AllSubjects.user.js
// @homepage     https://github.com/N0mikon/AutoSchool-AllSubjects
// @supportURL   https://github.com/N0mikon/AutoSchool-AllSubjects/issues
// @grant        none
// ==/UserScript==


(function () {
  'use strict';

  let schoolButtonActive = -1;
  const schoolButtonName = 'schoolActionButton';

  let litStarted = false;
  let litLastQuestion = '';

  function turnOff() {
    clearInterval(schoolButtonActive);
    schoolButtonActive = -1;
    document.getElementById(schoolButtonName).innerHTML = 'AutoSchool OFF';
  }

  function autoClicker() {
    // === HISTORY ===
    const banners = document.querySelectorAll('.date-text');
    const historyInput = document.getElementById('answer-input-history');
    const isHistoryMemorizePhase = banners.length > 1 && !historyInput;

    if (isHistoryMemorizePhase) {
      const historyAnswers = [];
      banners.forEach(banner => {
        const colorClass = Array.from(banner.classList).find(c =>
          ['red', 'green', 'blue', 'yellow', 'purple', 'brown', 'orange', 'grey', 'cyan', 'pink'].includes(c)
        );
        const year = parseInt(banner.innerText.match(/\d+/)?.[0]);
        if (colorClass && year) {
          historyAnswers.push({ color: colorClass, year });
        }
      });
      window._historyAnswers = historyAnswers;

      const startBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.trim().toLowerCase() === 'answer'
      );
      startBtn?.click();
      return;
    }

    if (historyInput && Array.isArray(window._historyAnswers)) {
      const questionBanner = document.querySelector('.balloon-text-dynamic.date-text');
      const colorClass = Array.from(questionBanner?.classList || []).find(c =>
        ['red', 'green', 'blue', 'yellow', 'purple', 'brown', 'orange', 'grey', 'cyan', 'pink'].includes(c)
      );

      if (colorClass) {
        const match = window._historyAnswers.find(item => item.color === colorClass);
        if (match) {
          historyInput.value = match.year;
          historyInput.dispatchEvent(new Event('input', { bubbles: true }));
          const answerBtn = Array.from(document.querySelectorAll('button')).find(b =>
            b.innerText.trim().toLowerCase() === 'answer'
          );
          answerBtn?.click();
        }
      }
      return;
    }

    // === ART ===
    const artCells = document.querySelectorAll('.color-cell-mixed');
    const answerCells = document.querySelectorAll('.color-cell-answer');
    if (artCells.length === 2 && answerCells.length > 0) {
      const rgb1 = window.getComputedStyle(artCells[0]).backgroundColor.match(/\d+/g).map(Number);
      const rgb2 = window.getComputedStyle(artCells[1]).backgroundColor.match(/\d+/g).map(Number);
      const blended = rgb1.map((c, i) => Math.round((c + rgb2[i]) / 2)).join(', ');

      for (const cell of answerCells) {
        const ansColor = window.getComputedStyle(cell).backgroundColor.match(/\d+/g).map(Number);
        if (ansColor.join(', ') === blended) {
          cell.click();
          break;
        }
      }
      return;
    }

    // === MATH ===
    const mathInput = document.getElementById('answer-input-math');
    if (mathInput) {
      const vueRoot = document.querySelector('.question-text');
      let vue = vueRoot;
      while (vue && !vue.__vue__) {
        vue = vue.parentElement;
      }
      vue = vue?.__vue__;
      while (vue && typeof vue.solution === 'undefined') {
        vue = vue.$parent;
      }

      if (vue && typeof vue.solution !== 'undefined') {
        const raw = vue.solution;
        const answer = (typeof raw === 'number' && !Number.isSafeInteger(raw))
          ? BigInt(Math.round(raw)).toString()
          : raw.toString();

        mathInput.value = answer;
        mathInput.dispatchEvent(new Event('input', { bubbles: true }));
        const mathBtn = document.querySelector('button.ma-1.v-btn.primary');
        mathBtn?.click();
      }
      return;
    }

    // === LITERATURE ===
    const litInput = document.querySelector('.v-text-field input');
    const litQuestion = document.querySelector('.question-text');
    if (litInput && litQuestion) {
      const currentText = litQuestion.innerText.trim().split('\n')[0];

      if (!litLastQuestion || litLastQuestion !== currentText) {
        const answer = currentText;
        litInput.value = answer;
        litInput.dispatchEvent(new Event('input', { bubbles: true }));

        if (!litStarted) {
          litStarted = true;
          setTimeout(() => {
            document.querySelector('button.ma-1.v-btn.primary')?.click();
            litLastQuestion = currentText;
          }, 250);
        } else {
          document.querySelector('button.ma-1.v-btn.primary')?.click();
          litLastQuestion = currentText;
        }
      }
      return;
    }
  }

  // === TOGGLE BUTTON + LOADING TIME FIX ===
  const observer = new MutationObserver(() => {
    const toolbar = document.querySelector('.v-toolbar__content .spacer');
    if (toolbar && !document.getElementById(schoolButtonName)) {
      const schoolActionDiv = document.createElement('div');
      schoolActionDiv.id = 'schoolActionDiv';
      schoolActionDiv.innerHTML = `&nbsp;&nbsp;<button data-autoaction id="${schoolButtonName}" type="button" class="v-chip theme--dark v-size--small">AutoSchool OFF</button>`;
      toolbar.insertAdjacentElement('afterend', schoolActionDiv);

      observer.disconnect();

      document.getElementById(schoolButtonName).onclick = function () {
        if (schoolButtonActive === -1) {
          schoolButtonActive = setInterval(autoClicker, 250);
          document.getElementById(schoolButtonName).innerHTML = 'AutoSchool ON';
        } else {
          turnOff();
        }
      };
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
