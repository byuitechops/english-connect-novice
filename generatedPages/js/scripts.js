/* eslint-env browser */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

function changeTab() {
  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.classList.toggle('visible');
  });
  document.querySelectorAll('.tabName').forEach(function (tab) {
    tab.classList.toggle('visible');
  });
}
