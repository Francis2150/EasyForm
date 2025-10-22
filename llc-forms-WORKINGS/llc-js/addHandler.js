// additionalHandlers.js
(function() {
  // Safe helper: get element value (returns empty string if not found)
  function val(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return el.value ?? el.textContent ?? "";
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text ?? "";
  }

  // Apply title overlay (MR, MRS, etc.)
  function applyTitleOverlay(prefix, titleValue) {
    const titles = ["MR", "MRS", "MISS", "MS", "DR"];
    titles.forEach(t => {
      const id = `${prefix}tittle${t}`;
      setText(id, "");
    });

    if (!titleValue) return;
    const normalized = titleValue.trim().toUpperCase();
    // Normalize title values
    let key = normalized;
    if (key === "MRS" || key === "MRS.") key = "MRS";
    if (key === "MISS") key = "MISS";
    if (key === "DR" || key === "DR.") key = "DR";
    const targetId = `${prefix}tittle${key}`;
    setText(targetId, "\u2714");
  }

  // Apply gender overlay (male/female checkboxes)
  function applyGenderOverlay(prefix, genderValue) {
    // Clear all gender checkboxes first
    setText(prefix + "GenderMale", "");
    setText(prefix + "GenderFemale", "");
    setText(prefix + "genderMale", "");
    setText(prefix + "genderFemale", "");
    
    const normalized = (genderValue || "").toLowerCase();
    if (normalized === "male") {
      setText(prefix + "GenderMale", "\u2714");
      setText(prefix + "genderMale", "\u2714");
    } else if (normalized === "female") {
      setText(prefix + "GenderFemale", "\u2714");
      setText(prefix + "genderFemale", "\u2714");
    }
  }

  // Parse date from various formats (YYYY-MM-DD or DD/MM/YYYY)
  function parseDate(dateString) {
    if (!dateString) return { day: "", month: "", year: "" };
    
    let day, month, year;
    
    if (dateString.includes('-')) {
      // YYYY-MM-DD format
      const parts = dateString.split('-');
      if (parts.length === 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }
    } else if (dateString.includes('/')) {
      // DD/MM/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    }
    
    return { day, month, year };
  }

  // Fill additional directors (D3, D4, etc.)
  function fillAdditionalDirectors() {
    const directorsContainer = document.getElementById("idirectorsContainer");
    if (!directorsContainer) return;
    
    const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
    
    // Start from index 3 (since D1 and D2 are handled in the main handler)
    for (let i = 3; i <= directors.length; i++) {
      const overlayPrefix = `D${i}`;
      const formPrefix = `idirector${i}_`;

      // Read form fields
      const fname = val(formPrefix + "fname");
      const mname = val(formPrefix + "mname");
      const sname = val(formPrefix + "sname");
      const former = val(formPrefix + "former");
      const title = val(formPrefix + "title");
      const gender = val(formPrefix + "gender");
      const dob = val(formPrefix + "dob");
      const pob = val(formPrefix + "pob");
      const nation = val(formPrefix + "nation");
      const occupation = val(formPrefix + "occupation");
      const phone1 = val(formPrefix + "contact1");
      const phone2 = val(formPrefix + "contact2");
      const email = val(formPrefix + "email");
      const tin = val(formPrefix + "tin");
      const ghanaCard = val(formPrefix + "ghanaCard");

      // Residential address
      const resGps = val(formPrefix + "resGps");
      const resHse = val(formPrefix + "resHse");
      const resLandmark = val(formPrefix + "resLandmark");
      const resStreet = val(formPrefix + "resStreet");
      const resCity = val(formPrefix + "resCity");
      const resTown = val(formPrefix + "resTown");
      const resDistrict = val(formPrefix + "resDistrict");
      const resRegion = val(formPrefix + "resRegion");
      const resCountry = val(formPrefix + "resCountry");
      const fullName = [fname, mname, sname].filter(Boolean).join(" ");

      // Apply to overlay elements
      setText(`${overlayPrefix}FirstName`, fname);
      setText(`${overlayPrefix}MiddleName`, mname);
      setText(`${overlayPrefix}LastName`, sname);
      setText(`${overlayPrefix}FormerName`, former);
      applyTitleOverlay(overlayPrefix, title);
      applyGenderOverlay(overlayPrefix, gender);
      setText(`${overlayPrefix}DOB`, dob);
      setText(`${overlayPrefix}POB`, pob);
      setText(`${overlayPrefix}Nationality`, nation);
      setText(`${overlayPrefix}Ocupation`, occupation);
      setText(`${overlayPrefix}PhoneNO1`, phone1);
      setText(`${overlayPrefix}PhoneNO2`, phone2);
      setText(`${overlayPrefix}Email`, email);
      setText(`${overlayPrefix}TIN`, tin);
      setText(`${overlayPrefix}GhanaCard`, ghanaCard);

      // Residential address
      setText(`${overlayPrefix}DigitalAddress`, resGps);
      setText(`${overlayPrefix}housenumber`, resHse);
      setText(`${overlayPrefix}Landmark`, resLandmark);
      setText(`${overlayPrefix}StreetName`, resStreet);
      setText(`${overlayPrefix}City`, resCity);
      setText(`${overlayPrefix}town`, resTown);
      setText(`${overlayPrefix}District`, resDistrict);
      setText(`${overlayPrefix}Region`, resRegion);
      setText(`${overlayPrefix}Country`, resCountry);

      // Signature
      setText(`${overlayPrefix}signature`, fullName ? `Signed: ${fullName}` : "");
    }
  }

  // Fill additional subscribers (SH3, SH4, etc.)
  function fillAdditionalSubscribers() {
    const container = document.getElementById("isubscribersContainer");
    if (!container) return;
    const fieldsets = Array.from(container.querySelectorAll("fieldset"));

    // Start from index 3 (since SH1 and SH2 are handled in the main handler)
    for (let i = 2; i < fieldsets.length; i++) {
      const fs = fieldsets[i];
      if (!fs) continue;

      const idx = fs.id.match(/\d+$/)?.[0];
      const prefix = `isubscriber${idx}_`;
      const overlayPrefix = `SH${i+1}`;

      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const former = val(prefix + "former");
      const title = val(prefix + "title");
      const gender = val(prefix + "gender");
      const dob = val(prefix + "dob");
      const pob = val(prefix + "pob");
      const nation = val(prefix + "nation");
      const occupation = val(prefix + "occupation");
      const full = [fname, mname, sname].filter(Boolean).join(" ");
      const tin = val(prefix + "tin");
      const gh = val(prefix + "ghanaCard");
      const shares = val(prefix + "sharePercent") || val("isubscriberShares") || "";
      const address = val(prefix + "resStreet") + " " + val(prefix + "resTown");

      // Map everything
      setText(`${overlayPrefix}FirstName`, fname);
      setText(`${overlayPrefix}MiddleName`, mname);
      setText(`${overlayPrefix}LastName`, sname);
      setText(`${overlayPrefix}FormerName`, former);
      applyTitleOverlay(overlayPrefix, title);
      applyGenderOverlay(overlayPrefix, gender);
      setText(`${overlayPrefix}DOB`, dob);
      setText(`${overlayPrefix}POB`, pob);
      setText(`${overlayPrefix}Nationality`, nation);
      setText(`${overlayPrefix}Occupation`, occupation);
      setText(`${overlayPrefix}TIN`, tin);
      setText(`${overlayPrefix}GhanaCard`, gh);
      setText(`${overlayPrefix}Address`, address);
      setText(`${overlayPrefix}NoOfShare`, shares);
      setText(`${overlayPrefix}ShareAmount`, shares);
      setText(`${overlayPrefix}DigitalAddress`, val(prefix + "resGps"));
      setText(`${overlayPrefix}Landmark`, val(prefix + "resLandmark"));
      setText(`${overlayPrefix}StreetName`, val(prefix + "resStreet"));
      setText(`${overlayPrefix}Town`, val(prefix + "resTown"));
      setText(`${overlayPrefix}housenumber`, val(prefix + "resHse"));
      setText(`${overlayPrefix}Signature`, full ? `Signed: ${full}` : "");
    }
  }

  // Fill additional beneficial owners (BO5, BO6, etc.)
  function fillAdditionalBeneficialOwners() {
    const container = document.getElementById("iownersContainer");
    if (!container) return;
    const fieldsets = Array.from(container.querySelectorAll("fieldset"));

    // Start from index 5 (since BO1-BO4 are handled in the main handler)
    for (let i = 4; i < fieldsets.length; i++) {
      const fs = fieldsets[i];
      const num = i + 1;
      // Prefix for overlay elements
      const prefix = `owner${num}`;
      
      if (!fs) continue;
      
      const idx = fs.id.match(/\d+$/)?.[0];
      const formPrefix = `iowner${idx}_`;
      
      // Get all the form values
      const fname = val(formPrefix + "fname");
      const mname = val(formPrefix + "mname");
      const sname = val(formPrefix + "sname");
      const former = val(formPrefix + "former");
      const dob = val(formPrefix + "dob");
      const pob = val(formPrefix + "pob");
      const nationality = val(formPrefix + "nation");
      const address1 = val(formPrefix + "resHse") + ", " + val(formPrefix + "resStreet")+ ", " + val(formPrefix + "resCity")+ ", " + val(formPrefix + "resCountry");
      const address2 = val("iofficeHse") + ", " + val("iofficeStreetName") + ", " + val("iofficeCity") + ", " + val(formPrefix + "resCountry");
      const gps = val(formPrefix + "resGps");
      const tin = val(formPrefix + "tin");
      const phone = val(formPrefix + "contact1");
      const email = val(formPrefix + "email");
      const ghanaCard = val(formPrefix + "ghanaCard");
      
      // Determine the role of this person (director, secretary, or both)
      const ownerFullName = [fname, mname, sname].filter(Boolean).join(" ");
      let role = "";
      
      // Check if this owner is also a director
      const directorsContainer = document.getElementById("idirectorsContainer");
      if (directorsContainer) {
        const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
        for (let j = 0; j < directors.length; j++) {
          const directorIdx = directors[j].id.match(/\d+$/)?.[0] || "1";
          const directorPrefix = `idirector${directorIdx}_`;
          const directorFullName = [val(directorPrefix + "fname"), val(directorPrefix + "mname"), val(directorPrefix + "sname")].filter(Boolean).join(" ");
          
          if (directorFullName === ownerFullName) {
            role = "Director";
            break;
          }
        }
      }
      
      // Check if this owner is also the secretary
      const secretaryFullName = [val("isecFname"), val("isecMname"), val("isecSname")].filter(Boolean).join(" ");
      if (secretaryFullName === ownerFullName) {
        role = role ? role + " & Secretary" : "Secretary";
      }
      
      // If no role found, use the occupation
      if (!role) {
        role = val(formPrefix + "occupation");
      }
      
      // Use the role instead of occupation in placeOfWork
      const placeOfWork = val(formPrefix + "resCity") + ", " + role;
      
      const directPercent = val(formPrefix + "directPercent");
      const votingRights = val(formPrefix + "votingRights");
      const indirectPercent = val(formPrefix + "indirectPercent");
      
      // Map to overlay elements
      setText(`${prefix}FirstName`, fname);
      setText(`${prefix}Surname`, sname);
      
      // Combine middle name and former name into a single string
      const nameParts = [mname, former].filter(Boolean);
      const combinedMiddleAndFormer = nameParts.join(' ');
      setText(`${prefix}MiddleName`, combinedMiddleAndFormer);
      
      setText(`${prefix}DOB`, dob);
      setText(`${prefix}Nationality`, nationality);
      setText(`${prefix}POB`, pob);
      setText(`${prefix}Address1`, address1);
      setText(`${prefix}Address2`, address2);
      setText(`${prefix}GPS`, gps);
      setText(`${prefix}Tin`, tin);
      setText(`${prefix}PhoneNumber`, phone);
      setText(`${prefix}Email`, email);
      setText(`${prefix}GhNumber`, ghanaCard);
      setText(`${prefix}PlaceOfWork`, placeOfWork);
      setText(`${prefix}Directpercent`, directPercent);
      setText(`${prefix}votinRight`, votingRights);
      setText(`${prefix}votinRight2`, votingRights);
      setText(`${prefix}Indirectpercent`, indirectPercent);
    }
  }

  // Fill additional director declarations
  function fillAdditionalDirectorDeclarations() {
    const directorsContainer = document.getElementById("idirectorsContainer");
    if (!directorsContainer) return;
    
    const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
    
    // Handle third director declaration and beyond
    for (let i = 3; i <= directors.length; i++) {
      const prefix = `idirector${i}_`;
      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const fullName = [fname, mname, sname].filter(Boolean).join(" ");
      
      // Full name fields
      setText(`Ddirector${i}FullName1`, fullName);
      setText(`Ddirector${i}FullName2`, fullName);
      setText(`Ddirector${i}FullName3`, fullName);
      
      // Address components
      setText(`Ddirector${i}HouseNumber`, val(prefix + "resHse"));
      setText(`Ddirector${i}Landmark`, val(prefix + "resLandmark"));
      setText(`Ddirector${i}StreetName`, val(prefix + "resStreet"));
      
      // Combine city and town
      const city = val(prefix + "resCity");
      const town = val(prefix + "resTown");
      setText(`Ddirector${i}Town&City`, city && town ? `${city}, ${town}` : city || town);
      
      // Date components - handle both YYYY-MM-DD and DD/MM/YYYY formats
      const dob = val(prefix + "dob");
      if (dob) {
        const { day, month, year } = parseDate(dob);
        setText(`DayOfdeclaration${i}`, day);
        setText(`MonthOfdeclaration${i}`, month);
        setText(`YearOfdeclaration${i}`, year);
      }
    }
  }

  // Fill additional consent letters
  function fillAdditionalConsentLetters() {
    // Helper function to create combined postal address
    function getCombinedPostalAddress() {
      const boxNumber = val("iofficeBoxNumber");
      const boxTown = val("iofficeBoxTown");
      const boxRegion = val("iofficeBoxRegion");
      
      const parts = [boxNumber, boxTown, boxRegion].filter(Boolean);
      return parts.join(", ");
    }
    
    const directorsContainer = document.getElementById("idirectorsContainer");
    if (!directorsContainer) return;
    
    const directors = Array.from(directorsContainer.querySelectorAll("fieldset"));
    
    // Handle third director consent letter and beyond
    for (let i = 3; i <= directors.length; i++) {
      const prefix = `idirector${i}_`;
      const fname = val(prefix + "fname");
      const mname = val(prefix + "mname");
      const sname = val(prefix + "sname");
      const fullName = [fname, mname, sname].filter(Boolean).join(" ");
      
      if (fullName) {
        setText(`L${i}directorFullName`, fullName);
        setText(`${i}directorResidentialAddress`, 
          val(prefix + "resHse") + ", " + 
          val(prefix + "resStreet") + ", " + 
          val(prefix + "resCity")
        );
        // Use combined postal address instead of just house number
        setText(`${i}directorBoxNumber`, getCombinedPostalAddress());
        setText(`${i}directorPhoneNumber`, val(prefix + "contact1"));
      }
    }
  }

  // General updates: called on input/change/mutation
  function updateAdditionalOverlay() {
    fillAdditionalDirectors();
    fillAdditionalSubscribers();
    fillAdditionalBeneficialOwners();
    fillAdditionalDirectorDeclarations();
    fillAdditionalConsentLetters();
  }

  // Attach event listeners to all form inputs to trigger updateAdditionalOverlay
  function attachAdditionalListeners() {
    // All relevant form inputs
    const form = document.getElementById("icompanyForm");
    if (!form) {
      console.warn("Form with id icompanyForm not found in DOM when wiring additional overlay update listeners.");
    } else {
      form.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("input", updateAdditionalOverlay);
        el.addEventListener("change", updateAdditionalOverlay);
      });
    }

    // Dynamic container observers: directors, subscribers, owners
    const observeContainer = id => {
      const container = document.getElementById(id);
      if (!container) return;
      const obs = new MutationObserver(mutations => {
        // Small delay allowing scripts that create elements to run
        setTimeout(updateAdditionalOverlay, 80);
        // Also rewire new inputs inside newly created fieldsets
        mutations.forEach(m => {
          m.addedNodes?.forEach(node => {
            if (node.nodeType === 1) {
              node.querySelectorAll?.("input, select, textarea").forEach(el => {
                el.addEventListener("input", updateAdditionalOverlay);
                el.addEventListener("change", updateAdditionalOverlay);
              });
              // Check for role-checkboxes added - attach change handler
              node.querySelectorAll?.(".roleCheck").forEach(cb => {
                cb.addEventListener("change", () => {
                  setTimeout(updateAdditionalOverlay, 40);
                });
              });
            }
          });
        });
      });
      obs.observe(container, { childList: true, subtree: true });
    };

    observeContainer("idirectorsContainer");
    observeContainer("isubscribersContainer");
    observeContainer("iownersContainer");

    // Quick update if roles toggled
    document.addEventListener("click", e => {
      if (e.target && (e.target.classList?.contains("roleCheck") || e.target.closest?.(".role-checkboxes"))) {
        setTimeout(updateAdditionalOverlay, 50);
      }
    });

    // Update overlay on initial load
    updateAdditionalOverlay();
  }

  // Run on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    attachAdditionalListeners();
    // Ensure a final run in case other scripts populate values after DOMContentLoaded
    setTimeout(updateAdditionalOverlay, 250);
    setTimeout(updateAdditionalOverlay, 800);
  });

  // Expose a small API in case you want to trigger update from other modules
  window.AdditionalLLCOverlay = {
    update: updateAdditionalOverlay
  };
})();