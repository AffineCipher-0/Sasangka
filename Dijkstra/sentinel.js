document.addEventListener('DOMContentLoaded', () => {
    
    // --- Cached DOM elements ---
    const loader = document.getElementById('loader');
    const openBookBtn = document.getElementById('open-book-btn');
    const coverPage = document.getElementById('cover-page');
    const contentPages = document.getElementById('content-pages');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const sidebar = document.getElementById('sidebar');
    const toggleMenuBtn = document.getElementById('toggle-menu-btn');
    const closeBookBtn = document.getElementById('close-book-btn');
    const navTextElements = document.querySelectorAll('.nav-text');
    const pageContentContainer = document.getElementById('page-content-container');
    const backToTopBtn = document.getElementById('back-to-top');
    
    // --- Initial Loading Screen ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            if(loader) loader.classList.add('hidden');
        }, 2800);
    });
    
    // --- Book Logic ---
    openBookBtn.addEventListener('click', () => {
        coverPage.classList.add('cover-hidden');
        contentPages.classList.add('content-visible');
        stopClock(); // Stop clock when opening book
    });

    closeBookBtn.addEventListener('click', () => {
        coverPage.classList.remove('cover-hidden');
        contentPages.classList.remove('content-visible');
        startClock(); // Restart clock when closing book
    });

    // --- Page Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetPage = document.getElementById(targetId);
            const currentPage = Array.from(pages).find(p => !p.classList.contains('hidden'));
            
            if (!targetPage || (currentPage && currentPage.id === targetId)) {
                return;
            }

            navLinks.forEach(navLink => {
                const isActive = navLink === link;
                navLink.classList.toggle('active-page', isActive);
                if (isActive) {
                    navLink.setAttribute('aria-current', 'page');
                } else {
                    navLink.removeAttribute('aria-current');
                }
            });

            if (currentPage) {
                currentPage.classList.add('page-fade-out');

                setTimeout(() => {
                    currentPage.classList.add('hidden');
                    currentPage.classList.remove('page-fade-out');

                    targetPage.classList.remove('hidden');
                    targetPage.classList.add('page-fade-in');
                    setTimeout(() => targetPage.classList.remove('page-fade-in'), 400);

                }, 300);
            } else {
                targetPage.classList.remove('hidden');
                targetPage.classList.add('page-fade-in');
                setTimeout(() => targetPage.classList.remove('page-fade-in'), 400);
            }
            
            if(pageContentContainer) pageContentContainer.scrollTop = 0;
        });
    });

    // --- Toggle Menu Logic ---
    toggleMenuBtn.addEventListener('click', () => {
        const icon = toggleMenuBtn.querySelector('i');
        contentPages.classList.toggle('sidebar-minimized');

        if (contentPages.classList.contains('sidebar-minimized')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            toggleMenuBtn.setAttribute('aria-label', 'Buka Menu');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            toggleMenuBtn.setAttribute('aria-label', 'Tutup Menu');
        }
    });

    // --- General Animation on Scroll ---
    const animateOnScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                animateOnScrollObserver.unobserve(entry.target);
            }
        });
    }, { 
        root: pageContentContainer,
        threshold: 0.1 
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        if(el) animateOnScrollObserver.observe(el);
    });

    // --- Dynamic Year and Live Clock ---
    function setupDateTime() {
        const articleDateElement = document.getElementById('current-date');
        const staticDate = new Date('2025-09-15T00:00:00'); 

        // Set the static article date once
        if (articleDateElement) {
             const articleDateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Makassar' };
             articleDateElement.textContent = new Intl.DateTimeFormat('id-ID', articleDateOptions).format(staticDate);
        }
        
        const liveTimeElements = document.querySelectorAll('.live-datetime');
        if (liveTimeElements.length > 0) {
            const formattedDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Makassar' }).format(staticDate);

            const updateLiveTime = () => {
                const now = new Date(); // Use current time for the clock
                const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Makassar' };
                
                const formattedTime = new Intl.DateTimeFormat('id-ID', timeOptions).format(now).replace(/\./g, ':');
                const dateTimeString = `${formattedDate} | ${formattedTime}`;
                
                liveTimeElements.forEach(el => el.textContent = dateTimeString);
            };
            
            updateLiveTime(); // Initial call
            setInterval(updateLiveTime, 1000); // Update every second
        }
    }
    setupDateTime();

    // --- Back to Top Button Logic ---
    if (pageContentContainer && backToTopBtn) {
        pageContentContainer.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', pageContentContainer.scrollTop > 300);
        });
        backToTopBtn.addEventListener('click', () => {
            pageContentContainer.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Modal Management ---
    let modalTriggerElement = null;
    let currentActiveModal = null;
    let timelineObserver = null;

    const openModal = (modal, sourceUrl = null) => {
        if (!modal || modal.classList.contains('active')) return;
        
        modalTriggerElement = document.activeElement;
        currentActiveModal = modal;
        modal.classList.add('active');
        document.body.classList.add('body-no-scroll');

        const loader = modal.querySelector('.modal-loader');
        const mainContent = modal.querySelector('.modal-main-content');
        const dynamicElement = mainContent?.querySelector('iframe, .modal-image');

        const showContent = () => {
            if(loader) loader.classList.remove('show');
            if(mainContent) mainContent.classList.remove('content-hidden');
            modal.focus();
        };
        
        if (loader) loader.classList.add('show');
        if (mainContent) mainContent.classList.add('content-hidden');

        if (dynamicElement && sourceUrl) {
            let loaded = false;
            const onLoaded = () => {
                if(!loaded) { showContent(); loaded = true; }
            };
            dynamicElement.onload = onLoaded;
            dynamicElement.src = sourceUrl;
            setTimeout(() => { if(!loaded) onLoaded(); }, 2000); // Fallback timer
        } else {
            setTimeout(showContent, 1200); 
        }

        if (modal.id === 'timeline-modal') {
            const scrollContainer = modal.querySelector('.modal-body');
            if (scrollContainer) {
                timelineObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            timelineObserver.unobserve(entry.target);
                        }
                    });
                }, { root: scrollContainer, threshold: 0.1 });
                
                modal.querySelectorAll('.fade-in-on-scroll').forEach(el => timelineObserver.observe(el));
            }
        }
    };

    const closeModal = (modal) => {
        if (!modal || !modal.classList.contains('active')) return;
        modal.classList.remove('active');
        document.body.classList.remove('body-no-scroll');

        if (timelineObserver) {
            timelineObserver.disconnect();
            timelineObserver = null;
        }

        setTimeout(() => {
            const iframe = modal.querySelector('.modal-iframe');
            if (iframe) iframe.src = 'about:blank';
            const img = modal.querySelector('.modal-image');
            if (img) img.src = '';
            
            if (modalTriggerElement) {
                modalTriggerElement.focus();
                modalTriggerElement = null;
            }
            currentActiveModal = null;
        }, 400); 
    };
    
    document.querySelectorAll('[data-modal-target]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modalTarget;
            const modal = document.querySelector(modalId);
            const sourceUrl = button.dataset.src || null;

            const parentModal = button.closest('.modal-overlay');
            if (parentModal) closeModal(parentModal);

            openModal(modal, sourceUrl);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay);
        });
        overlay.querySelector('.modal-close-btn')?.addEventListener('click', () => closeModal(overlay));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentActiveModal) {
            closeModal(currentActiveModal);
        }
    });

    // --- Certificate Gallery Logic ---
    const certificates = [
        { src: "https://i.imgur.com/wZ7owwo.png", alt: "Sertifikat Magang DLHK DIY", title: "Magang DLHK DIY", desc: "Dinas Lingkungan Hidup & Kehutanan DIY - 2024" },
        { src: "https://i.imgur.com/fgV6iQP.png", alt: "Sertifikat Literasi Digital", title: "Literasi Digital", desc: "Kemkominfo - 2023" },
        { src: "https://i.imgur.com/eyW5LUw.png", alt: "Sertifikat Seminar Cyber Security", title: "Seminar Cyber Security", desc: "HIMATEKNO FTTI UNJAYA - 2023" },
        { src: "https://i.imgur.com/fRg3hmp.png", alt: "Sertifikat Webinar Pengolahan Data", title: "Webinar Pengolahan Data", desc: "XREI Institute - 2023" },
        { src: "https://i.imgur.com/ltwjESR.png", alt: "Sertifikat CCNA Security", title: "CCNA Security", desc: "Cisco Networking Academy - 2022" },
        { src: "https://i.imgur.com/iCRbLK8.png", alt: "Sertifikat Switching, Routing, & Wireless", title: "Switching, Routing, & Wireless", desc: "Cisco Networking Academy - 2021" },
        { src: "https://i.imgur.com/5frcsDW.png", alt: "Sertifikat Introduction to Networks", title: "Introduction to Networks", desc: "Cisco Networking Academy - 2021" },
        { src: "https://i.imgur.com/zruR3Gv.png", alt: "Sertifikat Fundamental Python", title: "Fundamental Python", desc: "Progate - 2021" },
        { src: "https://i.imgur.com/Pqwf8N1.png", alt: "Sertifikat IT Essentials", title: "IT Essentials", desc: "Cisco Networking Academy - 2020" }
    ];
    const galleryContainer = document.querySelector('#sertifikat-modal-content');
    if(galleryContainer) {
        galleryContainer.innerHTML = certificates.map(cert => `
            <button data-modal-target="#image-viewer-modal" data-src="${cert.src}" class="block border-2 border-[#967259] hover:border-[#C8BDA9] transition-all duration-300 p-2 group text-left certificate-item">
                <div class="relative">
                    <img src="${cert.src}" alt="${cert.alt}" class="w-full h-auto object-cover certificate-image" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/400x300/3A352F/D4C8B5?text=Error';">
                   <div class="certificate-overlay">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="mb-2" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                        <span class="text-sm font-semibold">Lihat Detail</span>
                   </div>
                </div>
                <p class="text-center text-sm mt-2 font-semibold">${cert.title}</p>
                <p class="text-center text-xs">${cert.desc}</p>
            </button>
        `).join('');
        
        galleryContainer.querySelectorAll('[data-modal-target]').forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.dataset.modalTarget;
                const modal = document.querySelector(modalId);
                const sourceUrl = button.dataset.src || null;
                const parentModal = button.closest('.modal-overlay');
                if (parentModal) closeModal(parentModal);
                openModal(modal, sourceUrl);
            });
        });
    }

    // --- Copy Email Logic (with fallback) ---
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const emailAddress = document.getElementById('email-address').textContent;
            const originalText = copyEmailBtn.textContent;
            
            const showSuccess = () => {
                copyEmailBtn.textContent = 'Alamat Surel Tersalin!';
                setTimeout(() => {
                   copyEmailBtn.textContent = originalText;
                }, 2000);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(emailAddress).then(showSuccess).catch(err => {
                    console.error('Fallback copy:', err);
                    copyTextToClipboardLegacy(emailAddress, showSuccess);
                });
            } else {
                copyTextToClipboardLegacy(emailAddress, showSuccess);
            }
        });
    }

    function copyTextToClipboardLegacy(text, successCallback) {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand('copy');
            successCallback();
        } catch (err) {
            console.error('Failed to copy text with execCommand: ', err);
        }
        document.body.removeChild(tempInput);
    }

    // --- Clock Script ---
    let clockIntervalId = null;
    const hourHand = document.querySelector('#cover-page [data-hour-hand]');
    const minuteHand = document.querySelector('#cover-page [data-minute-hand]');
    const secondHand = document.querySelector('#cover-page [data-second-hand]');
    const soundToggle = document.getElementById('sound-toggle');
    const soundOnText = document.getElementById('sound-on-text');
    const soundOffText = document.getElementById('sound-off-text');

    let audioCtx;
    let isMuted = true;
    let soundInitialized = false;
    let noteIndex = 0;
    const melody = [ 523.25, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63 ];

    function playTick() {
        if (isMuted || !audioCtx || audioCtx.state !== 'running') return;

        const now = audioCtx.currentTime;
        const fundamentalFreq = melody[noteIndex];

        const osc1 = audioCtx.createOscillator(); const gain1 = audioCtx.createGain();
        osc1.type = 'sine'; osc1.frequency.setValueAtTime(fundamentalFreq, now);
        osc1.connect(gain1); gain1.connect(audioCtx.destination);

        const osc2 = audioCtx.createOscillator(); const gain2 = audioCtx.createGain();
        osc2.type = 'sine'; osc2.frequency.setValueAtTime(fundamentalFreq * 2, now);
        osc2.connect(gain2); gain2.connect(audioCtx.destination);

        const osc3 = audioCtx.createOscillator(); const gain3 = audioCtx.createGain();
        osc3.type = 'sine'; osc3.frequency.setValueAtTime(fundamentalFreq * 1.5, now);
        osc3.connect(gain3); gain3.connect(audioCtx.destination);
        
        const masterVolume = 0.15;
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(masterVolume, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(masterVolume / 2, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(masterVolume / 3, now + 0.02);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        const stopTime = now + 1.8;
        [osc1, osc2, osc3].forEach(osc => { osc.start(now); osc.stop(stopTime); });
        noteIndex = (noteIndex + 1) % melody.length;
    }

    function initSound() {
        if (!soundInitialized) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            soundInitialized = true;
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }
    
    if(soundToggle && soundOnText && soundOffText) {
         soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            initSound();
            isMuted = !isMuted;
            soundOnText.classList.toggle('hidden', isMuted);
            soundOffText.classList.toggle('hidden', !isMuted);
        });
    }

    function setClock() {
        if (!hourHand || !minuteHand || !secondHand) return;
        const currentDate = new Date();
        const secondsRatio = currentDate.getSeconds() / 60;
        const minutesRatio = (secondsRatio + currentDate.getMinutes()) / 60;
        const hoursRatio = (minutesRatio + currentDate.getHours()) / 12;
        
        setRotation(secondHand, secondsRatio);
        setRotation(minuteHand, minutesRatio);
        setRotation(hourHand, hoursRatio);
        playTick();
    }

    function setRotation(element, rotationRatio) {
         element.style.transform = `translateX(-50%) rotate(${rotationRatio * 360}deg)`;
    }

    function startClock() {
        if (clockIntervalId !== null) return;
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        setClock();
        clockIntervalId = setInterval(setClock, 1000);
    }

    function stopClock() {
        clearInterval(clockIntervalId);
        clockIntervalId = null;
        if (audioCtx && audioCtx.state === 'running') {
            audioCtx.suspend();
        }
    }

    startClock(); // Initial call
});
