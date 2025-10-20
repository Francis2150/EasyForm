(function() {
  const Roles = {
    init() {
      const container = document.getElementById("idirectorsContainer");
      if (!container) return;

      // Wait for director fields to populate
      setTimeout(() => {
        Roles.addRoleSelectorsToAllDirectors();

        // Watch for changes in director list
        const observer = new MutationObserver(() => Roles.addRoleSelectorsToAllDirectors());
        observer.observe(container, { childList: true });
      }, 300);
    },

    addRoleSelectorsToAllDirectors() {
      console.log("Adding role selectors...");

      const directorFieldsets = document.querySelectorAll("#idirectorsContainer fieldset");

      directorFieldsets.forEach(fs => {
        if (fs.querySelector(".role-checkboxes")) return;

        const wrapper = document.createElement("div");
        wrapper.className = "role-checkboxes";
        wrapper.innerHTML = `
          <p class="role-prefix">This Director is also:</p>
          <div class="role-options">
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="only" checked> Director Only
            </label>
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="secretary"> Secretary
            </label>
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="subscriber"> Subscriber
            </label>
            <label class="role-label">
              <input type="checkbox" class="roleCheck" data-role="owner"> Beneficial Owner
            </label>
          </div>

          <!-- Secretary qualification -->
          <div class="qualificationBox hidden">
            <label>Qualification:</label>
            <select class="secQualification">
              <option value="">Select Qualification</option>
              <option>Tertiary level qualification</option>
              <option>Company Secretary Trainee</option>
              <option>Barrister or Solicitor in the Republic</option>
              <option>Institute of Chartered Accountants</option>
              <option>Under supervision of a qualified Company Secretary</option>
              <option>Institute of Chartered Secretaries and Administrators</option>
              <option>Professional qualification</option>
            </select>
          </div>

          <!-- Subscriber share -->
          <div class="sharePercentBox hidden">
            <label>Share %:</label>
            <input type="number" class="shareInput" min="0" max="100" placeholder="Enter share percentage">
          </div>

          <hr class="role-divider">
        `;

        const firstGroup = fs.querySelector(".form-group");
        fs.insertBefore(wrapper, firstGroup);

        wrapper.querySelectorAll(".roleCheck").forEach(cb => {
          cb.addEventListener("change", e => Roles.handleRoleChange(fs, e.target));
        });
      });
    },

    handleRoleChange(directorFs, checkbox) {
      const role = checkbox.dataset.role;
      const checked = checkbox.checked;
      const wrapper = checkbox.closest(".role-checkboxes");
      const shareBox = wrapper.querySelector(".sharePercentBox");
      const qualBox = wrapper.querySelector(".qualificationBox");
      const onlyBox = wrapper.querySelector('[data-role="only"]');

      if (role === "only" && checked) {
        wrapper.querySelectorAll(".roleCheck").forEach(cb => {
          if (cb.dataset.role !== "only") cb.checked = false;
        });
        shareBox.classList.add("hidden");
        qualBox.classList.add("hidden");
        return;
      }

      if (role !== "only" && checked) onlyBox.checked = false;

      if (role === "subscriber") shareBox.classList.toggle("hidden", !checked);
      if (role === "secretary") qualBox.classList.toggle("hidden", !checked);

      if (checked) Roles.copyDirectorDataToRole(directorFs, role, wrapper);
      else Roles.removeLinkedRoleEntry(directorFs, role);
    },

    copyDirectorDataToRole(directorFs, role, wrapper) {
      const dirIndex = directorFs.id.match(/\d+$/)?.[0] || "1";
      const prefix = `idirector${dirIndex}_`;

      const dirData = {};
      directorFs.querySelectorAll("input, select").forEach(el => {
        dirData[el.id.replace(prefix, "")] = el.value;
      });

      if (role === "subscriber") {
        dirData.sharePercent = wrapper.querySelector(".shareInput")?.value || "";
      }
      if (role === "secretary") {
        dirData.qualification = wrapper.querySelector(".secQualification")?.value || "";
      }

      switch (role) {
        case "secretary":
          Roles.fillSecretaryForm(dirData);
          break;
        case "subscriber":
          Roles.addOrFillSubscriber(dirData, directorFs);
          break;
        case "owner":
          Roles.addOrFillOwner(dirData, directorFs);
          break;
      }
    },

    fillSecretaryForm(data) {
      const prefix = "isec";
      document.querySelectorAll(`[id^=${prefix}]`).forEach(el => {
        const key = el.id.replace(prefix, "").toLowerCase();
        for (const k in data) {
          if (key.includes(k.toLowerCase())) el.value = data[k];
        }
      });
    },

    addOrFillSubscriber(data, directorFs) {
      const container = document.getElementById("isubscribersContainer");
      const addBtn = document.getElementById("iaddSubscriberBtn");
      const tag = "linkedFromDirector-" + directorFs.id;

      let targetFs = container.querySelector(`fieldset[data-link="${tag}"]`);
      if (!targetFs) {
        addBtn.click();
        targetFs = container.querySelector("#isubscribersContainer fieldset:last-of-type");
        targetFs.dataset.link = tag;
      }

      const index = targetFs.id.match(/\d+$/)?.[0];
      Roles.fillTargetForm(targetFs, `isubscriber${index}_`, data);
    },

    addOrFillOwner(data, directorFs) {
      const container = document.getElementById("iownersContainer");
      const addBtn = document.getElementById("iaddOwnerBtn");
      const tag = "linkedFromDirector-" + directorFs.id;

      let targetFs = container.querySelector(`fieldset[data-link="${tag}"]`);
      if (!targetFs) {
        addBtn.click();
        targetFs = container.querySelector("#iownersContainer fieldset:last-of-type");
        targetFs.dataset.link = tag;
      }

      const index = targetFs.id.match(/\d+$/)?.[0];
      Roles.fillTargetForm(targetFs, `iowner${index}_`, data);
    },

    removeLinkedRoleEntry(directorFs, role) {
      const tag = "linkedFromDirector-" + directorFs.id;
      const container =
        role === "subscriber"
          ? document.querySelector("#isubscribersContainer")
          : role === "owner"
          ? document.querySelector("#iownersContainer")
          : null;
      const linked = container?.querySelector(`fieldset[data-link="${tag}"]`);
      if (linked) linked.remove();
    },

    fillTargetForm(targetFs, prefix, data) {
      targetFs.querySelectorAll("input, select").forEach(el => {
        const key = el.id.replace(prefix, "").toLowerCase();
        for (const k in data) {
          if (key.includes(k.toLowerCase())) el.value = data[k];
        }
      });
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
