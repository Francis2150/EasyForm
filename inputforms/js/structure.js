document.addEventListener('DOMContentLoaded', () => {
  const roleLabels = {
    directors: 'Director',
    secretaries: 'Secretary',
    shareholders: 'Shareholder',
    beneficialOwners: 'Beneficial Owner'
  };

  Object.entries(roleLabels).forEach(([roleId, roleLabel]) => {
    createRoleSection(roleId, roleLabel);
  });

  function createRoleSection(roleId, roleLabel) {
    const section = document.getElementById(`${roleId}Section`);
    if (!section) return;

    const isSingleRole = roleId === 'secretaries';
    section.innerHTML = `
      <h3>${roleLabel}${isSingleRole ? '' : 's'}</h3>
      <div id="${roleId}Container"></div>
      ${isSingleRole ? '' : `<button type="button" class="addBtn">Add ${roleLabel}</button>`}
      <hr/>
    `;

    const container = section.querySelector(`#${roleId}Container`);
    const addBtn = section.querySelector('.addBtn');
    container.appendChild(createPersonBlock(roleId, roleLabel, 1));

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const nextIndex = container.querySelectorAll('.person').length + 1;
        container.appendChild(createPersonBlock(roleId, roleLabel, nextIndex));
        relabel(container, roleLabel);
      });
    }

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('removeBtn')) {
        const person = e.target.closest('.person');
        if (person) {
          person.remove();
          relabel(container, roleLabel);
        }
      }
      if (e.target.classList.contains('collapse-btn')) {
        const next = e.target.nextElementSibling;
        if (next) next.classList.toggle('collapsed');
      }
    });
  }

  function createPersonBlock(roleId, roleLabel, index) {
    const div = document.createElement('div');
    div.classList.add('person');
    div.dataset.index = index;

    let roleSelectionHTML = '';
    if (roleId === 'directors') {
      roleSelectionHTML = `
        <div class="role-selection">
          <label><strong>Role Selection:</strong></label><br>
          <label><input type="checkbox" class="role-checkbox director-only" checked> Director only</label><br>
          <label><input type="checkbox" class="role-checkbox also-secretary"> Also acts as Secretary</label><br>
          <label>
            <input type="checkbox" class="role-checkbox also-shareholder"> Also a Shareholder
            <span class="shareholder-percentage" style="display:none;">
              &nbsp;Share %: <input type="number" class="shareholder-input" min="0" max="100" placeholder="0">
            </span>
          </label><br>
          <label><input type="checkbox" class="role-checkbox also-beneficial"> Also a Beneficial Owner</label>
        </div>
      `;
    }

    div.innerHTML = `
      <h4>${roleLabel} ${index}</h4>
      ${roleSelectionHTML}
      <div class="section">
        <button type="button" class="collapse-btn">Toggle Personal Info</button>
        <div class="content">
          <div class="form-group"><label>Full Name:</label><input type="text" /></div>
          <div class="form-group"><label>Email:</label><input type="email" /></div>
          <div class="form-group"><label>Phone:</label><input type="text" /></div>
          <div class="form-group"><label>Date of Birth:</label><input type="date" /></div>
        </div>
      </div>

      <div class="section">
        <button type="button" class="collapse-btn">Toggle Residential Info</button>
        <div class="content">
          <div class="form-group"><label>Address:</label><input type="text" /></div>
          <div class="form-group"><label>City:</label><input type="text" /></div>
          <div class="form-group"><label>Country:</label><input type="text" /></div>
        </div>
      </div>

      ${roleId === 'secretaries' ? '' : '<button type="button" class="removeBtn">Remove</button>'}
    `;

    if (roleId === 'directors') {
      const directorOnly = div.querySelector('.director-only');
      const alsoSecretary = div.querySelector('.also-secretary');
      const alsoShareholder = div.querySelector('.also-shareholder');
      const alsoBeneficial = div.querySelector('.also-beneficial');
      const shareholderPercentBox = div.querySelector('.shareholder-percentage');
      const secretaryContainer = document.getElementById('secretariesSectionContainer');

      // Limit to only one director acting as secretary
      alsoSecretary.addEventListener('change', () => {
        if (alsoSecretary.checked) {
          // Uncheck others
          document.querySelectorAll('.also-secretary').forEach(cb => {
            if (cb !== alsoSecretary) {
              cb.checked = false;
              cb.disabled = true;
            }
          });
          secretaryContainer.style.display = 'none';
          directorOnly.checked = false;
        } else {
          // Re-enable all checkboxes if none selected
          const anyChecked = document.querySelectorAll('.also-secretary:checked').length > 0;
          document.querySelectorAll('.also-secretary').forEach(cb => cb.disabled = false);
          secretaryContainer.style.display = anyChecked ? 'none' : 'block';
          if (!anyChecked && !alsoShareholder.checked && !alsoBeneficial.checked) {
            directorOnly.checked = true;
          }
        }
      });

      directorOnly.addEventListener('change', () => {
        if (directorOnly.checked) {
          alsoSecretary.checked = false;
          alsoShareholder.checked = false;
          alsoBeneficial.checked = false;
          shareholderPercentBox.style.display = 'none';
          const anyChecked = document.querySelectorAll('.also-secretary:checked').length > 0;
          secretaryContainer.style.display = anyChecked ? 'none' : 'block';
          document.querySelectorAll('.also-secretary').forEach(cb => cb.disabled = anyChecked);
        }
      });

      [alsoShareholder, alsoBeneficial].forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked) {
            directorOnly.checked = false;
          } else if (!alsoSecretary.checked && !alsoShareholder.checked && !alsoBeneficial.checked) {
            directorOnly.checked = true;
          }
          if (cb.classList.contains('also-shareholder')) {
            shareholderPercentBox.style.display = cb.checked ? 'inline-block' : 'none';
          }
        });
      });
    }

    return div;
  }

  function relabel(container, roleLabel) {
    const blocks = container.querySelectorAll('.person');
    blocks.forEach((block, i) => {
      const h4 = block.querySelector('h4');
      if (h4) h4.textContent = `${roleLabel} ${i + 1}`;
    });
  }
});
