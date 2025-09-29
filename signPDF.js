const pdfInput = document.getElementById("pdfUpload");
      const sigInput = document.getElementById("sigUpload");
      const container = document.getElementById("pdfContainer");
      const downloadBtn = document.getElementById("downloadBtn");
      const restoreBtn = document.getElementById("restoreBtn");


      let pdfBytesGlobal = null;
      let signatures = [];
      let sigSources = [];
      let currentSigSrc = null;
      let currentSigBytes = null;
      let lastRemoved = null;

      // Load PDF pages
      pdfInput.addEventListener("change", async () => {
        const file = pdfInput.files[0];
        if (!file) return;

        pdfBytesGlobal = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfBytesGlobal }).promise;
        const numPages = pdf.numPages;
        container.innerHTML = "";
        signatures = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const scale = 1.2; // ✅ keep scale stored
          const viewport = page.getViewport({ scale });

          const wrapper = document.createElement("div");
          wrapper.classList.add("pageWrapper");
          wrapper.dataset.pageNum = i;
          wrapper.dataset.scale = scale; // ✅ store scale on wrapper

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          wrapper.appendChild(canvas);

          container.appendChild(wrapper);
          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;

          wrapper.addEventListener("dblclick", (e) => {
            if (currentSigSrc) {
              const rect = wrapper.getBoundingClientRect();
              const x = e.clientX - rect.left - 75;
              const y = e.clientY - rect.top - 35;
              createSignatureInstance(currentSigSrc, x, y, 150, 75, wrapper);
            }
          });
        }
      });

      // Upload multiple signatures
      sigInput.addEventListener("change", async (e) => {
        sigSources = [];
        document.getElementById("sigPalette").innerHTML = "";

        for (const file of e.target.files) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const src = ev.target.result;
            sigSources.push({ src, file });

            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.onclick = () => {
              currentSigSrc = src;
              file.arrayBuffer().then((buf) => (currentSigBytes = buf));
            };
            document.getElementById("sigPalette").appendChild(thumb);
          };
          reader.readAsDataURL(file);
        }
      });

      function createSignatureInstance(src, x, y, w, h, wrapper) {
        const sigContainer = document.createElement("div");
        sigContainer.className = "sigContainer hiddenBorder";
        sigContainer.style.left = x + "px";
        sigContainer.style.top = y + "px";
        sigContainer.style.width = w + "px";
        sigContainer.style.height = h + "px";

        const sigImg = document.createElement("img");
        sigImg.className = "sigPreview";
        sigImg.src = src;
        sigContainer.appendChild(sigImg);

        ["nw", "ne", "sw", "se", "n", "s", "e", "w"].forEach((pos) => {
          const handle = document.createElement("div");
          handle.className = "resize-handle " + pos;
          handle.style.display = "none";
          sigContainer.appendChild(handle);
        });

        const controls = document.createElement("div");
        controls.className = "sigControls";
        controls.style.display = "none";

        const dupBtn = document.createElement("button");
        dupBtn.textContent = "Duplicate";
        const remBtn = document.createElement("button");
        remBtn.textContent = "Remove";
        controls.append(dupBtn, remBtn);
        sigContainer.appendChild(controls);

        wrapper.appendChild(sigContainer);

        const sigObj = {
          container: sigContainer,
          img: sigImg,
          x,
          y,
          w,
          h,
          pageNum: parseInt(wrapper.dataset.pageNum),
          canvas: wrapper.querySelector("canvas"),
        };
        signatures.push(sigObj);

        setupSignatureHandlers(sigObj, sigContainer);

        dupBtn.onclick = () =>
          createSignatureInstance(src, x + 20, y + 20, w, h, wrapper);

        remBtn.onclick = () => {
          lastRemoved = sigObj;
          signatures = signatures.filter((s) => s !== sigObj);
          sigContainer.remove();
        };

        sigContainer.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          document
            .querySelectorAll(".sigControls")
            .forEach((c) => (c.style.display = "none"));
          controls.style.display = "flex";
        });
        document.addEventListener("mousedown", (e) => {
          if (!sigContainer.contains(e.target)) controls.style.display = "none";
        });
      }

      function setupSignatureHandlers(sigObj, sigContainer) {
        let isDragging = false, offsetX, offsetY;
        sigContainer.addEventListener("mousedown", (e) => {
          if (e.target.classList.contains("resize-handle") || e.target.tagName === "BUTTON") return;
          isDragging = true;
          offsetX = e.offsetX;
          offsetY = e.offsetY;
        });
        document.addEventListener("mouseup", () => (isDragging = false));
        document.addEventListener("mousemove", (e) => {
          if (isDragging) {
            const rect = sigContainer.parentElement.getBoundingClientRect();
            sigObj.x = e.clientX - rect.left - offsetX;
            sigObj.y = e.clientY - rect.top - offsetY;
            sigContainer.style.left = sigObj.x + "px";
            sigContainer.style.top = sigObj.y + "px";
          }
        });

        let isResizing = false, currentHandle, startX, startY, startW, startH, startL, startT;
        sigContainer.querySelectorAll(".resize-handle").forEach((handle) => {
          handle.addEventListener("mousedown", (e) => {
            isResizing = true;
            currentHandle = e.target.classList[1];
            startX = e.clientX;
            startY = e.clientY;
            startW = sigContainer.offsetWidth;
            startH = sigContainer.offsetHeight;
            startL = sigContainer.offsetLeft;
            startT = sigContainer.offsetTop;
            e.stopPropagation();
          });
        });
        document.addEventListener("mouseup", () => (isResizing = false));
        document.addEventListener("mousemove", (e) => {
          if (!isResizing) return;
          let dx = e.clientX - startX, dy = e.clientY - startY;
          let w = startW, h = startH, x = sigObj.x, y = sigObj.y;
          if (currentHandle.includes("e")) w = startW + dx;
          if (currentHandle.includes("s")) h = startH + dy;
          if (currentHandle.includes("w")) { w = startW - dx; x = startL + dx; }
          if (currentHandle.includes("n")) { h = startH - dy; y = startT + dy; }
          if (w > 30) { sigContainer.style.width = w + "px"; sigObj.w = w; sigObj.x = x; }
          if (h > 30) { sigContainer.style.height = h + "px"; sigObj.h = h; sigObj.y = y; }
          sigContainer.style.left = sigObj.x + "px";
          sigContainer.style.top = sigObj.y + "px";
        });

        sigContainer.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          sigContainer.classList.toggle("hiddenBorder");
          const handles = sigContainer.querySelectorAll(".resize-handle");
          handles.forEach(
            (h) => (h.style.display = sigContainer.classList.contains("hiddenBorder") ? "none" : "block")
          );
        });
      }

      document.getElementById("restoreBtn").addEventListener("click", () => {
        if (!lastRemoved) {
          alert("No signature to restore");
          return;
        }
        createSignatureInstance(
          lastRemoved.img.src,
          lastRemoved.x,
          lastRemoved.y,
          lastRemoved.w,
          lastRemoved.h,
          lastRemoved.canvas.parentElement
        );
        lastRemoved = null;
      });


      

      // ✅ Download final signed PDF with correct positioning
   // Download final signed PDF
