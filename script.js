document.addEventListener('DOMContentLoaded', () => {
    
    const loader = document.getElementById('loader');
    const openBookBtn = document.getElementById('open-book-btn');
    const coverPage = document.getElementById('cover-page');
    const contentPages = document.getElementById('content-pages');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const toggleMenuBtn = document.getElementById('toggle-menu-btn');
    const closeBookBtn = document.getElementById('close-book-btn');
    const pageContentContainer = document.getElementById('page-content-container');
    const backToTopBtn = document.getElementById('back-to-top');
    
    const soundToggleBtn = document.getElementById('sound-toggle');
    const backgroundMusic = document.getElementById('background-music');
    const playText = document.getElementById('play-text');
    const stopText = document.getElementById('stop-text');

    // --- BARU: Logika Peringatan Lihat Sumber Halaman ---
    const sourceWarningOverlay = document.getElementById('source-warning-overlay');
    const closeWarningBtn = document.getElementById('close-warning-btn');

    function showSourceWarning() {
        if (sourceWarningOverlay) {
            sourceWarningOverlay.classList.add('active');
        }
    }

    if (closeWarningBtn) {
        closeWarningBtn.addEventListener('click', () => {
            if (sourceWarningOverlay) {
                sourceWarningOverlay.classList.remove('active');
            }
        });
    }

    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        showSourceWarning();
    });

    // --- BARU: Deteksi penekanan tombol keyboard ---
    document.addEventListener('keydown', e => {
        // Blok F12
        if (e.key === 'F12') {
            e.preventDefault();
            showSourceWarning();
        }
        // Blok Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) {
            e.preventDefault();
            showSourceWarning();
        }
    });

    // --- BARU: Deteksi Pembukaan Developer Tools ---
    const devToolsThreshold = 160;
    let devToolsOpen = false;

    function checkDevTools() {
        if (window.outerWidth - window.innerWidth > devToolsThreshold || window.outerHeight - window.innerHeight > devToolsThreshold) {
            if (!devToolsOpen) {
                showSourceWarning();
                devToolsOpen = true;
            }
        } else {
            devToolsOpen = false;
        }
    }

    // Memeriksa secara berkala
    setInterval(checkDevTools, 1000);

    // --- AKHIR DARI LOGIKA DETEKSI DEV TOOLS ---

    if (soundToggleBtn && backgroundMusic && playText && stopText) {
        soundToggleBtn.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => console.log("Pemutaran audio dicegah oleh browser."));
                playText.classList.add('hidden');
                stopText.classList.remove('hidden');
            } else {
                backgroundMusic.pause();
                playText.classList.remove('hidden');
                stopText.classList.add('hidden');
            }
        });
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            if(loader) loader.classList.add('hidden');
            
            // PERBAIKAN: Menghapus upaya autoplay musik yang tidak andal.
            // Musik kini hanya akan diputar melalui interaksi pengguna via tombol 'soundToggleBtn'.
            // Ini mencegah error konsol dari kebijakan autoplay browser.
            if (backgroundMusic) {
                console.log("Sistem audio siap. Klik 'Mulai Langkahmu' untuk memutar musik.");
            }
        }, 2800);
    });
    
    openBookBtn.addEventListener('click', () => {
        // 1. Mulai animasi menutup gerbang
        document.body.classList.add('loading-transition');

        // 2. Tunggu hingga gerbang tertutup sepenuhnya
        setTimeout(() => {
            // 3. Ganti konten halaman di belakang layar
            coverPage.classList.add('cover-hidden');
            contentPages.classList.add('content-visible');
            pageContentContainer.scrollTop = 0; // Reset scroll ke atas
            stopAstrolabeAnimation();
            startParticleAnimation();

            if (backgroundMusic && !backgroundMusic.paused) {
                backgroundMusic.pause();
                playText.classList.remove('hidden');
                stopText.classList.add('hidden');
            }

            // 4. Tunggu DOM diperbarui, lalu mulai animasi membuka gerbang
            requestAnimationFrame(() => {
                setTimeout(() => document.body.classList.remove('loading-transition'), 50);
            });
        }, 1200); // Durasi ini harus cocok dengan transisi CSS .transition-gate
    });

    closeBookBtn.addEventListener('click', () => {
        // 1. Mulai animasi menutup gerbang
        document.body.classList.add('loading-transition');

        // 2. Tunggu hingga gerbang tertutup
        setTimeout(() => {
            // 3. Ganti konten di belakang layar
            coverPage.classList.remove('cover-hidden');
            contentPages.classList.remove('content-visible');
            startAstrolabeAnimation();
            stopParticleAnimation();

            // 4. Tunggu DOM diperbarui, lalu mulai animasi membuka gerbang
            requestAnimationFrame(() => {
                setTimeout(() => document.body.classList.remove('loading-transition'), 50);
            });
        }, 1200); // Cocokkan dengan durasi transisi CSS
    });

    // --- CANVAS ANIMATION LOGIC ---
    const canvasAnimations = {
        'cnn-canvas': (ctx, w, h) => {
            let t = 0;
            const imgSize = h * 0.5;
            const imgX = w * 0.1;
            const imgY = (h - imgSize) / 2;
            const filterSize = imgSize / 4;
            let filterX = imgX, filterY = imgY;
            const featureMapSize = h * 0.6;
            const featureMapX = w * 0.6;
            const featureMapY = (h - featureMapSize) / 2;

            function drawGrid(x, y, size, cells, color) {
                const cellSize = size / cells;
                for (let i = 0; i < cells; i++) {
                    for (let j = 0; j < cells; j++) {
                        ctx.fillStyle = `rgba(${color}, ${Math.random() * 0.5 + 0.1})`;
                        ctx.fillRect(x + i * cellSize, y + j * cellSize, cellSize, cellSize);
                        ctx.strokeStyle = `rgba(${color}, 0.5)`;
                        ctx.strokeRect(x + i * cellSize, y + j * cellSize, cellSize, cellSize);
                    }
                }
            }

            function loop() {
                t++;
                ctx.clearRect(0, 0, w, h);
                
                // Gambar "Input Image"
                drawGrid(imgX, imgY, imgSize, 4, '60, 138, 133');

                // Animasikan "Filter"
                const steps = 4 - 1;
                const progress = (t % 120) / 120;
                const totalSteps = steps * steps;
                const currentStep = Math.floor(progress * totalSteps);
                filterX = imgX + (currentStep % steps) * (imgSize / 4);
                filterY = imgY + Math.floor(currentStep / steps) * (imgSize / 4);
                ctx.strokeStyle = `rgba(199, 165, 91, 1)`;
                ctx.lineWidth = 3;
                ctx.strokeRect(filterX, filterY, filterSize, filterSize);
                
                // Gambar "Feature Map" yang bertambah
                const featureMapCells = 3;
                const featureCellSize = featureMapSize / featureMapCells;
                for(let i = 0; i <= currentStep; i++) {
                     const x = featureMapX + (i % featureMapCells) * featureCellSize;
                     const y = featureMapY + Math.floor(i / featureMapCells) * featureCellSize;
                     ctx.fillStyle = `rgba(199, 165, 91, 0.6)`;
                     ctx.fillRect(x, y, featureCellSize, featureCellSize);
                }
                
                // Gambar panah
                ctx.beginPath();
                ctx.moveTo(imgX + imgSize + 10, h / 2);
                ctx.lineTo(featureMapX - 10, h / 2);
                ctx.strokeStyle = 'rgba(199, 165, 91, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Label
                ctx.font = `14px Amiri`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.8)';
                ctx.textAlign = 'center';
                ctx.fillText('Input', imgX + imgSize/2, imgY - 15);
                ctx.fillText('Fitur', featureMapX + featureMapSize/2, featureMapY - 15);


                requestAnimationFrame(loop);
            }
            loop();
        },
        'morse-canvas': (ctx, w, h) => {
            let t = 0;
            const dictionary = [
                { char: 'A', code: '.-' }, { char: 'B', code: '-...' }, { char: 'C', code: '-.-.' }, { char: 'D', code: '-..' },
                { char: 'E', code: '.' }, { char: 'F', code: '..-.' }, { char: 'G', code: '--.' }, { char: 'H', code: '....' },
                { char: 'I', code: '..' }, { char: 'J', code: '.---' }, { char: 'K', code: '-.-' }, { char: 'L', code: '.-..' },
                { char: 'M', code: '--' }, { char: 'N', code: '-.' }, { char: 'O', code: '---' }, { char: 'P', code: '.--.' },
                { char: 'Q', code: '--.-' }, { char: 'R', code: '.-.' }, { char: 'S', code: '...' }, { char: 'T', code: '-' },
                { char: 'U', code: '..-' }, { char: 'V', code: '...-' }, { char: 'W', code: '.--' }, { char: 'X', code: '-..-' },
                { char: 'Y', code: '-.--' }, { char: 'Z', code: '--..' }
            ];
            const signalsToTranslate = ['.--', '---', '...'];
            let currentSignalIndex = 0;
            let dictionaryCheckIndex = 0;
            let matchFound = false;
            let timeOfMatch = 0;

            function drawMicrocontroller(x, y, width, height) {
                ctx.strokeStyle = 'rgba(199, 165, 91, 1)';
                ctx.fillStyle = 'rgba(199, 165, 91, 0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, y, width, height, [5]);
                ctx.stroke();
                ctx.fill();

                ctx.lineWidth = 1.5;
                for(let i=0; i<6; i++) {
                    const pinY = y + (i + 1) * (height / 7);
                    ctx.beginPath();
                    ctx.moveTo(x - 10, pinY); ctx.lineTo(x, pinY);
                    ctx.moveTo(x + width, pinY); ctx.lineTo(x + width + 10, pinY);
                    ctx.stroke();
                }
            }

            function loop() {
                t++;
                const currentSignal = signalsToTranslate[currentSignalIndex];
                ctx.clearRect(0, 0, w, h);

                const mcuX = w * 0.35, mcuY = h * 0.2, mcuW = w * 0.3, mcuH = h * 0.6;
                drawMicrocontroller(mcuX, mcuY, mcuW, mcuH);
                
                // 1. Draw Input Signal
                ctx.font = `bold ${h/8}px monospace`;
                ctx.fillStyle = 'rgba(60, 138, 133, 1)';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(currentSignal, mcuX - 25, h/2);
                
                ctx.font = `bold ${h/12}px Amiri`;
                ctx.fillText("INPUT", mcuX - 25, h/2 - 25);


                // 2. Animate Brute Force Check
                if (!matchFound) {
                    if (t % 4 === 0) { // Cycle through dictionary
                        dictionaryCheckIndex++;
                    }
                    if (dictionaryCheckIndex >= dictionary.length) {
                        dictionaryCheckIndex = 0; 
                    }
                    
                    if (dictionary[dictionaryCheckIndex].code === currentSignal) {
                        matchFound = true;
                        timeOfMatch = t;
                    }
                }

                // 3. Display dictionary check
                ctx.font = `bold ${h/10}px monospace`;
                ctx.textAlign = 'center';
                
                const checkItem = dictionary[dictionaryCheckIndex];
                ctx.fillStyle = 'rgba(199, 165, 91, 0.9)';
                ctx.fillText(`${checkItem.char} : ${checkItem.code}`, mcuX + mcuW/2, mcuY + mcuH/2);

                if (matchFound) {
                    const timeSinceMatch = t - timeOfMatch;
                    const highlightAlpha = Math.max(0, 1 - (timeSinceMatch / 60)); 
                    
                    // Highlight the match inside MCU
                    ctx.fillStyle = `rgba(60, 138, 133, ${highlightAlpha * 0.5})`;
                    const rectWidth = ctx.measureText(`${checkItem.char} : ${checkItem.code}`).width + 20;
                    ctx.fillRect(mcuX + mcuW/2 - rectWidth/2, mcuY + mcuH/2 - h/10, rectWidth, h/5);
                    
                    // Display Output
                    ctx.font = `bold ${h/8}px Amiri`;
                    ctx.fillStyle = `rgba(60, 138, 133, 1)`;
                    ctx.textAlign = 'left';
                    ctx.fillText(checkItem.char, mcuX + mcuW + 25, h/2);
                    
                    ctx.font = `bold ${h/12}px Amiri`;
                    ctx.fillText("OUTPUT", mcuX + mcuW + 25, h/2 - 25);

                    if (timeSinceMatch > 120) { // Wait 2 seconds before next signal
                        matchFound = false;
                        dictionaryCheckIndex = 0; // -1 so it becomes 0 on next increment
                        currentSignalIndex = (currentSignalIndex + 1) % signalsToTranslate.length;
                    }
                }
                
                requestAnimationFrame(loop);
            }
            loop();
        },
         'web-canvas': (ctx, w, h) => {
            let t = 0;
            const client = { x: w * 0.2, y: h/2 };
            const server = { x: w * 0.8, y: h * 0.35 };
            const db = { x: w * 0.8, y: h * 0.65 };
            
            let packets = [];
            const cycleDuration = 360;

            function drawComponent(icon, label, x, y, size, color) {
                ctx.font = `bold ${size}px "Font Awesome 6 Free"`;
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(icon, x, y);
                
                ctx.font = `bold ${size/3}px Amiri`;
                ctx.fillText(label, x, y + size/2 + 10);
            }

            function loop() {
                t++;
                ctx.clearRect(0, 0, w, h);

                // Draw components
                drawComponent('\uf108', 'Client (Browser)', client.x, client.y, h*0.3, 'rgba(60, 138, 133, 1)');
                drawComponent('\uf1d3', 'Server (PHP)', server.x, server.y, h*0.25, 'rgba(199, 165, 91, 1)');
                drawComponent('\uf1c0', 'Database (MySQL)', db.x, db.y, h*0.25, 'rgba(199, 165, 91, 1)');

                // Animate packets based on cycle progress
                const progress = (t % cycleDuration) / cycleDuration;
                let packet;

                ctx.lineWidth = 2;
                ctx.font = `italic ${h/18}px Amiri`;
                ctx.textAlign = 'center';

                if (progress < 0.25) { // Client -> Server
                    const p = progress / 0.25;
                    packet = {
                        x: client.x + (server.x - client.x) * p,
                        y: client.y + (server.y - client.y) * p,
                        color: 'rgba(60, 138, 133, 0.8)'
                    };
                    ctx.fillStyle = packet.color;
                    ctx.fillText('HTTP Request', client.x + (server.x - client.x) * 0.5, client.y - 30);
                } else if (progress < 0.5) { // Server -> DB
                    const p = (progress - 0.25) / 0.25;
                    packet = {
                        x: server.x + (db.x - server.x) * p,
                        y: server.y + (db.y - server.y) * p,
                        color: 'rgba(199, 165, 91, 0.8)'
                    };
                     ctx.fillStyle = packet.color;
                     ctx.fillText('SQL Query', server.x + 30, server.y + (db.y - server.y)*0.5);
                } else if (progress < 0.75) { // DB -> Server
                    const p = (progress - 0.5) / 0.25;
                    packet = {
                        x: db.x + (server.x - db.x) * p,
                        y: db.y + (server.y - db.y) * p,
                        color: 'rgba(199, 165, 91, 0.8)'
                    };
                     ctx.fillStyle = packet.color;
                     ctx.fillText('SQL Result', server.x + 30, server.y + (db.y - server.y)*0.5);
                } else { // Server -> Client
                     const p = (progress - 0.75) / 0.25;
                     packet = {
                        x: server.x + (client.x - server.x) * p,
                        y: server.y + (client.y - server.y) * p,
                        color: 'rgba(60, 138, 133, 0.8)'
                    };
                    ctx.fillStyle = packet.color;
                    ctx.fillText('HTTP Response', client.x + (server.x - client.x) * 0.5, client.y - 30);
                }
                
                if (packet) {
                    ctx.beginPath();
                    ctx.arc(packet.x, packet.y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = packet.color;
                    ctx.fill();
                }
                
                // Draw connecting lines
                ctx.strokeStyle = 'rgba(199, 165, 91, 0.2)';
                ctx.beginPath();
                ctx.moveTo(client.x, client.y);
                ctx.lineTo(server.x, server.y);
                ctx.moveTo(server.x, server.y);
                ctx.lineTo(db.x, db.y);
                ctx.stroke();

                requestAnimationFrame(loop);
            }
            loop();
        },
        'iot-canvas': (ctx, w, h) => {
            let growth = 0; let t = 0;
            const plantBaseY = h * 0.9;
            const sensors = [
                { icon: '\uf043', x: w * 0.15, y: h*0.3, color: '60, 138, 133' }, // water drop
                { icon: '\uf185', x: w * 0.85, y: h*0.3, color: '199, 165, 91' }, // sun
            ];
            let waves = [];

            function drawPlant(g) {
                ctx.strokeStyle = `rgba(60, 138, 133, 1)`;
                ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(w/2, plantBaseY);
                const topY = plantBaseY - g;
                ctx.lineTo(w/2, topY); ctx.stroke();
                const leaves = Math.floor(g / (h*0.1));
                for (let i = 0; i < leaves; i++) {
                    const leafY = plantBaseY - (i+1)*(h*0.1);
                    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w/2, leafY);
                    ctx.quadraticCurveTo(w/2 + (i%2==0?1:-1)*15, leafY-10, w/2 + (i%2==0?1:-1)*30, leafY);
                    ctx.stroke();
                }
            }

            if(t % 90 === 0 && growth < h*0.6) {
                const sensor = sensors[Math.floor(Math.random() * sensors.length)];
                waves.push({ sx: sensor.x, sy: sensor.y, progress: 0, color: sensor.color });
            }

            function loop() {
                t++;
                ctx.clearRect(0, 0, w, h);
                
                if (t % 120 === 0 && growth < h*0.6) {
                    const sensor = sensors[Math.floor(Math.random() * sensors.length)];
                    waves.push({ sx: sensor.x, sy: sensor.y, progress: 0, color: sensor.color });
                }

                waves.forEach((wave, i) => {
                    wave.progress += 0.02;
                    if (wave.progress > 1) {
                        waves.splice(i, 1);
                        if (growth < h*0.6) growth += 5;
                        return;
                    }
                    const x = wave.sx + (w/2 - wave.sx) * wave.progress;
                    const y = wave.sy + (plantBaseY - growth - wave.sy) * wave.progress;
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(${wave.color}, ${1-wave.progress})`;
                    ctx.fill();
                });

                drawPlant(growth);
                
                ctx.font = `bold ${h/8}px "Font Awesome 6 Free"`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
                sensors.forEach(s => {
                    ctx.fillStyle = `rgba(${s.color}, 1)`;
                    ctx.fillText(s.icon, s.x, s.y);
                });
                
                requestAnimationFrame(loop);
            }
            loop();
        },
        'pieces-canvas': (ctx, w, h) => {
            let t = 0;
            const piecesFramework = [
                { name: 'PERFORMANCE', manualIcon: '\uf017', digitalIcon: '\uf135', manualDesc: 'Lamban', digitalDesc: 'Cepat' },
                { name: 'INFORMATION', manualIcon: '\uf15b', digitalIcon: '\uf1c0', manualDesc: 'Terpencar', digitalDesc: 'Terpusat' },
                { name: 'ECONOMICS', manualIcon: '\uf53d', digitalIcon: '\uf4c0', manualDesc: 'Boros', digitalDesc: 'Efisien' },
                { name: 'CONTROL', manualIcon: '\uf13e', digitalIcon: '\uf3ed', manualDesc: 'Lemah', digitalDesc: 'Aman' },
                { name: 'EFFICIENCY', manualIcon: '\uf074', digitalIcon: '\uf14a', manualDesc: 'Rumit', digitalDesc: 'Praktis' },
                { name: 'SERVICE', manualIcon: '\uf119', digitalIcon: '\uf118', manualDesc: 'Terbatas', digitalDesc: '24/7' }
            ];

            const manualX = w * 0.25;
            const digitalX = w * 0.75;
            const transitionDuration = 240; // frames for a full cycle

            function loop() {
                t++;
                ctx.clearRect(0, 0, w, h);

                const cycleProgress = (t % transitionDuration) / transitionDuration;
                const currentIndex = Math.floor((t / transitionDuration) % piecesFramework.length);
                const currentItem = piecesFramework[currentIndex];

                // Draw divider
                ctx.strokeStyle = 'rgba(199, 165, 91, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.1);
                ctx.lineTo(w/2, h*0.9);
                ctx.stroke();

                // Draw Titles
                ctx.font = `bold ${h/12}px Amiri`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.7)';
                ctx.textAlign = 'center';
                ctx.fillText('Sistem Manual', manualX, h * 0.2);
                ctx.fillText('Sistem Digital', digitalX, h * 0.2);
                
                // Draw Arrow
                ctx.font = `bold ${h/8}px "Font Awesome 6 Free"`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.5)';
                ctx.fillText('\uf061', w/2, h/2);

                // Draw PIECES elements
                ctx.font = `bold ${h/6}px "Font Awesome 6 Free"`;
                ctx.textBaseline = 'middle';

                // Manual side (Problem)
                ctx.fillStyle = 'rgba(199, 165, 91, 0.8)';
                ctx.fillText(currentItem.manualIcon, manualX, h/2);

                // Digital side (Solution)
                ctx.fillStyle = 'rgba(60, 138, 133, 1)';
                ctx.fillText(currentItem.digitalIcon, digitalX, h/2);
                
                // Draw descriptions
                ctx.font = `bold ${h/14}px Amiri`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.9)';
                ctx.fillText(currentItem.manualDesc, manualX, h * 0.7);
                ctx.fillStyle = 'rgba(60, 138, 133, 0.9)';
                ctx.fillText(currentItem.digitalDesc, digitalX, h * 0.7);

                // Draw current framework name
                const textWidth = ctx.measureText(currentItem.name).width;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.3)';
                ctx.fillRect(w/2 - textWidth/2 - 10, h * 0.85 - h/18, textWidth + 20, h/9);
                
                ctx.font = `${h/16}px Amiri`;
                ctx.fillStyle = 'rgba(199, 165, 91, 1)';
                ctx.fillText(currentItem.name, w/2, h*0.85);


                requestAnimationFrame(loop);
            }
            loop();
        },
        'network-canvas': (ctx, w, h) => {
            let t = 0;
            const internet = { x: w * 0.1, y: h/2, icon: '\uf0c2' };
            const router = { x: w * 0.3, y: h/2, icon: '\uf381' };
            const coreSwitch = { x: w * 0.5, y: h/2, icon: '\uf796' };
            const servers = { x: w * 0.5, y: h * 0.15, icon: '\uf233' };
            const departments = [
                { name: 'Produksi', x: w*0.75, y: h*0.15, icon: '\uf109' },
                { name: 'R&D', x: w*0.85, y: h*0.35, icon: '\uf109' },
                { name: 'Pemasaran', x: w*0.9, y: h*0.55, icon: '\uf109' },
                { name: 'Penjualan', x: w*0.85, y: h*0.75, icon: '\uf109' },
                { name: 'HRD', x: w*0.75, y: h*0.95, icon: '\uf109' },
            ];
            const cycleDuration = 400;

            function drawComponent(icon, label, x, y, size, color) {
                ctx.font = `bold ${size}px "Font Awesome 6 Free"`;
                ctx.fillStyle = color;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(icon, x, y);
                
                ctx.font = `bold ${size/3.5}px Amiri`;
                ctx.fillText(label, x, y + size/2 + 5);
            }

            function loop() {
                t++;
                ctx.clearRect(0,0,w,h);
                
                // Draw components
                drawComponent(internet.icon, 'Internet', internet.x, internet.y, h*0.25, 'rgba(60, 138, 133, 1)');
                drawComponent(router.icon, 'Router', router.x, router.y, h*0.2, 'rgba(199, 165, 91, 1)');
                drawComponent(coreSwitch.icon, 'Core Switch', coreSwitch.x, coreSwitch.y, h*0.2, 'rgba(199, 165, 91, 1)');
                drawComponent(servers.icon, 'Servers', servers.x, servers.y, h*0.15, 'rgba(199, 165, 91, 1)');
                
                departments.forEach(dept => {
                    drawComponent(dept.icon, dept.name, dept.x, dept.y, h*0.1, 'rgba(60, 138, 133, 1)');
                });
                
                // Draw connections
                ctx.strokeStyle = 'rgba(199, 165, 91, 0.3)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(internet.x, internet.y); ctx.lineTo(router.x, router.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(router.x, router.y); ctx.lineTo(coreSwitch.x, coreSwitch.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(coreSwitch.x, coreSwitch.y); ctx.lineTo(servers.x, servers.y); ctx.stroke();
                departments.forEach(dept => {
                    ctx.beginPath(); ctx.moveTo(coreSwitch.x, coreSwitch.y); ctx.lineTo(dept.x, dept.y); ctx.stroke();
                });

                // Animate packets
                const progress = (t % cycleDuration) / cycleDuration;
                let packet;
                
                if (progress < 0.25) { // Internet -> Router -> Switch -> Server
                   const p = progress / 0.25;
                   if (p < 0.33) { packet = { x: internet.x + (router.x - internet.x) * (p/0.33), y: router.y }; }
                   else if (p < 0.66) { packet = { x: router.x + (coreSwitch.x - router.x) * ((p-0.33)/0.33), y: router.y }; }
                   else { packet = { x: coreSwitch.x, y: coreSwitch.y + (servers.y - coreSwitch.y) * ((p-0.66)/0.34) }; }
                } else if (progress < 0.5) { // Server -> Switch -> Dept
                   const p = (progress - 0.25) / 0.25;
                   const targetDept = departments[1]; // R&D
                   if (p < 0.5) { packet = { x: servers.x, y: servers.y + (coreSwitch.y - servers.y) * (p/0.5) }; }
                   else { packet = { x: coreSwitch.x + (targetDept.x-coreSwitch.x)*((p-0.5)/0.5), y: coreSwitch.y + (targetDept.y-coreSwitch.y)*((p-0.5)/0.5) }; }
                } else if (progress < 0.75) { // Dept -> Switch -> Dept
                   const p = (progress - 0.5) / 0.25;
                   const fromDept = departments[3]; // Penjualan
                   const toDept = departments[0]; // Produksi
                   if (p < 0.5) { packet = { x: fromDept.x + (coreSwitch.x - fromDept.x) * (p/0.5), y: fromDept.y + (coreSwitch.y - fromDept.y) * (p/0.5) }; }
                   else { packet = { x: coreSwitch.x + (toDept.x-coreSwitch.x)*((p-0.5)/0.5), y: coreSwitch.y + (toDept.y-coreSwitch.y)*((p-0.5)/0.5) }; }
                } else { // Dept -> Switch -> Router -> Internet
                   const p = (progress - 0.75) / 0.25;
                   const fromDept = departments[4]; // HRD
                   if (p < 0.33) { packet = { x: fromDept.x + (coreSwitch.x - fromDept.x)*(p/0.33), y: fromDept.y + (coreSwitch.y - fromDept.y)*(p/0.33) }; }
                   else if (p < 0.66) { packet = { x: coreSwitch.x + (router.x - coreSwitch.x)*((p-0.33)/0.33), y: router.y }; }
                   else { packet = { x: router.x + (internet.x - router.x)*((p-0.66)/0.34), y: router.y }; }
                }

                if (packet) {
                    ctx.beginPath(); ctx.arc(packet.x, packet.y, 4, 0, Math.PI*2);
                    ctx.fillStyle='rgba(220, 50, 50, 0.9)'; ctx.fill();
                }
                
                requestAnimationFrame(loop);
            }
            loop();
        },
        'yagi-canvas': (ctx, w, h) => {
            let t = 0;
            const boomY = h/2;
            // Disesuaikan menjadi 6 elemen sesuai judul: 1 reflektor, 1 driven, 4 direktor
            const elements = [
                { x: w * 0.15, h: h * 0.7, type: 'reflector' },
                { x: w * 0.3,  h: h * 0.65, type: 'driven' },
                { x: w * 0.5,  h: h * 0.6, type: 'director' },
                { x: w * 0.65, h: h * 0.57, type: 'director' },
                { x: w * 0.8,  h: h * 0.54, type: 'director' },
                { x: w * 0.9,  h: h * 0.51, type: 'director' }
            ];

            function drawAntenna() {
                ctx.strokeStyle = 'rgba(199, 165, 91, 1)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(w*0.1, boomY); ctx.lineTo(w, boomY); ctx.stroke();
                
                ctx.lineWidth = 4;
                elements.forEach(el => {
                    ctx.strokeStyle = el.type === 'driven' ? 'rgba(60, 138, 133, 1)' : 'rgba(199, 165, 91, 1)';
                    ctx.beginPath();
                    ctx.moveTo(el.x, boomY - el.h/2);
                    ctx.lineTo(el.x, boomY + el.h/2);
                    ctx.stroke();
                });
                
                // Menambahkan label untuk kejelasan
                ctx.font = `12px Amiri`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.9)';
                ctx.textAlign = 'center';
                ctx.fillText('Reflektor', elements[0].x, boomY + elements[0].h/2 + 15);
                ctx.fillStyle = 'rgba(60, 138, 133, 0.9)';
                ctx.fillText('Driven', elements[1].x, boomY - elements[1].h/2 - 15);
                ctx.fillStyle = 'rgba(199, 165, 91, 0.9)';
                ctx.fillText('Direktor', elements[3].x, boomY + elements[3].h/2 + 15);
            }
            
            let particles = [];
            for (let i=0; i < 50; i++) {
                particles.push({
                    x: Math.random() * -w,
                    y: boomY + (Math.random() - 0.5) * h * 1.2,
                    speed: 1 + Math.random() * 0.5
                });
            }

            function loop() {
                t++;
                ctx.clearRect(0, 0, w, h);
                
                const reflector = elements[0];
                const lastDirector = elements[elements.length-1];

                // Animasikan partikel yang sedang difokuskan
                particles.forEach(p => {
                    p.x += p.speed;
                    if (p.x > lastDirector.x) {
                        p.x = Math.random() * -50;
                        p.y = boomY + (Math.random() - 0.5) * h * 1.2;
                    }
                    if (p.x > reflector.x - 5 && p.x < reflector.x + 5 && Math.abs(p.y - boomY) < reflector.h/2) {
                        p.x = reflector.x - 6; // Pantulkan partikel oleh reflektor
                    }

                    let focusFactor = 0;
                    if (p.x > reflector.x) {
                        focusFactor = (p.x - reflector.x) / (lastDirector.x - reflector.x);
                    }
                    
                    p.y += (boomY - p.y) * 0.015 * focusFactor;
                    
                    const intensity = Math.min(1, focusFactor * 1.2);
                    const r = 60 + (220 - 60) * intensity;
                    const g = 138 + (50 - 138) * intensity;
                    const b = 133 + (50 - 133) * intensity;
                    const alpha = 0.4 + intensity * 0.5;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
                    ctx.fill();
                });
                
                drawAntenna(); // Gambar antena di atas partikel

                // Animasikan pola radiasi yang dihasilkan
                const lobeProgress = (t % 150) / 150;
                const pulse = Math.sin(lobeProgress * Math.PI);
                const lobeSize = w * 0.5 * (0.9 + pulse * 0.1);
                const lobeOpacity = 0.4 + pulse * 0.3;
                
                const startX = elements[1].x; // Pola radiasi dimulai dari elemen driven
                const endX = startX + lobeSize;
                const controlY = h * 0.4 * (0.9 + pulse * 0.1);

                const gradient = ctx.createRadialGradient(startX, boomY, 0, startX, boomY, lobeSize);
                gradient.addColorStop(0, `rgba(199, 165, 91, ${lobeOpacity})`);
                gradient.addColorStop(0.5, `rgba(199, 165, 91, ${lobeOpacity * 0.5})`);
                gradient.addColorStop(1, `rgba(199, 165, 91, 0)`);
                ctx.fillStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(startX, boomY);
                ctx.quadraticCurveTo(startX + lobeSize * 0.5, boomY - controlY, endX, boomY);
                ctx.quadraticCurveTo(startX + lobeSize * 0.5, boomY + controlY, startX, boomY);
                ctx.fill();
                
                requestAnimationFrame(loop);
            }
            loop();
        }
    };
    
    function startCanvasAnimation(canvas) {
        const animationFunc = canvasAnimations[canvas.id];
        if (animationFunc) {
            const ctx = canvas.getContext('2d');
            animationFunc(ctx, canvas.width, canvas.height);
        }
    }

    window.animateOnScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                const canvas = entry.target.querySelector('canvas.project-canvas');
                if (canvas && !canvas.dataset.animationStarted) {
                    startCanvasAnimation(canvas);
                    canvas.dataset.animationStarted = 'true';
                }

            }
        });
    }, { root: null, threshold: 0.1 });

    // Intersection Observer untuk Timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    // Opsi: hapus kelas saat keluar dari pandangan agar animasi berulang
                    // entry.target.classList.remove('is-visible');
                }
            });
        }, { 
            root: pageContentContainer, // Menggunakan kontainer yang bisa digulir sebagai root
            threshold: 0.3 // Memicu saat 30% item terlihat
        });

        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetPage = document.getElementById(targetId);
            const currentActiveLink = document.querySelector('.nav-link.active-page');

            if ((currentActiveLink && currentActiveLink.getAttribute('href') === link.getAttribute('href')) || !targetPage) {
                return;
            }

            navLinks.forEach(navLink => navLink.classList.remove('active-page'));
            link.classList.add('active-page');

            const currentPage = Array.from(pages).find(p => !p.classList.contains('hidden'));

            const switchPages = () => {
                pages.forEach(p => {
                    p.classList.add('hidden');
                    p.classList.remove('page-fade-in', 'page-fade-out');
                    p.querySelectorAll('.animate-on-scroll').forEach(el => {
                                window.animateOnScrollObserver.unobserve(el);
                        el.classList.remove('is-visible');
                    });
                });

                targetPage.classList.remove('hidden');
                targetPage.classList.add('page-fade-in');
                if(pageContentContainer) pageContentContainer.scrollTop = 0;

                targetPage.querySelectorAll('.animate-on-scroll').forEach(el => {
                            window.animateOnScrollObserver.observe(el);
                });
            };

            if (currentPage) {
                currentPage.classList.add('page-fade-out');
                setTimeout(switchPages, 300);
            } else {
                switchPages();
            }
        });
    });

    const initialPage = document.querySelector('.page:not(.hidden)');
    if (initialPage) {
        initialPage.querySelectorAll('.animate-on-scroll').forEach(el => {
            window.animateOnScrollObserver.observe(el);
        });
    }

    toggleMenuBtn.addEventListener('click', () => {
        const icon = toggleMenuBtn.querySelector('i');
        contentPages.classList.toggle('sidebar-minimized');
        const isMinimized = contentPages.classList.contains('sidebar-minimized');
        icon.className = isMinimized ? 'fas fa-bars' : 'fas fa-times';
        toggleMenuBtn.setAttribute('aria-label', isMinimized ? 'Buka Menu' : 'Tutup Menu');
    });
    
    function setupDateTime() {
        const liveTimeElements = document.querySelectorAll('.live-datetime');
        if (liveTimeElements.length > 0) {
            const articleDateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Makassar' };
            const updateLiveTime = () => {
                const now = new Date();
                const formattedDate = new Intl.DateTimeFormat('id-ID', articleDateOptions).format(now);
                const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Makassar' };
                const formattedTime = new Intl.DateTimeFormat('id-ID', timeOptions).format(now).replace(/\./g, ':');
                liveTimeElements.forEach(el => el.textContent = `${formattedDate} | ${formattedTime}`);
            };
            updateLiveTime();
            setInterval(updateLiveTime, 1000);
        }
    }
    setupDateTime();

    const emailContainer = document.getElementById('email-address-container');
    if (emailContainer) {
        const user = 'sasangkagatot';
        const domain = 'gmail.com';
        emailContainer.textContent = `${user}@${domain}`;
    }

    if (pageContentContainer && backToTopBtn) {
        pageContentContainer.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', pageContentContainer.scrollTop > 300);
        });
        backToTopBtn.addEventListener('click', () => {
            pageContentContainer.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const manuscripts = {
        'ai-ethics': {
            title: "Etika Kecerdasan Buatan: Cermin 'Kota Utama' Al-Farabi",
            content: `<p class="mb-4">Dalam mahakaryanya, "Al-Madinah al-Fadilah" (Kota Utama), filsuf besar Al-Farabi mengemukakan visi sebuah masyarakat ideal yang dipimpin oleh akal budi dan kebajikan. Pemimpinnya, yang ia sebut sebagai "Failasuf-Raja," adalah sosok yang tidak hanya cerdas secara intelektual tetapi juga sempurna secara moral. Visi ini, meski berusia lebih dari seribu tahun, menawarkan kerangka berpikir yang sangat relevan untuk tantangan terbesar kita di abad ke-21: pengembangan Kecerdasan Buatan (AI) yang beretika.</p><p class="mb-4">Jika kita memandang AI sebagai "pemimpin" atau "pengambil keputusan" dalam berbagai sistem modern—mulai dari diagnosis medis, sistem peradilan, hingga kendaraan otonom—maka pertanyaan mendasar yang harus kita ajukan adalah: "Nilai-nilai kebajikan apa yang kita tanamkan padanya?" AI yang hanya dioptimalkan untuk efisiensi dan keuntungan, tanpa landasan etika yang kuat, berisiko menciptakan masyarakat distopia yang dingin dan tidak adil—kebalikan total dari Kota Utama Al-Farabi.</p><p class="mb-4">Membangun AI yang beretika berarti kita harus menjadi "Failasuf-Raja" bagi ciptaan kita. Kita harus secara sadar merancang algoritma yang adil (bebas dari bias), transparan (dapat dijelaskan cara kerjanya), dan akuntabel (ada pihak yang bertanggung jawab atas tindakannya). Ini bukan sekadar tantangan teknis, melainkan sebuah keharusan filosofis. Kita harus memastikan bahwa AI yang kita kembangkan berfungsi untuk mengangkat martabat kemanusiaan, memperkuat keadilan, dan mendorong kesejahteraan bersama, persis seperti pilar-pilar yang menopang "Kota Utama" yang diimpikan Al-Farabi.</p>`
        },
        'social-network': {
            title: "Jaringan Sebagai Sistem Sosial: Gema Jalur Sutra di Era Digital",
            content: `<p class="mb-4">Jalur Sutra bukanlah sekadar rute perdagangan kuno untuk sutra dan rempah-rempah. Ia adalah jaringan global pertama yang revolusioner, sebuah arteri peradaban yang memompa tidak hanya barang, tetapi juga gagasan, teknologi, seni, dan bahkan agama melintasi benua. Di setiap persinggahannya—dari Samarkand hingga Baghdad—terjadi pertukaran pengetahuan yang memperkaya setiap kebudayaan yang terlibat. Konsep ini memiliki gema yang kuat dalam arsitektur jaringan komputer modern.</p><p class="mb-4">Internet, pada intinya, adalah Jalur Sutra digital. Router dan switch berfungsi sebagai 'kota-kota persinggahan' (caravanserai), mengarahkan paket-paket data—'karavan' informasi modern—melalui jalur yang paling efisien. Protokol TCP/IP adalah 'bahasa bersama' yang memungkinkan komunikasi antara 'pedagang' dari berbagai 'bangsa' (sistem operasi dan perangkat). Sama seperti Jalur Sutra yang memiliki jalur utama dan rute-rute alternatif untuk menghindari bahaya, internet dirancang dengan redundansi untuk memastikan informasi tetap mengalir meskipun ada gangguan di satu titik.</p><p>Lebih dalam lagi, dampak sosial keduanya pun serupa. Jalur Sutra memicu Renaisans di Eropa dengan membawa kembali pengetahuan klasik dari dunia Islam. Internet telah memicu revolusi informasi global, mendemokratisasi akses terhadap pengetahuan dan memungkinkan kolaborasi dalam skala yang belum pernah terjadi sebelumnya. Memahami jaringan komputer bukan hanya sebagai entitas teknis, tetapi sebagai sistem sosial yang hidup, membantu kita merancang teknologi yang tidak hanya menghubungkan mesin, tetapi juga memberdayakan manusia.</p>`
        },
        'iot-balance': {
            title: "IoT dan Konsep Keseimbangan Alam: Menuju 'Mizan' Teknologi",
            content: `<p class="mb-4">Dalam pemikiran kosmologi Islam, terdapat konsep 'Mizan' yang berarti keseimbangan. Alam semesta, menurut pandangan ini, diciptakan dalam harmoni yang sempurna, di mana setiap elemen memiliki peran dan fungsinya dalam menjaga tatanan kosmik. Gangguan terhadap keseimbangan ini akan menimbulkan kerusakan ('fasad'). Di tengah krisis iklim dan degradasi lingkungan saat ini, konsep 'Mizan' menawarkan lensa yang kuat untuk melihat potensi sejati dari Internet of Things (IoT).</p><p class="mb-4">Secara tradisional, teknologi sering dipandang sebagai kekuatan yang eksploitatif terhadap alam. Namun, IoT memiliki potensi untuk membalikkan narasi ini. Bayangkan sebuah sistem pertanian cerdas ('smart farming') di mana sensor-sensor IoT di tanah mengukur kelembapan dan nutrisi secara presisi, memungkinkan irigasi dan pemupukan hanya saat diperlukan. Ini bukan hanya tentang efisiensi, tetapi tentang mengembalikan 'Mizan' ke dalam praktik pertanian, mengurangi limbah air dan polusi bahan kimia secara drastis.</p><p>Contoh lain adalah jaringan sensor polusi udara di kota-kota besar yang dapat memberikan data real-time untuk mengatur lalu lintas dan operasi industri, atau 'smart grid' yang menyeimbangkan pasokan energi terbarukan yang fluktuatif dengan permintaan konsumen. Dalam semua aplikasi ini, IoT tidak bertindak sebagai penakluk alam, melainkan sebagai 'penjaga' atau 'pengamat' yang membantu kita memahami dan merespons ritme alam dengan lebih bijaksana. Mengembangkan IoT dengan kesadaran akan 'Mizan' berarti menciptakan teknologi yang tidak hanya 'pintar', tetapi juga 'bijaksana'—teknologi yang membantu kita hidup selaras dengan planet ini, bukan melawannya.</p>`
        },
        'astrolabe-gps': {
            title: "Dari Astrolab ke GPS: Evolusi Memetakan Dunia",
            content: `<p class="mb-4">Astrolab adalah salah satu instrumen ilmiah paling canggih di zamannya. Di tangan para navigator dan astronom Muslim pada Abad Pertengahan, perangkat kuningan yang rumit ini bukan sekadar alat, melainkan jendela menuju kosmos. Ia adalah kalkulator analog yang memungkinkan penggunanya menentukan waktu, memprediksi posisi bintang, dan yang terpenting, menemukan arah kiblat dan menavigasi lautan luas serta gurun yang tak bertepi. Astrolab adalah perwujudan dari penguasaan matematika dan astronomi untuk memetakan posisi diri di dunia.</p><p class="mb-4">Ribuan tahun kemudian, prinsip fundamental di balik astrolab tetap hidup dalam teknologi yang kita gunakan setiap hari: Global Positioning System (GPS). Jika astrolab menggunakan posisi benda-benda langit sebagai titik referensi, GPS menggunakan konstelasi satelit buatan manusia yang mengorbit Bumi. Keduanya bekerja dengan prinsip yang sama: triangulasi. Astrolab melakukannya secara visual dan matematis di atas piringan logam, sementara GPS melakukannya dengan mengukur selisih waktu tempuh sinyal radio dari beberapa satelit.</p><p>Perjalanan dari astrolab ke GPS adalah kisah epik tentang evolusi presisi. Dari menentukan lintang dengan akurasi beberapa derajat, kini kita dapat menentukan lokasi kita di mana pun di planet ini dengan akurasi beberapa sentimeter. Namun, semangat di baliknya tetap sama: dorongan manusia untuk memahami posisinya dalam ruang dan waktu. Teknologi ini, baik yang kuno maupun yang modern, adalah bukti dari kecerdasan kolektif umat manusia dalam upaya tanpa akhir untuk menjawab pertanyaan paling mendasar: "Di manakah kita berada?"</p>`
        },
        'musyawarah-code': {
            title: "Musyawarah & Kode: Kearifan Kolektif dalam Era Digital",
            content: `<p class="mb-4">Jauh sebelum istilah 'kolaborasi' dan 'kerja tim' menjadi frasa kunci dalam manajemen modern, budaya Nusantara telah mengenal konsep 'musyawarah'—sebuah proses pengambilan keputusan yang menekankan dialog, saling mendengarkan, dan pencarian mufakat untuk kebaikan bersama. Kearifan ini bukan sekadar tradisi sosial, melainkan sebuah filosofi kerja yang sangat relevan dengan dunia pengembangan teknologi saat ini, khususnya dalam metodologi Agile dan gerakan open-source.</p><p class="mb-4">Perhatikan ritual harian dalam metodologi Agile seperti 'daily stand-up' atau 'sprint retrospective'. Ini adalah bentuk musyawarah modern. Setiap anggota tim, terlepas dari jabatannya, memiliki suara yang setara untuk menyampaikan kemajuan, kendala, dan ide perbaikan. Tujuannya bukan untuk melapor kepada atasan, melainkan untuk menciptakan transparansi dan memecahkan masalah secara kolektif. Keputusan tidak datang dari atas ke bawah, melainkan lahir dari diskusi dan kesepakatan tim. Ini adalah inti dari musyawarah untuk mufakat.</p><p class="mb-4">Filosofi ini mencapai puncaknya dalam ekosistem 'open-source'. Sebuah proyek seperti Linux atau Python dibangun oleh ribuan kontributor dari seluruh dunia yang tidak saling kenal. Mereka berkolaborasi melalui 'pull requests' (usulan perubahan) dan 'code reviews' (peninjauan kode). Setiap usulan diperdebatkan secara terbuka, diperbaiki bersama, dan diterima berdasarkan manfaat teknisnya, bukan karena otoritas pengusulnya. Ini adalah musyawarah dalam skala global, di mana kecerdasan kolektif terbukti mampu menciptakan perangkat lunak yang andal dan inovatif. Dengan demikian, kearifan kuno tentang musyawarah tidaklah usang; ia justru hidup dan berkembang dalam bentuk baris-baris kode yang membangun masa depan digital kita.</p>`
        },
        'alkhawarizmi-algorithm': {
            title: "Algoritma: Jejak Emas Al-Khwarizmi di Dunia Digital",
            content: `<p class="mb-4">Setiap kali kita menggunakan aplikasi, mencari informasi di internet, atau bahkan saat komputer melakukan booting, kita sedang menyaksikan warisan intelektual agung dari seorang cendekiawan Muslim abad ke-9: Muhammad ibn Musa al-Khwarizmi. Namanya tidak hanya abadi sebagai 'algoritma', tetapi karyanya, "Al-Kitab al-Mukhtasar fi Hisab al-Jabr wal-Muqabala," meletakkan fondasi bagi cara berpikir sistematis yang menjadi jantung dunia digital.</p><p class="mb-4">Al-Khwarizmi tidak menemukan angka, tetapi ia merevolusi cara kita menggunakannya. Ia memperkenalkan metode pemecahan masalah yang dapat dipecah menjadi serangkaian langkah terbatas, jelas, dan dapat diulang—inilah esensi dari sebuah algoritma. Konsep 'al-jabr' (pemulihan atau penyelesaian) yang ia perkenalkan adalah tentang memanipulasi persamaan untuk menemukan solusi yang tidak diketahui. Ini adalah lompatan konseptual yang luar biasa: dari sekadar berhitung menjadi sebuah sistem penalaran logis yang abstrak.</p><p class="mb-4">Warisan ini begitu mendalam. Bahasa pemrograman modern, pada dasarnya, adalah alat untuk menuliskan algoritma yang dapat dipahami mesin. Ketika seorang developer menulis sebuah fungsi 'if-else' atau 'for loop', mereka sedang menerapkan logika langkah-demi-langkah yang sama seperti yang dirintis Al-Khwarizmi. Bahkan sistem kecerdasan buatan yang paling kompleks sekalipun, pada intinya, adalah tumpukan algoritma canggih yang memproses data untuk 'belajar' dan membuat keputusan. Memahami sejarah ini mengingatkan kita bahwa teknologi tercanggih sekalipun berakar pada kearifan kuno dan pencarian manusia yang tak kenal lelah akan keteraturan dan logika di alam semesta.</p>`
        }
    };

    let modalTriggerElement = null, currentActiveModal = null, parentModalForViewer = null;

    const openModal = (modal) => {
        if (!modal || modal.classList.contains('active')) return;
        modalTriggerElement = document.activeElement;
        currentActiveModal = modal;
        modal.classList.add('active');
        document.body.classList.add('body-no-scroll');
        const loader = modal.querySelector('.modal-loader'), mainContent = modal.querySelector('.modal-main-content');
        
        const showContent = () => {
            if(loader) loader.classList.remove('show');
            if(mainContent) mainContent.classList.remove('content-hidden');
            modal.focus();
        };
        
        if (loader) loader.classList.add('show');
        if (mainContent) mainContent.classList.add('content-hidden');
        setTimeout(showContent, 1200); 
    };

    const closeModal = (modal) => {
        if (!modal || !modal.classList.contains('active')) return;
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        modal.classList.remove('active');

        if (modal.id === 'image-viewer-modal' && parentModalForViewer) {
            parentModalForViewer.classList.add('active');
            currentActiveModal = parentModalForViewer;
            parentModalForViewer = null;
        } else {
            document.body.classList.remove('body-no-scroll');
            currentActiveModal = null;
        }

        setTimeout(() => {
            if (modal.id === 'image-viewer-modal') {
                const image = modal.querySelector('.modal-image');
                if (image) image.src = '';
            } else {
                 modal.querySelectorAll('iframe').forEach(iframe => iframe.src = 'about:blank');
                if (modal.id === 'srs-doc-modal' || modal.id === 'cnn-doc-modal') {
                    const docContainer = modal.querySelector('.modal-main-content[id]');
                    if (docContainer) docContainer.innerHTML = '';
                }
            }
            if (!parentModalForViewer && modalTriggerElement) {
                modalTriggerElement.focus();
            }
        }, 400); 
    };


    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-modal-target]');
        if (!button) return;
        
        const modalId = button.dataset.modalTarget;
        const modal = document.querySelector(modalId);
        if (!modal) return;

        const parentModal = button.closest('.modal-overlay');

        if (parentModal && modalId === '#image-viewer-modal') {
            parentModalForViewer = parentModal;
            parentModal.classList.remove('active');
        } else if (parentModal) {
            closeModal(parentModal);
        }

        if (modalId === '#manuscript-modal') {
            const manuscriptId = button.dataset.manuscriptId;
            const manuscriptData = manuscripts[manuscriptId];
            if (manuscriptData) {
                modal.querySelector('#manuscript-modal-title').textContent = manuscriptData.title;
                modal.querySelector('#manuscript-modal-content').innerHTML = manuscriptData.content;
            }
        }

        if (modalId === '#image-viewer-modal') {
             const imageSrc = button.dataset.src;
             const imgElement = modal.querySelector('.modal-image');
             if(imgElement) imgElement.src = imageSrc;
        }
        
        const docId = button.dataset.docId;
        if (docId) { 
            const embedUrl = `https://drive.google.com/file/d/${docId}/preview`;
            const container = modal.querySelector('.modal-body > .modal-main-content[id]'); 
            if (container) {
                container.innerHTML = `<iframe src="${embedUrl}" class="w-full h-full border-none" allow="fullscreen"></iframe>`;
            }
        }
        
        const iframeSrc = button.dataset.iframeSrc;
        if (iframeSrc) {
            const iframe = modal.querySelector('.modal-iframe');
            if (iframe && iframe.getAttribute('src') !== iframeSrc) {
                iframe.src = iframeSrc;
            }
        }
        
        openModal(modal);
    });


    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay); });
        overlay.querySelector('.modal-close-btn')?.addEventListener('click', () => closeModal(overlay));
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && currentActiveModal) closeModal(currentActiveModal); });

    const audioToggleButtons = document.querySelectorAll('.project-audio-toggle');
    const allProjectAudios = document.querySelectorAll('.project-audio');

    audioToggleButtons.forEach(button => {
        const audioId = button.dataset.audioTarget;
        const audioElement = document.querySelector(audioId);
        const buttonIcon = button.querySelector('i');
        const buttonText = button.querySelector('span');

        if (!audioElement) return;

        button.addEventListener('click', () => {
            if (audioElement.paused) {
                allProjectAudios.forEach(audio => {
                    if (audio !== audioElement && !audio.paused) {
                        audio.pause();
                    }
                });
                audioElement.play();
            } else {
                audioElement.pause();
            }
        });

        audioElement.addEventListener('play', () => {
            buttonIcon.className = 'fas fa-pause';
            if (buttonText) buttonText.textContent = 'Jeda Narasi';
            button.classList.add('playing');
        });

        audioElement.addEventListener('pause', () => {
            buttonIcon.className = 'fas fa-play';
            if (buttonText) buttonText.textContent = 'Dengarkan Narasi';
            button.classList.remove('playing');
            audioElement.currentTime = 0;
        });

        audioElement.addEventListener('ended', () => {
             buttonIcon.className = 'fas fa-play';
            if (buttonText) buttonText.textContent = 'Dengarkan Narasi';
            button.classList.remove('playing');
        });
    });
    
    allProjectAudios.forEach(audioEl => {
        audioEl.addEventListener('play', () => {
            audioToggleButtons.forEach(btn => {
                const targetId = btn.dataset.audioTarget;
                if (`#${audioEl.id}` !== targetId) {
                    const otherAudio = document.querySelector(targetId);
                    if(otherAudio && !otherAudio.paused) {
                        otherAudio.pause();
                    }
                    const icon = btn.querySelector('i');
                    const text = btn.querySelector('span');
                    icon.className = 'fas fa-play';
                    if (text) text.textContent = 'Dengarkan Narasi';
                    btn.classList.remove('playing');
                }
            });
        });
    });

    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const emailAddress = document.getElementById('email-address-container').textContent;
            const originalText = copyEmailBtn.textContent;
            navigator.clipboard.writeText(emailAddress).then(() => {
                copyEmailBtn.textContent = 'Alamat email telah disalin!';
                setTimeout(() => copyEmailBtn.textContent = originalText, 2000);
            }).catch(err => console.error('Gagal menyalin:', err));
        });
    }

    let animationFrameId = null;
    let lastRulerAngle = 0;
    const rete = document.getElementById('astrolabe-rete');
    const ruler = document.getElementById('astrolabe-ruler');
    const rulerAlt = document.getElementById('astrolabe-ruler-alt');
    const ring1 = document.getElementById('astrolabe-ring-1'); // Cincin baru 1
    const ring2 = document.getElementById('astrolabe-ring-2'); // Cincin baru 2
    function animateAstrolabe(timestamp) {
        const time = timestamp / 1000;
        const currentRulerAngle = time * 30;
        const counterRulerAngle = time * -5; // Kecepatan berlawanan arah (diperlambat)
        const reteAngle = time * 5;
        const ring1Angle = time * -8;
        const ring2Angle = time * 5;

        // Animasikan astrolab utama
        if (rete) rete.setAttribute('transform', `rotate(${reteAngle} 250 250)`);
        if (ruler) ruler.setAttribute('transform', `rotate(${currentRulerAngle} 250 250)`);
        if (rulerAlt) rulerAlt.setAttribute('transform', `rotate(${counterRulerAngle} 250 250)`);
        if (ring1) ring1.setAttribute('transform', `rotate(${ring1Angle} 250 250)`);
        if (ring2) ring2.setAttribute('transform', `rotate(${ring2Angle} 250 250)`);

        lastRulerAngle = currentRulerAngle;


        animationFrameId = requestAnimationFrame(animateAstrolabe);
    }
    function startAstrolabeAnimation() { if (!animationFrameId) animationFrameId = requestAnimationFrame(animateAstrolabe); }
    function stopAstrolabeAnimation() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } }
    startAstrolabeAnimation();
    
    const astrolabeSvg = document.getElementById('astrolabe-svg');
    if (coverPage && astrolabeSvg) {
        coverPage.addEventListener('mousemove', (e) => {
            const { clientX, clientY, currentTarget } = e;
            const { clientWidth, clientHeight } = currentTarget;
            const x = (clientX / clientWidth - 0.5) * 2;
            const y = (clientY / clientHeight - 0.5) * 2;
            astrolabeSvg.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
        });
        coverPage.addEventListener('mouseleave', () => { astrolabeSvg.style.transform = 'translate(0, 0)'; });
    }

    const starfieldCanvas = document.getElementById('starfield-canvas');
    if (starfieldCanvas) {
        const ctx = starfieldCanvas.getContext('2d');
        let stars = [];
        let shootingStars = []; // Array untuk menyimpan meteor

        const resizeCanvas = () => {
            starfieldCanvas.width = window.innerWidth;
            starfieldCanvas.height = window.innerHeight;
        };

        const createStars = () => {
            stars = [];
            const starCount = Math.floor((starfieldCanvas.width * starfieldCanvas.height) / 8000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * starfieldCanvas.width,
                    y: Math.random() * starfieldCanvas.height,
                    r: Math.random() * 1.2 + 0.3,
                    o: Math.random() * 0.6 + 0.2,
                    od: (Math.random() > 0.5) ? 1 : -1,
                    speed: Math.random() * 0.1 + 0.05
                });
            }
        };

        // Fungsi untuk membuat meteor baru
        const createShootingStar = () => {
            shootingStars.push({
                x: Math.random() * starfieldCanvas.width * 1.5 - (starfieldCanvas.width * 0.25),
                y: 0,
                len: Math.random() * 80 + 20,
                speed: Math.random() * 8 + 12,
                opacity: 1,
            });
        };

        const animateStars = () => {
            ctx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
            
            // Gambar bintang biasa
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > starfieldCanvas.height) {
                    star.y = 0;
                    star.x = Math.random() * starfieldCanvas.width;
                }
                star.o += 0.003 * star.od;
                if (star.o > 0.8 || star.o < 0.2) {
                    star.od *= -1;
                }
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(253, 246, 227, ${star.o})`;
                ctx.fill();
            });

            // Peluang untuk membuat meteor baru (jarang)
            if (Math.random() < 0.0015 && shootingStars.length < 2) {
                createShootingStar();
            }

            // Animasikan dan gambar meteor
            shootingStars.forEach((ss, index) => {
                ss.opacity -= 0.01;
                if (ss.opacity <= 0 || ss.y > starfieldCanvas.height || ss.x > starfieldCanvas.width) {
                    shootingStars.splice(index, 1);
                    return;
                }

                const x2 = ss.x + ss.len;
                const y2 = ss.y + ss.len;

                const gradient = ctx.createLinearGradient(ss.x, ss.y, x2, y2);
                gradient.addColorStop(0, `rgba(253, 246, 227, ${ss.opacity})`);
                gradient.addColorStop(1, 'rgba(253, 246, 227, 0)');

                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.stroke();

                ss.x += ss.speed;
                ss.y += ss.speed;
            });

            requestAnimationFrame(animateStars);
        };
        
        window.addEventListener('resize', () => { resizeCanvas(); createStars(); });
        resizeCanvas();
        createStars();
        animateStars();
    }
    
    const particleCanvas = document.getElementById('particle-canvas');
    let particleAnimationId = null;
    let particles = [];
    let particleCtx;

    function startParticleAnimation() {
        if (particleAnimationId || !particleCanvas) return;
        particleCtx = particleCanvas.getContext('2d');
        
        const resizeCanvas = () => {
            // PERBAIKAN: Menggunakan clientHeight bukan scrollHeight.
            // Ini memastikan kanvas hanya seukuran area yang terlihat,
            // mencegah masalah performa pada halaman yang panjang.
            particleCanvas.width = pageContentContainer.clientWidth;
            particleCanvas.height = pageContentContainer.clientHeight;
            createParticles();
        };

        const createParticles = () => {
            particles = [];
            const particleCount = Math.floor((particleCanvas.width * particleCanvas.height) / 20000);
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * particleCanvas.width,
                    y: Math.random() * particleCanvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 1
                });
            }
        };

        const animateParticles = () => {
            particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            
            particles.forEach(p1 => {
                p1.x += p1.vx;
                p1.y += p1.vy;

                if (p1.x < 0 || p1.x > particleCanvas.width) p1.vx *= -1;
                if (p1.y < 0 || p1.y > particleCanvas.height) p1.vy *= -1;

                particleCtx.beginPath();
                particleCtx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
                particleCtx.fillStyle = 'rgba(199, 165, 91, 0.4)';
                particleCtx.fill();

                particles.forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        particleCtx.beginPath();
                        particleCtx.moveTo(p1.x, p1.y);
                        particleCtx.lineTo(p2.x, p2.y);
                        particleCtx.strokeStyle = `rgba(199, 165, 91, ${0.8 - dist / 150})`;
                        particleCtx.lineWidth = 0.5;
                        particleCtx.stroke();
                    }
                });
            });

            particleAnimationId = requestAnimationFrame(animateParticles);
        };

        const ro = new ResizeObserver(entries => {
            for (let entry of entries) {
                resizeCanvas();
            }
        });
        ro.observe(pageContentContainer);

        resizeCanvas();
        animateParticles();
    }

    function stopParticleAnimation() {
        if(particleAnimationId) {
            cancelAnimationFrame(particleAnimationId);
            particleAnimationId = null;
        }
    }

    // --- BARU: LOGIKA EVOLUSI INTERAKTIF ---
    const evolutionData = {
        'evolusi-data': {
            title: 'Data Digital',
            content: 'Revolusi terbesar dalam sejarah informasi bukanlah penemuan tulisan itu sendiri, melainkan transformasinya dari wujud fisik menjadi data digital. Tulisan dan angka yang dahulu terikat pada batu, lontar, atau kertas, kini dibebaskan menjadi entitas yang tak kasat mata. Di dunia modern, setiap huruf, angka, gambar, bahkan suara, diterjemahkan ke dalam bahasa universal komputer: susunan kode biner nol dan satu. Transformasi fundamental ini memungkinkan informasi untuk disimpan secara ringkas dalam file, diorganisasi secara sistematis dalam database, dan melintasi benua dalam sekejap mata melalui jaringan global.<br><br>Keunggulan data digital melampaui sekadar efisiensi. Ia menawarkan ketahanan yang belum pernah ada sebelumnya; tidak seperti media fisik yang rentan rusak atau hilang, data digital dapat diperbanyak tanpa batas dengan kualitas sempurna. Keamanannya pun ditingkatkan melalui enkripsi, dan aksesnya menjadi universal—dapat dijangkau kapan saja dari berbagai perangkat. Pergeseran ini bukan hanya mengubah cara kita menyimpan pengetahuan, tetapi juga melahirkan peradaban informasi baru. Hampir setiap pilar kehidupan modern, mulai dari pendidikan, perdagangan, komunikasi, hingga seni, kini berdiri di atas fondasi data digital yang berfungsi sebagai tulang punggungnya.'
        },
        'evolusi-io': {
            title: 'Jembatan Antara Manusia & Mesin',
            content: 'Bagaimana cara manusia "berbicara" dengan mesin? Jawabannya terletak pada evolusi perangkat Input/Output (I/O), yang berakar dari prinsip mekanis mesin ketik dan mesin cetak. Keyboard modern adalah keturunan langsung dari mesin ketik, mengubah ketukan jari kita menjadi perintah digital. Sementara itu, monitor adalah kanvas dinamis yang mewarisi fungsi mesin cetak, menampilkan hasil kerja komputer secara instan. Perangkat-perangkat fundamental ini membentuk jembatan pertama, memungkinkan dialog dua arah antara dunia ide manusia dan dunia logika mesin.<br><br>Namun, jembatan ini terus diperluas dan dibuat semakin intuitif. Mouse memberi kita kemampuan untuk "menyentuh" dan memanipulasi objek digital. Layar sentuh menghapus batas antara jari dan perintah, sementara mikrofon memungkinkan kita berbicara langsung dengan perangkat lunak. Di sisi output, speaker memberi suara pada dunia digital, dan teknologi seperti augmented reality memproyeksikan informasi langsung ke dunia nyata. Evolusi ini bukan sekadar tentang menambah perangkat baru, melainkan tentang membuat interaksi dengan teknologi terasa semakin alami, seolah-olah mesin dapat memahami kita tanpa perantara.'
        },
        'evolusi-cpu': {
            title: 'Mesin Logika: Dari Ide ke Silikon',
            content: 'Jauh sebelum ada chip silikon, seorang cendekiawan bernama Al-Khwarizmi memperkenalkan sebuah ide revolusioner: masalah yang rumit dapat dipecahkan dengan mengikuti serangkaian instruksi yang logis dan terurut. Konsep inilah yang kita kenal sebagai algoritma. Selama berabad-abad, ide ini tetap berada di alam teori, hingga akhirnya menemukan wujud fisiknya dalam Central Processing Unit (CPU)—"otak" dari setiap komputer.<br><br>CPU adalah perwujudan algoritma dalam bentuk sirkuit elektronik. Ia tidak berpikir seperti manusia, tetapi ia adalah mesin logika yang tak kenal lelah, mampu mengeksekusi miliaran instruksi algoritmis setiap detiknya dengan presisi absolut. Perangkat lunak, di sisi lain, adalah "jiwa" yang memberikan instruksi tersebut. Tanpa perangkat lunak, CPU hanyalah sepotong silikon yang diam. Tanpa CPU, perangkat lunak hanyalah teks yang tak bermakna. Hubungan simbiosis antara algoritma (perangkat lunak) dan eksekutornya (CPU) inilah yang melahirkan segala keajaiban digital, dari kalkulator sederhana hingga kecerdasan buatan yang kompleks.'
        },
        'evolusi-sensor': {
            title: 'Memberi "Indra" pada Teknologi',
            content: 'Dahulu, para pelaut menatap bintang dan menggunakan astrolab untuk memahami posisi mereka di lautan luas. Mereka membaca alam untuk mendapatkan kesadaran spasial. Kini, semangat yang sama terwujud dalam sensor-sensor modern yang memberi "indra" pada perangkat kita. GPS, misalnya, adalah astrolab digital yang mendengarkan sinyal dari konstelasi satelit untuk mengetahui lokasinya di planet ini dengan akurasi luar biasa. Giroskop dan akselerometer bertindak sebagai "telinga bagian dalam" digital, memberi perangkat kemampuan untuk merasakan orientasi dan gerakan.<br><br>Dengan indra-indra baru ini, teknologi tidak lagi buta terhadap dunia di sekitarnya. Perangkat yang tadinya pasif kini menjadi sadar akan konteks. Smartphone Anda tahu kapan ia sedang digenggam vertikal atau horizontal, jam tangan pintar dapat menghitung langkah Anda, dan mobil dapat merasakan posisinya di jalan. Evolusi dari astrolab ke chip sensor adalah lompatan dari sekadar alat menjadi mitra yang responsif, membuka jalan bagi aplikasi canggih seperti navigasi real-time, augmented reality, dan fondasi untuk kendaraan otonom.'
        },
        'evolusi-otomasi': {
            title: 'Evolusi Tenaga: Dari Otot ke Presisi',
            content: 'Revolusi Industri dimulai dengan sebuah terobosan monumental: mesin uap. Untuk pertama kalinya, manusia dapat menciptakan tenaga yang melampaui batas otot hewan atau kekuatan alam seperti angin dan air. Mesin uap adalah tentang otomatisasi tenaga kasar—menggerakkan lokomotif, memutar mesin di pabrik, dan mengubah wajah produksi selamanya. Ini adalah bab pertama dalam kisah otomatisasi, di mana mesin mengambil alih pekerjaan fisik yang berat dan berulang.<br><br>Kini, kisah itu berlanjut ke bab berikutnya, di mana otomatisasi bukan lagi sekadar tentang kekuatan, tetapi tentang kecerdasan dan presisi. Robotika modern adalah keturunan langsung dari mesin uap, tetapi "otot"-nya digerakkan oleh motor listrik yang presisi dan "otak"-nya adalah komputer. Lengan robot di pabrik perakitan tidak hanya kuat, tetapi mampu melakukan tugas yang sama ribuan kali dengan tingkat kesalahan mendekati nol. Lebih jauh lagi, dengan bantuan AI dan sensor, robot modern dapat "melihat", "merasakan", dan bahkan beradaptasi dengan lingkungannya. Dari mesin uap yang menggerakkan roda raksasa hingga robot bedah yang menjahit dengan presisi sub-milimeter, evolusi otomatisasi adalah perjalanan dari menggantikan otot manusia menjadi memperluas jangkauan kecerdasan manusia.'
        },
        'evolusi-internet': {
            title: 'Jaringan Saraf Digital Dunia',
            content: 'Pernahkah Anda membayangkan bagaimana sebuah pesan dapat melintasi benua dalam sekejap mata? Perjalanan ini dimulai dari percikan listrik sederhana telegraf, disusul oleh suara manusia yang "terbang" melalui kabel telepon, hingga puncaknya: internet. Ini bukanlah sekadar jaringan, melainkan sebuah sistem saraf digital raksasa bagi planet kita. Internet tidak hanya mengirim pesan; ia mengalirkan denyut nadi peradaban modern—data, gambar, video, dan ide—yang menghubungkan miliaran "sel otak" (perangkat) di seluruh dunia.<br><br>Dulu, komunikasi adalah soal menaklukkan jarak. Kini, berkat keajaiban teknologi seperti Wi-Fi yang membebaskan kita dari kabel, 5G yang secepat kilat, dan serat optik yang menjadi tulang punggungnya, komunikasi adalah soal menghapus jarak itu sendiri. Teknologi-teknologi ini melahirkan ekosistem digital tempat cloud, streaming, dan Internet of Things dapat hidup dan berkembang. Perjalanan dari percikan telegraf hingga jaringan global yang selalu aktif ini bukanlah sekadar evolusi teknologi, melainkan kisah tentang bagaimana umat manusia membangun kesadaran kolektifnya sendiri, menciptakan satu ruang di mana kita semua terhubung.'
        }
    };

    const evolutionItems = document.querySelectorAll('.evolution-item');
    const evolutionDisplayContainer = document.getElementById('evolution-display-container');

    function updateEvolutionDisplay(targetId) {
        if (!evolutionDisplayContainer || !evolutionData[targetId]) return;
        
        const contentWrapper = evolutionDisplayContainer.querySelector('.evolution-display-content');
        if (contentWrapper) {
            contentWrapper.classList.add('loading');
        }
        
        setTimeout(() => {
            const data = evolutionData[targetId];
            evolutionDisplayContainer.innerHTML = `
                <div class="evolution-display-content">
                    <h4>${data.title}</h4>
                    <p>${data.content}</p>
                </div>
            `;
        }, 200);
    }

    if (evolutionItems.length > 0 && evolutionDisplayContainer) {
        // Inisialisasi dengan item pertama
        updateEvolutionDisplay(evolutionItems[0].dataset.target);

        evolutionItems.forEach(item => {
            item.addEventListener('click', () => {
                evolutionItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                updateEvolutionDisplay(item.dataset.target);
            });
        });
    }

    // --- BARU: LOGIKA ACCORDION ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');

                header.classList.toggle('active');
                
                if (header.classList.contains('active')) {
                    header.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.padding = '0 0.5rem';
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-times');
                } else {
                    header.setAttribute('aria-expanded', 'false');
                    content.style.maxHeight = '0';
                    content.style.padding = '0 0.5rem';
                     icon.classList.remove('fa-times');
                    icon.classList.add('fa-plus');
                }
            });
        });
    }

});