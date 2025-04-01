// ==UserScript==
// @name         Special underscore ASCII painting
// @version      2025-04-01
// @description  Special underscore ASCII painting
// @author       Hubol
// @match        https://kirilllive.github.io/ASCII_Art_Paint/ascii_paint.html
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function () {
  const styleElement = document.createElement('style');
  styleElement.textContent = `#asciicanvas [data-mute] {
  color: #202020;
  background-color: #202020;
}`;
  document.head.append(styleElement);

  function updateTableCellElementDatasetMute(el) {
    if (el.textContent === '_') {
      el.dataset.mute = true;
    } else {
      delete el.dataset.mute;
    }
  }

  new MutationObserver((records) => {
    for (const { target } of records) {
      if (target instanceof HTMLTableCellElement) {
        updateTableCellElementDatasetMute(target);
      }
    }
  }).observe(document.getElementById('asciicanvas'), {
    childList: true,
    subtree: true,
    characterData: true,
  });

  function updateAllTableCellElements() {
    document.querySelectorAll('#asciicanvas td').forEach(updateTableCellElementDatasetMute);
  }

  const modal_windowOld = modal_window;
  modal_window = function (...args) {
    modal_windowOld(...args);
    updateAllTableCellElements();
  }

  setInterval(updateAllTableCellElements, 1000);

  function flipCharacter(char) {
    switch (char) {
      case '▖':
        return '▗';
      case '▗':
        return '▖';
      case '▝':
        return '▘';
      case '▘':
        return '▝';
      case '▜':
        return '▛';
      case '▛':
        return '▜';
      case '▙':
        return '▟';
      case '▟':
        return '▙';
      default:
        return char;
    }
  }

  function flipText(text) {
    return text
      .split('\n')
      .map(line => line.replaceAll('\r', ''))
      .map(line => {
        let result = '';
        for (let i = 0; i < line.length; i++) {
          result = flipCharacter(line.charAt(i)) + result;
        }
        return result;
      })
      .join('\n');
  }

  document.addEventListener('keyup', (ev) => {
    if (ev.code === 'KeyF') {
      const textArea = document.querySelector('textarea.edittext');
      if (!textArea) {
        return;
      }

      textArea.value = flipText(textArea.value);
    }
  });
})()
