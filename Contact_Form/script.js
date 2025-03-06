(function () {
    emailjs.init("YOUR_PUBLIC_KEY");
  })();

  document
    .getElementById("contactForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const templateParams = {
        to_name: "Your Name",
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
      };

      emailjs
        .send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
        .then(
          (response) => {
            alert("Message Sent Successfully!");
            document.getElementById("contactForm").reset();
          },
          (error) => {
            alert("Failed to Send Message. Try Again.");
            console.error("EmailJS Error:", error);
          }
        );
    });