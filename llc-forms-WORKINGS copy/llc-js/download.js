document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("download-btn").addEventListener("click", async () => {
    const element = document.body;
    const buttonContainer = document.querySelector(".button-container");
    const sect1 = document.getElementById("sect1");

    buttonContainer.style.display = "none";
    sect1.style.display = "none";

    // ✅ Scroll to top before capturing
    window.scrollTo(0, 0);

    // Wait a short moment to let browser repaint
    await new Promise(resolve => setTimeout(resolve, 300));

    const options = {
      margin: 0,
      filename: 'form.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        buttonContainer.style.display = "block";
        sect1.style.display = "block";
      })
      .catch(err => {
        console.error("PDF generation error:", err);
        buttonContainer.style.display = "block";
        sect1.style.display = "block";
      });
  });
});
