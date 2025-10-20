// roleselector.js
// Adds role-selection checkboxes + Share% input for directors.

document.addEventListener("DOMContentLoaded", () => {
  const directorsContainer = document.getElementById("idirectorsContainer");
  if (!directorsContainer) return;

  // Wait for structurecopy to render
  setTimeout(() => {
    addRoleSelectorsToAllDirectors();

    // Observe DOM changes for newly added directors
    const observer = new MutationObserver(() => addRoleSelectorsToAllDirectors());
    observer.observe(directorsContainer, { childList: true });
  }, 300);
});

function addRoleSelectorsToAllDirectors() {
  const directorFieldsets = document.querySelectorAll("#idirectorsContainer fieldset");

  directorFieldsets.forEach(fs => {
    // Skip if already done
    if (fs.querySelector(".role-checkboxes")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "role-checkboxes";
    wrapper.innerHTML = `
      <p class="role-prefix">This Director is also:</p>
      <div class="role-options">
        <label class="role-label"><input type="checkbox" class="roleCheck" data-role="secretary"> Secretary</label>
        <label class="role-label"><input type="checkbox" class="roleCheck" data-role="subscriber"> Subscriber</label>
        <label class="role-label"><input type="checkbox" class="roleCheck" data-role="owner"> Beneficial Owner</label>
      </div>
      <div class="sharePercentBox hidden">
        <label>Share %:</label>
        <input type="number" class="shareInput" min="0" max="100" placeholder="Enter share percentage">
      </div>
      <hr class="role-divider">
    `;

    const firstGroup = fs.querySelector(".form-group");
    fs.insertBefore(wrapper, firstGroup);

    // Checkbox event listeners
    wrapper.querySelectorAll(".roleCheck").forEach(cb => {
      cb.addEventListener("change", event => handleRoleAssignment(fs, event.target));
    });
  });
}

function handleRoleAssignment(directorFs, checkbox) {
  const role = checkbox.dataset.role;
  const checked = checkbox.checked;
  const wrapper = checkbox.closest(".role-checkboxes");
  const shareBox = wrapper.querySelector(".sharePercentBox");

  if (role === "subscriber") {
    // Toggle visibility of Share % input
    shareBox.classList.toggle("hidden", !checked);
  }

  if (checked) {
    copyDirectorDataToRole(directorFs, role, wrapper);
  } else {
    removeLinkedRoleEntry(directorFs, role);
  }
}

function copyDirectorDataToRole(directorFs, role, wrapper) {
  const dirIndexMatch = directorFs.id.match(/\d+$/);
  const dirIndex = dirIndexMatch ? dirIndexMatch[0] : "1";
  const prefix = `idirector${dirIndex}_`;

  const dirData = {};
  directorFs.querySelectorAll("input, select").forEach(el => {
    dirData[el.id.replace(prefix, "")] = el.value;
  });

  if (role === "subscriber") {
    const shareInput = wrapper.querySelector(".shareInput");
    dirData.sharePercent = shareInput ? shareInput.value || "" : "";
  }

  switch (role) {
    case "secretary":
      fillSecretaryForm(dirData);
      break;
    case "subscriber":
      addOrFillSubscriber(dirData, directorFs);
      break;
    case "owner":
      addOrFillOwner(dirData, directorFs);
      break;
  }
}

function fillSecretaryForm(data) {
  const prefix = "isec";
  document.querySelectorAll(`[id^=${prefix}]`).forEach(el => {
    const key = el.id.replace(prefix, "").replace(/^[A-Z]/, c => c.toLowerCase());
    for (const k in data) {
      if (key.toLowerCase().includes(k.toLowerCase())) el.value = data[k];
    }
  });
}

function addOrFillSubscriber(data, directorFs) {
  const container = document.getElementById("isubscribersContainer");
  const addBtn = document.getElementById("iaddSubscriberBtn");
  const tag = "linkedFromDirector-" + directorFs.id;

  let targetFs = container.querySelector(`fieldset[data-link="${tag}"]`);
  if (!targetFs) {
    addBtn.click();
    targetFs = container.querySelector("#isubscribersContainer fieldset:last-of-type");
    targetFs.dataset.link = tag;
  }

  const indexMatch = targetFs.id.match(/\d+$/);
  const prefix = `isubscriber${indexMatch}_`;
  fillTargetForm(targetFs, prefix, data);
}

function addOrFillOwner(data, directorFs) {
  const container = document.getElementById("iownersContainer");
  const addBtn = document.getElementById("iaddOwnerBtn");
  const tag = "linkedFromDirector-" + directorFs.id;

  let targetFs = container.querySelector(`fieldset[data-link="${tag}"]`);
  if (!targetFs) {
    addBtn.click();
    targetFs = container.querySelector("#iownersContainer fieldset:last-of-type");
    targetFs.dataset.link = tag;
  }

  const indexMatch = targetFs.id.match(/\d+$/);
  const prefix = `iowner${indexMatch}_`;
  fillTargetForm(targetFs, prefix, data);
}

function removeLinkedRoleEntry(directorFs, role) {
  const tag = "linkedFromDirector-" + directorFs.id;
  let selector = "";
  if (role === "subscriber") selector = "#isubscribersContainer";
  if (role === "owner") selector = "#iownersContainer";
  if (!selector) return;

  const container = document.querySelector(selector);
  const linked = container.querySelector(`fieldset[data-link="${tag}"]`);
  if (linked) linked.remove();
}

function fillTargetForm(targetFs, prefix, data) {
  targetFs.querySelectorAll("input, select").forEach(el => {
    const key = el.id.replace(prefix, "");
    for (const k in data) {
      if (key.toLowerCase().includes(k.toLowerCase())) {
        el.value = data[k];
      }
    }
  });
}


(function() {
  const Roles = {
    init() {
      const container = document.getElementById("idirectorsContainer");
      if (!container) return;
      setTimeout(Roles.addRoleSelectorsToAllDirectors, 300);
    },

    addRoleSelectorsToAllDirectors() {
      console.log("Adding role selectors...");
      // your existing role logic here
    },

    exampleHelper() {
      alert("Helper from roleselector");
    }
  };

  // Expose globally
  App.register("Roles", Roles);

  // Auto-run on DOM ready
  document.addEventListener("DOMContentLoaded", Roles.init);
})();
