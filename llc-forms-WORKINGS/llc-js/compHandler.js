(function () {
  function val(id) {
    const el = document.getElementById(id);
    return el ? (el.value ?? el.textContent ?? "") : "";
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? "";
  }

  function nowDateString() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }

  function fillCompany() {
    const name = val("icompanyName");
    ["companyName", "companyName2", "companyName3", "companyName4", "SecompanyName", "FdirectorCompanyName", "SdirectorCompanyName"].forEach(id => setText(id, name));

    const endWith = val("iendWith").toLowerCase();
    setText("endWithLTD", endWith === "limited" ? "\u2714" : "");
    setText("endWithLIMITED", endWith === "ltd" ? "\u2714" : "");

    const constitution = val("iconstitutionType");
    setText("registeredCon", constitution === "Registered" ? "\u2714" : "");
    setText("standardCon", constitution === "Standard" ? "\u2714" : "");

    setText("presentedBy", val("ipresentedBy"));
    setText("presenterTIN", val("ipresenterTin"));
    setText("principalActivities", val("iactivities"));
    setText("StatedCapital", val("icapital") || "0");
  }

  function fillOffice() {
    setText("officedigital-address", val("iofficeGps"));
    setText("officeLandmark", val("iofficeLandmark"));
    setText("officehousenumber", val("iofficeHse"));
    setText("officetown", val("iofficeTown"));
    setText("officeStreet", val("iofficeStreetName"));
    setText("officeCity", val("iofficeCity"));
    setText("officeDistrict", val("iofficeDistrict"));
    setText("officeRegion", val("iofficeRegion"));

    const postalType = val("iofficePostalType").toLowerCase();
    const boxNumber = val("iofficeBoxNumber");

    setText("emptyBox1", postalType === "pobox" ? "\u2714" : "");
    setText("emptyBox2", postalType === "pmb" ? "\u2714" : "");
    setText("emptyBox3", postalType === "dtd" ? "\u2714" : "");

    setText("OfficeBoxNumber", "");
    setText("PMB", "");
    setText("DTD", "");

    if (postalType === "pobox") setText("OfficeBoxNumber", boxNumber);
    else if (postalType === "pmb") setText("PMB", boxNumber);
    else if (postalType === "dtd") setText("DTD", boxNumber);

    setText("OfficeBoxNumberTown", val("iofficeBoxTown"));
    setText("OfficeBoxNumberRegion", val("iofficeBoxRegion"));
    setText("OfficeContactOne", val("iofficeContact1"));
    setText("OfficeContactTwo", val("iofficeContact2"));
    setText("Officeemail", val("iofficeEmail"));
  }

  function updateOverlayCompanyOffice() {
    fillCompany();
    fillOffice();

    // Update dates
    const today = nowDateString();
    ["date1", "date2", "date3", "date4", "date5", "date6", "date7", "date8", "date9", "date10", "date11", "date3"].forEach(id => setText(id, today));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("icompanyForm");
    if (form) {
      form.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("input", updateOverlayCompanyOffice);
        el.addEventListener("change", updateOverlayCompanyOffice);
      });
    }

    updateOverlayCompanyOffice();
    setTimeout(updateOverlayCompanyOffice, 250);
    setTimeout(updateOverlayCompanyOffice, 800);
  });

  window.LLCOverlay = window.LLCOverlay || {};
  window.LLCOverlay.updateCompanyOffice = updateOverlayCompanyOffice;
})();
