/* form-setup.js
   Responsible for building the in-page dynamic form UI:
   - createRoleSection(roleId, roleLabel)
   - createPersonBlock(roleId, roleLabel, index)
   - Delegated handlers for remove / collapse, and add buttons.
   Exposes createPersonBlock and createRoleSection on window for other modules.
*/

(function () {
  // Role labels: human-friendly wording
  const roleLabels = {
    directors: 'Director',
    secretaries: 'Secretary',
    shareholders: 'Shareholder',
    beneficialOwners: 'Beneficial Owner'
  };

  /* createRoleSection: creates the markup for a role area if not already present */
  function createRoleSection(roleId, roleLabel) {
    const section = document.getElementById(`${roleId}Section`);
    if (!section) {
      console.warn(`Missing section element: ${roleId}Section`);
      return;
    }

    // If already initialized, ensure at least one .person block exists
    let container = section.querySelector(`#${roleId}Container`);
    if (!container) {
      section.innerHTML = `
        <h3>${roleLabel}</h3>
        <div id="${roleId}Container"></div>
        <button type="button" class="addBtn">Add ${roleLabel}</button>
        <hr/>
      `;
      container = section.querySelector(`#${roleId}Container`);
      const addBtn = section.querySelector('.addBtn');

      // start with a single person block
      let count = 1;
      container.appendChild(createPersonBlock(roleId, roleLabel, count));

      // add button appends new blocks
      addBtn.addEventListener('click', () => {
        count++;
        container.appendChild(createPersonBlock(roleId, roleLabel, count));
      });

      // delegate remove and collapse events to container (single handler)
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeBtn')) {
          const p = e.target.closest('.person');
          if (p) {
            p.remove();
            // use util relabel (may be overridden by other modules)
            window.relabel && window.relabel(container, roleLabel);
          }
        }
        if (e.target.classList.contains('collapse-btn')) {
          const next = e.target.nextElementSibling;
          if (next) next.classList.toggle('collapsed');
        }
      });
    } else {
      if (!container.querySelector('.person')) {
        container.appendChild(createPersonBlock(roleId, roleLabel, 1));
      }
    }
  }

  /* createPersonBlock: returns a DOM node representing a person for a role.
     For 'directors' we include the role-selection checkboxes. */
  function createPersonBlock(roleId, roleLabel, index) {
    const div = document.createElement('div');
    div.classList.add('person');
    div.dataset.index = index;

    // role selection only for directors
    let roleSelectionHTML = '';
    if (roleId === 'directors') {
      roleSelectionHTML = `
        <div class="role-selection">
          <label><strong>Role Selection:</strong></label><br>
          <label><input type="checkbox" class="role-checkbox director-only" name="director_role_${index}[]" value="Director" checked> Director only</label><br>
          <label><input type="checkbox" class="role-checkbox also-secretary" name="director_role_${index}[]" value="Secretary"> Also acts as Secretary</label><br>
          <label><input type="checkbox" class="role-checkbox also-shareholder" name="director_role_${index}[]" value="Shareholder"> Also a Shareholder</label><br>
          <label><input type="checkbox" class="role-checkbox also-beneficial" name="director_role_${index}[]" value="BeneficialOwner"> Also a Beneficial Owner</label>
        </div>
      `;
    }

    div.innerHTML = `
      <h4>${roleLabel} ${index}</h4>
      ${roleSelectionHTML}
      <div class="section">
        <button type="button" class="collapse-btn">Toggle Personal Info</button>
        <div class="content">
          <div class="form-group"><label>Full Name:</label><input type="text" name="${roleId}_name[]" /></div>
          <div class="form-group"><label>Email:</label><input type="email" name="${roleId}_email[]" /></div>
          <div class="form-group"><label>Phone:</label><input type="text" name="${roleId}_phone[]" /></div>
          <div class="form-group"><label>Date of Birth:</label><input type="date" name="${roleId}_dob[]" /></div>
        </div>
      </div>
      <div class="section">
        <button type="button" class="collapse-btn">Toggle Residential Info</button>
        <div class="content">
          <div class="form-group"><label>Address:</label><input type="text" name="${roleId}_address[]" /></div>
          <div class="form-group"><label>City:</label><input type="text" name="${roleId}_city[]" /></div>
          <div class="form-group"><label>Country:</label><input type="text" name="${roleId}_country[]" /></div>
        </div>
      </div>
      <button type="button" class="removeBtn">Remove</button>
    `;

    // director-specific checkbox logic (mutual exclusivity)
    if (roleId === 'directors') {
      const directorOnly = div.querySelector('.director-only');
      const alsoSecretary = div.querySelector('.also-secretary');
      const alsoShareholder = div.querySelector('.also-shareholder');
      const alsoBeneficial = div.querySelector('.also-beneficial');
      const others = [alsoSecretary, alsoShareholder, alsoBeneficial];

      directorOnly.addEventListener('change', () => {
        if (directorOnly.checked) others.forEach(cb => cb.checked = false);
      });

      others.forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked) {
            directorOnly.checked = false;
          } else {
            if (!alsoSecretary.checked && !alsoShareholder.checked && !alsoBeneficial.checked) {
              directorOnly.checked = true;
            }
          }
        });
      });
    }

    return div;
  }

  // Initialize role sections once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    createRoleSection('directors', roleLabels.directors);
    createRoleSection('secretaries', roleLabels.secretaries);
    createRoleSection('shareholders', roleLabels.shareholders);
    createRoleSection('beneficialOwners', roleLabels.beneficialOwners);
  });

  // Expose functions needed by other modules
  window.createPersonBlock = createPersonBlock;
  window.createRoleSection = createRoleSection;
})();
