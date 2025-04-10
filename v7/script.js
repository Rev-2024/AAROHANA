// Wait for the HTML document to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle Functionality ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-navigation');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));
    } else {
        if (!menuToggle) console.error('Error: Menu toggle button (.menu-toggle) not found.');
        if (!mainNav) console.error('Error: Main navigation element (.main-navigation) not found.');
    }

    // Close mobile menu on link click and scroll (if mobile)
    const navLinks = document.querySelectorAll('.main-navigation a');
    if (navLinks && mainNav) {
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                const isExternal = link.getAttribute('target') === '_blank';
                const href = link.getAttribute('href');
                const isInternalNav = href && href.startsWith('#') || (href && !href.includes('://') && !href.startsWith('mailto:') && !href.startsWith('tel:'));

                if (!isExternal && isInternalNav) {
                    mainNav.classList.remove('active');
                    if (window.innerWidth <= 768) {
                        const targetId = href.split('#')[1];
                        if (targetId) {
                            event.preventDefault();
                            setTimeout(() => {
                                const targetElement = document.getElementById(targetId);
                                if (targetElement) {
                                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }, 250);
                        }
                    }
                }
            });
        });
    }

    // --- Countdown Timer Functionality (If on index.html) ---
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const festStartDate = new Date("April 26, 2025 09:00:00").getTime();
        const countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = festStartDate - now;
            const daysSpan = document.getElementById('days');
            const hoursSpan = document.getElementById('hours');
            const minutesSpan = document.getElementById('minutes');
            const secondsSpan = document.getElementById('seconds');
            const timerWrapper = countdownElement; // Use the element itself
            const timerLaunchText = document.querySelector('.timer-launch-text');

            if (distance < 0) {
                clearInterval(countdownInterval);
                if(timerWrapper && timerWrapper.querySelector('#days')) { // Check content before replacing
                    timerWrapper.innerHTML = "<div style='font-size: 1.8rem; color: var(--primary-color); font-family: var(--font-heading);'>AAROHANA 2K25 IS LIVE!</div>";
                }
                if(timerLaunchText) timerLaunchText.style.display = 'none';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if(daysSpan) daysSpan.textContent = days < 10 ? '0' + days : days.toString();
            if(hoursSpan) hoursSpan.textContent = hours < 10 ? '0' + hours : hours.toString();
            if(minutesSpan) minutesSpan.textContent = minutes < 10 ? '0' + minutes : minutes.toString();
            if(secondsSpan) secondsSpan.textContent = seconds < 10 ? '0' + seconds : seconds.toString();
        }, 1000);
    } // End countdown check


    // --- Event Modal Functionality (If on events.html) ---
    const eventCards = document.querySelectorAll('.event-card');
    const modal = document.getElementById('eventModal');
    const closeModalButton = modal ? modal.querySelector('.modal-close-button') : null;

    if (modal && closeModalButton && eventCards.length > 0) {
        // Select modal elements safely
        const modalTitle = document.getElementById('modalEventTitle');
        const modalDate = document.getElementById('modalEventDate');
        const modalTime = document.getElementById('modalEventTime');
        const modalVenue = document.getElementById('modalEventVenue');
        const modalFee = document.getElementById('modalEventFee');
        const modalDescription = document.getElementById('modalEventDescription');
        const modalRulesLinkDiv = document.getElementById('modalEventRulesLink'); // Get the div container
        const modalRegisterButton = document.getElementById('modalRegisterButton'); // ****** Get the register button ******

        function openModal(card) {
             // Check if essential modal elements exist
            if (!card || !modalTitle || !modalDate || !modalTime || !modalVenue || !modalFee || !modalDescription || !modalRulesLinkDiv || !modalRegisterButton) {
                console.error("Modal elements missing, cannot open.");
                return;
            }

            // Populate general modal content
            modalTitle.textContent = card.dataset.title || 'Event Details';
            modalDate.textContent = card.dataset.date || 'TBA';
            modalTime.textContent = card.dataset.time || 'TBA';
            modalVenue.textContent = card.dataset.venue || 'TBA';
            modalFee.textContent = card.dataset.fee || 'N/A';
            modalDescription.textContent = card.dataset.description || 'More details coming soon.';

            // Handle Rulebook Link
            const rulesPath = card.dataset.rules;
            modalRulesLinkDiv.innerHTML = ''; // Clear previous rules link
            if (rulesPath && rulesPath.trim() !== '') {
                 // Create new link if rules exist
                 modalRulesLinkDiv.innerHTML = `<a href="${rulesPath}" class="button button-secondary" target="_blank"><i class="fas fa-book"></i> View Rulebook</a>`;
                 modalRulesLinkDiv.style.display = 'block';
            } else {
                 modalRulesLinkDiv.style.display = 'none'; // Hide if no rules
            }

            // ****** Handle Konfhub Link ******
            const konfhubLink = card.dataset.konfhubLink;
            if (konfhubLink && konfhubLink.trim() !== '') {
                modalRegisterButton.href = konfhubLink; // Set the button's link
                modalRegisterButton.style.display = 'block'; // Make sure button is visible
            } else {
                // If no specific Konfhub link for this event (e.g., free audition, faculty event)
                modalRegisterButton.style.display = 'none'; // Hide the register button
                // Alternatively, you could link to a general page:
                // modalRegisterButton.href = 'YOUR_GENERAL_KONFHUB_EVENT_PAGE_LINK';
                // modalRegisterButton.style.display = 'block';
            }
            // **********************************

            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        function closeModal() {
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scroll
            }
        }

        // Add event listeners
        eventCards.forEach(card => {
            card.addEventListener('click', (e) => {
                 if (e.target.tagName !== 'A') {
                     openModal(card);
                 }
            });
        });

        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

    } // End modal check

}); // End of DOMContentLoaded listener