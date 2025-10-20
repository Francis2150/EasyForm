// handler.js - Fixed version
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

  function setCheckmark(id, checked) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = checked ? "\u2714" : ""; // checkmark
  }

  // Format date dd/mm/yyyy
  function nowDateString() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // Map the company-level fields ✅
 function fillCompany() {
  setText("companyName", val("icompanyName"));
  setText("companyName2", val("icompanyName"));
  setText("companyName3", val("icompanyName"));
  setText("companyName4", val("icompanyName"));
  setText("SecompanyName", val("icompanyName"));
  setText("FdirectorCompanyName", val("icompanyName"));
  setText("SdirectorCompanyName", val("icompanyName"));

  // end with: show the correct overlay✅
  const endWith = val("iendWith").toLowerCase();
  setText("endWithLTD", endWith === "ltd" ? "\u2714" : "");
  setText("endWithLIMITED", endWith === "limited" ? "\u2714" : "");

  // show a tick for registered vs standard: overlay IDs used earlier✅
  const constitution = val("iconstitutionType");
  setText("registeredCon", constitution === "Registered" ? "\u2714" : "");
  setText("standardCon", constitution === "Standard" ? "\u2714" : "");

  // the one presenting the company✅
  setText("presentedBy", val("ipresentedBy"));
  setText("presenterTIN", val("ipresenterTin"));
  setText("principalActivities", val("iactivities"));

  // Stated capital -> StatedCapital on page 7✅
  setText("StatedCapital", val("icapital") || "0");
  
  // ADD THESE LINES:
  setText("estimatedRevenue", val("iestimatedRevenue"));
  setText("numOfEmp", val("inumOfEmployees"));
}
  // Office mapping✅
  function fillOffice() {
    setText("officedigital-address", val("iofficeGps"));
    setText("officeLandmark", val("iofficeLandmark"));
    setText("officehousenumber", val("iofficeHse"));
    setText("officetown", val("iofficeTown"));
    setText("officeStreet", val("iofficeStreetName"));
    setText("officeCity", val("iofficeCity"));
    setText("officeDistrict", val("iofficeDistrict"));
    setText("officeRegion", val("iofficeRegion"));

    // Postal type fields:✅
    const postalType = val("iofficePostalType").toLowerCase();
    const boxNumber = val("iofficeBoxNumber");

    // Set checkmarks✅
    setText("emptyBox1", postalType === "pobox" ? "\u2714" : "");
    setText("emptyBox2", postalType === "pmb" ? "\u2714" : "");
    setText("emptyBox3", postalType === "dtd" ? "\u2714" : "");

    // Clear all number fields first✅
    setText("OfficeBoxNumber", "");
    setText("PMB", "");
    setText("DTD", "");

    // Place box number under the correct postal type✅
    if (postalType === "pobox") {
      setText("OfficeBoxNumber", boxNumber);
    } else if (postalType === "pmb") {
      setText("PMB", boxNumber);
    } else if (postalType === "dtd") {
      setText("DTD", boxNumber);
    }

    // Set other office info✅
    setText("OfficeBoxNumberTown", val("iofficeBoxTown"));
    setText("OfficeBoxNumberRegion", val("iofficeBoxRegion"));
    setText("OfficeContactOne", val("iofficeContact1"));
    setText("OfficeContactTwo", val("iofficeContact2"));
    setText("Officeemail", val("iofficeEmail"));
  }
