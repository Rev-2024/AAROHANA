// Wait for the HTML document to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle Functionality ---
    console.log("DOM loaded. Initializing scripts...");
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-navigation');
    if (menuToggle && mainNav) {
        // console.log("Menu toggle and navigation found."); // Less verbose
        menuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));
    } else {
        if (!menuToggle) console.error('Error: Menu toggle button (.menu-toggle) not found.');
        if (!mainNav) console.error('Error: Main navigation element (.main-navigation) not found.');
    }

    // Add this after menu toggle initialization
    const navLinks = document.querySelectorAll('.main-navigation a');
    if (navLinks && mainNav) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');  // Close mobile menu
                if (window.innerWidth <= 768) {  // Only scroll if on mobile
                    setTimeout(() => {
                        const targetId = link.getAttribute('href').split('#')[1];
                        if (targetId) {
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                targetElement.scrollIntoView({ behavior: 'smooth' });
                            }
                        }
                    }, 300);  // Small delay to allow menu to close
                }
            });
        });
    }

    // --- Countdown Timer Functionality ---
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        // *** IMPORTANT: SET YOUR ACTUAL FEST START DATE AND TIME ***
        const festStartDate = new Date("April 21, 2025 09:00:00").getTime(); // Example: March 21st, 2025 at 9 AM

        const countdownInterval = setInterval(() => { // Use setInterval directly
            const now = new Date().getTime();
            const distance = festStartDate - now;

            const daysSpan = document.getElementById('days');
            const hoursSpan = document.getElementById('hours');
            const minutesSpan = document.getElementById('minutes');
            const secondsSpan = document.getElementById('seconds');
            const timerWrapper = document.getElementById('countdown');
            const timerLaunchText = document.querySelector('.timer-launch-text');

            if (distance < 0) {
                clearInterval(countdownInterval);
                 if(timerWrapper) {
                     timerWrapper.innerHTML = "<div style='font-size: 1.8rem; color: var(--primary-color); font-family: var(--font-heading);'>AAROHANA 2K25 IS LIVE!</div>";
                 }
                 if(timerLaunchText) timerLaunchText.style.display = 'none';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Update HTML only if elements exist
            if(daysSpan) daysSpan.textContent = days < 10 ? '0' + days : days;
            if(hoursSpan) hoursSpan.textContent = hours < 10 ? '0' + hours : hours;
            if(minutesSpan) minutesSpan.textContent = minutes < 10 ? '0' + minutes : minutes;
            if(secondsSpan) secondsSpan.textContent = seconds < 10 ? '0' + seconds : seconds;
        }, 1000);

    } // End countdown check

    // --- Event Modal Functionality ---
    const eventCards = document.querySelectorAll('.event-card');
    const modal = document.getElementById('eventModal');
    const closeModalButton = document.querySelector('.modal-close-button');

    if (modal && closeModalButton && eventCards.length > 0) {
        const modalTitle = document.getElementById('modalEventTitle');
        const modalDate = document.getElementById('modalEventDate');
        const modalTime = document.getElementById('modalEventTime');
        const modalVenue = document.getElementById('modalEventVenue');
        const modalFee = document.getElementById('modalEventFee');
        const modalDescription = document.getElementById('modalEventDescription');
        const modalRulesLink = document.getElementById('modalEventRulesLink');
        const modalRegisterButton = document.getElementById('modalRegisterButton');

        function openModal(card) {
            if (!card || !modalTitle || !modalDate || !modalTime || !modalVenue || !modalFee || !modalDescription || !modalRulesLink || !modalRegisterButton) {
                console.error("Modal elements missing, cannot open.");
                return;
            }

            modalTitle.textContent = card.dataset.title || 'Event Details';
            modalDate.textContent = card.dataset.date || 'TBA';
            modalTime.textContent = card.dataset.time || 'TBA';
            modalVenue.textContent = card.dataset.venue || 'TBA';
            modalFee.textContent = card.dataset.fee || 'N/A';
            modalDescription.textContent = card.dataset.description || 'More details coming soon.';

            const rulesPath = card.dataset.rules;
            if (rulesPath && rulesPath.trim() !== '') {
                modalRulesLink.innerHTML = `<a href="${rulesPath}" target="_blank">View Rulebook</a>`; // Simpler text
                modalRulesLink.style.display = 'block';
            } else {
                modalRulesLink.innerHTML = '';
                modalRulesLink.style.display = 'none';
            }

            const eventParam = encodeURIComponent(card.dataset.title || '');
            modalRegisterButton.href = `register.html?event=${eventParam}`; // Update register link

            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
        }

        eventCards.forEach(card => card.addEventListener('click', () => openModal(card)));
        closeModalButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); }); // Close on overlay click
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('active')) closeModal(); }); // Close with Esc key

    } // End modal check

    // --- Registration Form Handling (Serverless Function Integration) ---
    const registrationForm = document.getElementById('main-registration-form');
    const feeCheckboxes = registrationForm ? registrationForm.querySelectorAll('.event-selection input[type="checkbox"]') : null;
    const totalFeeDisplay = document.getElementById('total-fee-display');
    const formSubmitButton = registrationForm ? registrationForm.querySelector('button[type="submit"]') : null;
    const paymentInfoParagraph = registrationForm ? registrationForm.querySelector('.payment-info p') : null;

    if (registrationForm && feeCheckboxes && feeCheckboxes.length > 0 && totalFeeDisplay && formSubmitButton && paymentInfoParagraph) {
        // console.log("Registration form elements found. Initializing handlers."); // Less verbose

        // --- Fee Calculation for Display ONLY ---
        function calculateTotalFeeDisplay() {
            let totalFee = 0;
            feeCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const fee = parseInt(checkbox.getAttribute('data-fee'), 10);
                    if (!isNaN(fee)) totalFee += fee;
                }
            });
            totalFeeDisplay.textContent = `₹${totalFee}`;
        }
        feeCheckboxes.forEach(checkbox => checkbox.addEventListener('change', calculateTotalFeeDisplay));
        calculateTotalFeeDisplay(); // Initial calculation

        // --- Form Submission Handler ---
        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            formSubmitButton.disabled = true;
            formSubmitButton.textContent = 'Submitting...';
            paymentInfoParagraph.textContent = 'Processing your registration... Please wait.';
            paymentInfoParagraph.style.color = '#555'; // Reset color

            const formData = new FormData(registrationForm);
            const data = {};
            const events = [];
            formData.forEach((value, key) => {
                 if (key === 'events[]') events.push(value); else data[key] = value.trim(); // Trim whitespace from inputs
            });

             if (events.length === 0) {
                 paymentInfoParagraph.textContent = 'Error: Please select at least one event.';
                 paymentInfoParagraph.style.color = 'red';
                 formSubmitButton.disabled = false;
                 formSubmitButton.textContent = 'Register Now';
                 return;
             }
            data.events = events;

            // *** IMPORTANT: REPLACE WITH YOUR DEPLOYED RENDER WEB SERVICE URL ***
            const apiUrl = 'YOUR_DEPLOYED_API_SERVICE_URL/api/register';
            // Example: const apiUrl = 'https://aarohana-api.onrender.com/api/register';

            // console.log("Submitting to:", apiUrl); // Keep for debugging if needed

            // Basic check if URL is still placeholder
             if (apiUrl.startsWith('YOUR_')) {
                 console.error("API URL is not configured in script.js!");
                 paymentInfoParagraph.textContent = 'Error: Registration system not configured. Please contact organizers.';
                 paymentInfoParagraph.style.color = 'red';
                 // Keep button disabled as it's a config issue
                 return;
             }

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    signal: AbortSignal.timeout(15000) // Add a 15-second timeout
                });

                const result = await response.json(); // Attempt to parse JSON regardless of status

                if (response.ok && result.success) {
                    // SUCCESS
                    paymentInfoParagraph.innerHTML = `<strong>Success!</strong> ${result.message || 'Registration successful!'} <br>Your Token: <strong>${result.token}</strong>`;
                    paymentInfoParagraph.style.color = result.fee > 0 ? 'darkorange' : 'green'; // Orange if fee > 0, Green if free/confirmed
                    registrationForm.reset(); // Clear the form
                    calculateTotalFeeDisplay(); // Reset fee display to 0
                    formSubmitButton.textContent = 'Registered!';
                    // Keep button disabled after success

                } else {
                    // ERROR from server (validation, duplicate, server issue)
                    console.error("API Error Response:", result);
                    paymentInfoParagraph.textContent = `Error: ${result.message || 'Registration failed. Please check details and try again.'}`;
                    paymentInfoParagraph.style.color = 'red';
                    formSubmitButton.disabled = false; // Re-enable button on error
                    formSubmitButton.textContent = 'Register Now';
                }

            } catch (error) {
                // NETWORK or TIMEOUT Error
                console.error('Network/Fetch Error:', error);
                let errorMsg = 'Error: Could not connect to the registration server.';
                if (error.name === 'TimeoutError') {
                    errorMsg = 'Error: Registration request timed out. Please try again later.';
                } else if (error.name === 'AbortError') { // Can also be AbortError for timeout
                     errorMsg = 'Error: Registration request timed out. Please try again later.';
                }
                else {
                     errorMsg += ' Please check your internet connection and try again.'
                }
                paymentInfoParagraph.textContent = errorMsg;
                paymentInfoParagraph.style.color = 'red';
                formSubmitButton.disabled = false; // Re-enable button
                formSubmitButton.textContent = 'Register Now';
            }
        });
    } // End registration form check

    // Add event filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    let activeFilters = {
        category: 'all',
        type: 'all',
        fee: 'all'
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state of buttons
            const filterGroup = this.parentElement;
            filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update active filters
            if (this.dataset.category) activeFilters.category = this.dataset.category;
            if (this.dataset.type) activeFilters.type = this.dataset.type;
            if (this.dataset.fee) activeFilters.fee = this.dataset.fee;

            // Filter events
            filterEvents();
        });
    });

    function filterEvents() {
        const events = document.querySelectorAll('.event-card');
        
        events.forEach(event => {
            const category = event.dataset.category;
            const type = event.dataset.type;
            const fee = event.dataset.fee === "FREE" ? "free" : "paid";

            const shouldShow = 
                (activeFilters.category === 'all' || category === activeFilters.category) &&
                (activeFilters.type === 'all' || type === activeFilters.type) &&
                (activeFilters.fee === 'all' || fee === activeFilters.fee);

            event.style.display = shouldShow ? 'block' : 'none';
        });
    }

}); // End of DOMContentLoaded listener