downloadBtn.addEventListener("click", async () => {
  if (!pdfBytesGlobal) {
    alert("Upload a PDF first");
    return;
  }

  try {
    const doc = await PDFLib.PDFDocument.load(pdfBytesGlobal);

    for (const sig of signatures) {
      const page = doc.getPage(sig.pageNum - 1);

      // Get PDF page size
      const { width: pdfW, height: pdfH } = page.getSize();

      // Get scale used when rendering this page
      const scale = parseFloat(sig.canvas.parentElement.dataset.scale);

      // Convert DOM coords back to PDF coords
      const pdfX = sig.x / scale;
      const pdfY = pdfH - (sig.y + sig.h) / scale;
      const pdfWsig = sig.w / scale;
      const pdfHsig = sig.h / scale;

      // Embed signature image
      const pngBytes = await fetch(sig.img.src).then((res) => res.arrayBuffer());
      const pngImage = await doc.embedPng(pngBytes);

      page.drawImage(pngImage, {
        x: pdfX,
        y: pdfY,
        width: pdfWsig,
        height: pdfHsig,
      });
    }

    const pdfBytesOut = await doc.save();
    const blob = new Blob([pdfBytesOut], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "signed.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Error while generating signed PDF:", err);
    alert("Something went wrong while creating the PDF. Check console.");
  }
});


