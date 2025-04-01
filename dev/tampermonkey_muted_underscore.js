// ==UserScript==
// @name         Special underscore ASCII painting
// @version      2025-04-01
// @description  Special underscore ASCII painting
// @author       Hubol
// @match        https://kirilllive.github.io/ASCII_Art_Paint/ascii_paint.html
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function () {
  const styleElement = document.createElement('style')
  styleElement.textContent = `#asciicanvas [data-mute] {
  color: #202020;
  background-color: #202020;
}`
  document.head.append(styleElement)

  function updateTableCellElementDatasetMute(el) {
    if (el.textContent === '_') {
      el.dataset.mute = true
    } else {
      delete el.dataset.mute
    }
  }

  new MutationObserver((records) => {
    for (const { target } of records) {
      if (target instanceof HTMLTableCellElement) {
        updateTableCellElementDatasetMute(target)
      }
    }
  }).observe(document.getElementById('asciicanvas'), {
    childList: true,
    subtree: true,
    characterData: true,
  })

  const modal_windowOld = modal_window;
  modal_window = function (...args) {
    modal_windowOld(...args);
    document.querySelectorAll('#asciicanvas td').forEach(updateTableCellElementDatasetMute);
  }
})()
