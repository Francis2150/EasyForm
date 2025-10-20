(function () {
  // Helper function to get the value or text content of an element by ID
  function val(id) {
    const el = document.getElementById(id);
    return el ? (el.value ?? el.textContent ?? "") : "";
  }

  // Helper function to set textContent of an element safely
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? "";
  }

  // Applies a ✓ mark to the appropriate title (MR, MRS, etc.) overlay field
  function applyTitleOverlay(prefix, title) {
    // Clear all possible title checkmarks first
    ["MR", "MRS", "MISS", "MS", "DR"].forEach(t => setText(`${prefix}tittle${t}`, ""));
    if (!title) return;

    // Normalize input (uppercase, remove periods)
    const t = title.trim().toUpperCase().replace(".", "");

    // Add checkmark to the matching title placeholder
    setText(`${prefix}tittle${t}`, "\u2714");
  }

  // Applies ✓ to correct gender field(s) (handles uppercase/lowercase variations)
  function applyGenderOverlay(prefix, gender) {
    const normalized = (gender || "").toLowerCase();

    // Clear all gender marks first
    ["GenderMale", "GenderFemale", "genderMale", "genderFemale"].forEach(s => setText(prefix + s, ""));

    // Apply checkmark based on gender
    if (normalized === "male") {
      setText(prefix + "GenderMale", "\u2714");
      setText(prefix + "genderMale", "\u2714");
    } else if (normalized === "female") {
      setText(prefix + "GenderFemale", "\u2714");
      setText(prefix + "genderFemale", "\u2714");
    }
  }

  // Populates overlay data for a given director (index 1 or 2)
  function fillDirector(index) {
    const overlay = index === 1 ? "D1" : "D2";
    const prefix = `idirector${index}_`;

    // Extract individual name parts
    const fname = val(prefix + "fname");
    const mname = val(prefix + "mname");
    const sname = val(prefix + "sname");
    const former = val(prefix + "former");

    // Construct full name
    const fullName = [fname, mname, sname, former].filter(Boolean).join(" ");

    // Apply to overlay fields
    setText(`${overlay}FirstName`, fname);
    setText(`${overlay}MiddleName`, mname);
    setText(`${overlay}LastName`, sname);
    setText(`${overlay}FormerName`, val(prefix + "former"));

    // Apply title and gender overlays
    applyTitleOverlay(overlay, val(prefix + "title"));
    applyGenderOverlay(overlay, val(prefix + "gender"));

    // Fill personal information
    setText(`${overlay}DOB`, val(prefix + "dob"));
    setText(`${overlay}POB`, val(prefix + "pob"));
    setText(`${overlay}Nationality`, val(prefix + "nation"));
    setText(`${overlay}Ocupation`, val(prefix + "occupation"));
    setText(`${overlay}PhoneNO1`, val(prefix + "contact1"));
    setText(`${overlay}PhoneNO2`, val(prefix + "contact2"));
    setText(`${overlay}Email`, val(prefix + "email"));
    setText(`${overlay}TIN`, val(prefix + "tin"));
    setText(`${overlay}GhanaCard`, val(prefix + "ghanaCard"));
    setText(`${overlay}DigitalAddress`, val(prefix + "resGps"));
    setText(`${overlay}housenumber`, val(prefix + "resHse"));
    setText(`${overlay}Landmark`, val(prefix + "resLandmark"));
    setText(`${overlay}StreetName`, val(prefix + "resStreet"));
    setText(`${overlay}City`, val(prefix + "resCity"));
    setText(`${overlay}town`, val(prefix + "resTown"));
    setText(`${overlay}District`, val(prefix + "resDistrict"));
    setText(`${overlay}Region`, val(prefix + "resRegion"));
    setText(`${overlay}Country`, val(prefix + "resCountry"));

    // Assign full name and signature fields
    if (index === 1) {
      setText("D1FullName", fullName);
      setText("directorName", fullName);
      setText("D1signature", fullName ? `Signed: ${fullName}` : "");
    } else if (index === 2) {
      setText("D2signature", fullName ? `Signed: ${fullName}` : "");
      setText("D2Signature", fullName ? `Signed: ${fullName}` : "");
    }

    // Common fields (possibly used elsewhere)
    setText("FdirectorFullName", fullName);
    setText("SdirectorFullName", fullName);
  }

  // Populates secretary overlay fields
  function fillSecretary() {
    const prefix = "isec";
    const fname = val(prefix + "Fname");
    const mname = val(prefix + "Mname");
    const sname = val(prefix + "Sname");
    const fullName = [fname, mname, sname].filter(Boolean).join(" ");

    // Basic info
    setText("SecFirstName", fname);
    setText("secMiddleName", mname);
    setText("secLastName", sname);
    setText("secFormerName", val(prefix + "Former"));
    setText("secTIN", val(prefix + "Tin"));
    setText("secGhanaCard", val(prefix + "GhanaCard"));

    // Title and gender
    applyTitleOverlay("sec", val(prefix + "Title"));
    applyGenderOverlay("sec", val(prefix + "Gender"));

    // Other details
    setText("secDOB", val(prefix + "Dob"));
    setText("secPOB", val(prefix + "Pob"));
    setText("secNationality", val(prefix + "Nation"));
    setText("secOccupation", val(prefix + "Occupation"));
    setText("secPhoneNO1", val(prefix + "Contact1"));
    setText("secPhoneNO2", val(prefix + "Contact2"));
    setText("secEmail", val(prefix + "Email"));
    setText("secDigitalAddress", val(prefix + "ResGps"));
    setText("secLandmark", val(prefix + "ResLandmark"));
    setText("sechousenumber", val(prefix + "ResHse"));
    setText("secTown", val(prefix + "ResTown"));
    setText("secStreetName", val(prefix + "ResStreet")); // Fixed typo
    setText("secCity", val(prefix + "ResCity"));
    setText("secDistrict", val(prefix + "ResDistrict"));
    setText("secRegion", val(prefix + "ResRegion"));
    setText("secCountry", val(prefix + "ResCountry"));

    // Signatures
    setText("SecSignature", fullName ? `Signed: ${fullName}` : "");
    setText("SecfullName", fullName);
  }

  // Populates subscriber overlay details (first 2 subscribers)
  function fillSubscribers() {
    const container = document.getElementById("isubscribersContainer");
    if (!container) return;

    const fieldsets = Array.from(container.querySelectorAll("fieldset"));
    for (let i = 0; i < 2; i++) {
      const fs = fieldsets[i];
      if (!fs) continue;

      const idx = fs.id.match(/\d+$/)?.[0];
      const prefix = `isubscriber${idx}_`;

      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const full = [fname, mname, sname].filter(Boolean).join(" ");
      const shares = val(prefix + "sharePercent");

      // Apply to overlay
      setText(`SH${i + 1}FirstName`, fname);
      setText(`SH${i + 1}MiddleName`, mname);
      setText(`SH${i + 1}LastName`, sname);
      setText(`SH${i + 1}FormerName`, val(prefix + "former"));
      setText(`SH${i + 1}TIN`, val(prefix + "tin"));
      setText(`SH${i + 1}GhanaCard`, val(prefix + "ghanaCard"));
      setText(`SH${i + 1}NoOfShare`, shares);
      setText(`SH${i + 1}ShareAmount`, shares);
      setText(`SH${i + 1}DigitalAddress`, val(prefix + "resGps"));
      setText(`SH${i + 1}Town`, val(prefix + "resTown"));
      setText(`SH${i + 1}housenumber`, val(prefix + "resHse"));
      setText(`SH${i + 1}Signature`, full ? `Signed: ${full}` : "");
    }
  }

  // Populates beneficial owner overlay details (up to 4 owners)
  function fillBeneficialOwners() {
    const container = document.getElementById("iownersContainer");
    if (!container) return;

    const fieldsets = Array.from(container.querySelectorAll("fieldset"));
    for (let i = 0; i < 4; i++) {
      const fs = fieldsets[i];
      if (!fs) continue;

      const idx = fs.id.match(/\d+$/)?.[0];
      const prefix = `iowner${idx}_`;
      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const full = [fname, mname, sname].filter(Boolean).join(" ");
      const share = val(prefix + "sharePercent");

      setText(`BO${i + 1}`, full);
      setText(`BO${i + 1}M`, share);
    }
  }

  // Optional role-linked entries (e.g. copying data between roles)
  function fillRoleLinkedEntries() {
    // This could copy director fields into secretary ones if needed
    fillSecretary();
  }

  // Main function: updates all overlays based on current input data
  function updateOverlayIndividuals() {
    const container = document.getElementById("idirectorsContainer");

    // Fill directors (1 or 2)
    if (container) {
      const directors = Array.from(container.querySelectorAll("fieldset"));
      if (directors.length >= 1) fillDirector(1);
      if (directors.length >= 2) fillDirector(2);
    }

    // Fill other roles
    fillSecretary();
    fillSubscribers();
    fillBeneficialOwners();
    fillRoleLinkedEntries();
  }

  // Initialize overlays once DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Initial updates (repeated to ensure overlays load properly)
    updateOverlayIndividuals();
    setTimeout(updateOverlayIndividuals, 250);
    setTimeout(updateOverlayIndividuals, 800);

    // Add event listeners to all relevant form fields
    const form = document.getElementById("icompanyForm");
    if (form) {
      form.querySelectorAll(
        "#idirectorsContainer input, #idirectorsContainer select, #idirectorsContainer textarea, " +
        "#isubscribersContainer input, #isubscribersContainer select, #isubscribersContainer textarea, " +
        "#iownersContainer input, #iownersContainer select, #iownersContainer textarea, " +
        "#isecretaryFormFields input, #isecretaryFormFields select, #isecretaryFormFields textarea"
      ).forEach(el => {
        // Re-run overlay updates on input or change
        el.addEventListener("input", updateOverlayIndividuals);
        el.addEventListener("change", updateOverlayIndividuals);
      });
    }
  });

  // Expose update function globally (for manual refresh)
  window.LLCOverlay = window.LLCOverlay || {};
  window.LLCOverlay.updateIndividuals = updateOverlayIndividuals;
})();
