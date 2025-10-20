(function () {
  const channel = new BroadcastChannel("formSync");

  // Mapping between form input IDs and preview page element selectors
  // You can now use class names instead of IDs
  const selectorMap = {
    icompanyName: ".companyName",
    iendWith: ".companyEndWith",
    iconstitutionType: ".constitutionType",
    ipresentedBy: ".presentedBy",
    ipresenterTin: ".presenterTin",
    iactivities: ".activities",
    icapital: ".statedCapital",

    iofficeGps: ".officeGps",
    iofficeLandmark: ".officeLandmark",
    iofficeHse: ".officeHse",
    iofficeTown: ".officeTown",
    iofficeStreetName: ".officeStreetName",
    iofficeCity: ".officeCity",
    iofficeDistrict: ".officeDistrict",
    iofficeRegion: ".officeRegion",
    iofficePostalType: ".officePostalType",
    iofficeBoxNumber: ".officeBoxNumber",
    iofficeBoxTown: ".officeBoxTown",
    iofficeBoxRegion: ".officeBoxRegion",
    iofficeContact1: ".officeContact1",
    iofficeContact2: ".officeContact2",
    iofficeEmail: ".officeEmail",

    isecQualification: ".secretaryQualification",

    isecTitle: ".secretaryTitle",
    isecFname: ".secretaryFirstName",
    isecMname: ".secretaryMiddleName",
    isecSname: ".secretaryLastName",
    isecFormer: ".secretaryFormerName",
    isecGender: ".secretaryGender",
    isecDob: ".secretaryDob",
    isecPob: ".secretaryPob",
    isecNation: ".secretaryNationality",
    isecOccupation: ".secretaryOccupation",
    isecContact1: ".secretaryContact1",
    isecContact2: ".secretaryContact2",
    isecEmail: ".secretaryEmail",
    isecTin: ".secretaryTin",
    isecGhanaCard: ".secretaryGhanaCard",
    isecResGps: ".secretaryResGps",
    isecResHse: ".secretaryResHse",
    isecResLandmark: ".secretaryResLandmark",
    isecResStreet: ".secretaryResStreet",
    isecResCity: ".secretaryResCity",
    isecResTown: ".secretaryResTown",
    isecResDistrict: ".secretaryResDistrict",
    isecResRegion: ".secretaryResRegion",

    isubscriberShares: ".subscriberTotalShares",

    isubscriber1_title: ".subscriber1Title",
    isubscriber1_fname: ".subscriber1FirstName",
    isubscriber1_mname: ".subscriber1MiddleName",
    isubscriber1_sname: ".subscriber1LastName",
    isubscriber1_former: ".subscriber1FormerName",
    isubscriber1_gender: ".subscriber1Gender",
    isubscriber1_dob: ".subscriber1Dob",
    isubscriber1_pob: ".subscriber1Pob",
    isubscriber1_nation: ".subscriber1Nationality",
    isubscriber1_occupation: ".subscriber1Occupation",
    isubscriber1_contact1: ".subscriber1Contact1",
    isubscriber1_contact2: ".subscriber1Contact2",
    isubscriber1_email: ".subscriber1Email",
    isubscriber1_tin: ".subscriber1Tin",
    isubscriber1_ghanaCard: ".subscriber1GhanaCard",
    isubscriber1_resGps: ".subscriber1ResGps",
    isubscriber1_resHse: ".subscriber1ResHse",
    isubscriber1_resLandmark: ".subscriber1ResLandmark",
    isubscriber1_resStreet: ".subscriber1ResStreet",
    isubscriber1_resCity: ".subscriber1ResCity",
    isubscriber1_resTown: ".subscriber1ResTown",
    isubscriber1_resDistrict: ".subscriber1ResDistrict",
    isubscriber1_resRegion: ".subscriber1ResRegion",
    isubscriber1_sharePercent: ".subscriber1SharePercent",

    iowner1_title: ".owner1Title",
    iowner1_fname: ".owner1FirstName",
    iowner1_mname: ".owner1MiddleName",
    iowner1_sname: ".owner1LastName",
    iowner1_former: ".owner1FormerName",
    iowner1_gender: ".owner1Gender",
    iowner1_dob: ".owner1Dob",
    iowner1_pob: ".owner1Pob",
    iowner1_nation: ".owner1Nationality",
    iowner1_occupation: ".owner1Occupation",
    iowner1_contact1: ".owner1Contact1",
    iowner1_contact2: ".owner1Contact2",
    iowner1_email: ".owner1Email",
    iowner1_tin: ".owner1Tin",
    iowner1_ghanaCard: ".owner1GhanaCard",
    iowner1_resGps: ".owner1ResGps",
    iowner1_resHse: ".owner1ResHse",
    iowner1_resLandmark: ".owner1ResLandmark",
    iowner1_resStreet: ".owner1ResStreet",
    iowner1_resCity: ".owner1ResCity",
    iowner1_resTown: ".owner1ResTown",
    iowner1_resDistrict: ".owner1ResDistrict",
    iowner1_resRegion: ".owner1ResRegion",
    iowner1_sharePercent: ".owner1SharePercent",

    idirector1_title: ".director1Title",
    idirector1_fname: ".director1FirstName",
    idirector1_mname: ".director1MiddleName",
    idirector1_sname: ".director1LastName",
    idirector1_former: ".director1FormerName",
    idirector1_gender: ".director1Gender",
    idirector1_dob: ".director1Dob",
    idirector1_pob: ".director1Pob",
    idirector1_nation: ".director1Nationality",
    idirector1_occupation: ".director1Occupation",
    idirector1_contact1: ".director1Contact1",
    idirector1_contact2: ".director1Contact2",
    idirector1_email: ".director1Email",
    idirector1_tin: ".director1Tin",
    idirector1_ghanaCard: ".director1GhanaCard",
    idirector1_resGps: ".director1ResGps",
    idirector1_resHse: ".director1ResHse",
    idirector1_resLandmark: ".director1ResLandmark",
    idirector1_resStreet: ".director1ResStreet",
    idirector1_resCity: ".director1ResCity",
    idirector1_resTown: ".director1ResTown",
    idirector1_resDistrict: ".director1ResDistrict",
    idirector1_resRegion: ".director1ResRegion"
  };

  // Listen for updates from the form page
  channel.onmessage = (event) => {
    const data = event.data;
    for (const key in data) {
      const selector = selectorMap[key] || `#${key}`; // fallback to ID if not mapped
      const elements = document.querySelectorAll(selector);

      elements.forEach(el => {
        el.textContent = data[key];
      });
    }
  };

  console.log("👀 Live preview (class-based) listening for updates...");
})();
