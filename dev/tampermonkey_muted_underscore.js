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

  new MutationObserver((records) => {
    for (const { target } of records) {
      if (target instanceof HTMLTableCellElement) {
        if (target.textContent === '_') {
          target.dataset.mute = true
        } else {
          delete target.dataset.mute
        }
      }
    }
  }).observe(document.getElementById('asciicanvas'), {
    childList: true,
    subtree: true,
    characterData: true,
  })
})()
