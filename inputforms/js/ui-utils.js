/* ui-utils.js
   Shared utility functions used by form-setup, data-handlers and table-render.
   Keep small, deterministic pure helpers here (no heavy DOM initialization).
*/

/* Escape HTML to avoid injection issues when inserting values into markup. */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

/* Relabel sequential headings inside a container (keeps "Director 1, Director 2" order). */
function relabel(container, roleLabel) {
  if (!container) return;
  const blocks = container.querySelectorAll('.person');
  blocks.forEach((b, i) => {
    const h4 = b.querySelector('h4');
    if (h4) h4.textContent = `${roleLabel} ${i + 1}`;
  });
}

/* Deduplicate people array by a stable key (name|email|phone|dob|address) */
function dedupePeopleByKey(arr = []) {
  const seen = new Map();
  const out = [];
  for (const p of arr) {
    const name = (p.personal && p.personal.name || '').toString().trim().toLowerCase();
    const email = (p.personal && p.personal.email || '').toString().trim().toLowerCase();
    const phone = (p.personal && p.personal.phone || '').toString().trim().toLowerCase();
    const dob = (p.personal && p.personal.dob || '').toString().trim().toLowerCase();
    const addr = (p.residential && p.residential.address || '').toString().trim().toLowerCase();
    const key = [name, email, phone, dob, addr].join('|');
    if (!seen.has(key)) {
      seen.set(key, true);
      out.push(p);
    }
  }
  return out;
}

/* Small helper to safely query an element by id and warn if missing. */
function qid(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`ui-utils: missing element #${id}`);
  return el;
}

/* Expose utilities on window so other non-bundled script files can use them. */
window.escapeHtml = escapeHtml;
window.relabel = relabel;
window.dedupePeopleByKey = dedupePeopleByKey;
window.qid = qid;
