# Contact Form

This is a responsive contact form built using **HTML, CSS, and JavaScript**, with **EmailJS** for email functionality. The form allows users to submit messages directly via email.

## Features
- Fully **responsive** design
- **Gradient background** with a clean UI
- **Form validation** to prevent empty submissions
- **Dropdown selection** for email type
- **EmailJS integration** for sending messages

## Technologies Used
- HTML5
- CSS3 (Flexbox, Media Queries)
- JavaScript (EmailJS for email handling)


## Configuration
To enable email functionality, update the script in `index.html`:
1. Replace `YOUR_PUBLIC_KEY`, `YOUR_SERVICE_ID`, and `YOUR_TEMPLATE_ID` in:
   ```js
   emailjs.init("YOUR_PUBLIC_KEY");
   emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
   ```
2. Set up an **EmailJS account** and configure your service and template.


