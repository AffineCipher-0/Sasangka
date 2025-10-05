document.addEventListener('DOMContentLoaded', () => {
    // --- DEFINISI ANIMASI CANVAS ---
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
                
                drawGrid(imgX, imgY, imgSize, 4, '60, 138, 133');

                const steps = 4 - 1;
                const progress = (t % 120) / 120;
                const totalSteps = steps * steps;
                const currentStep = Math.floor(progress * totalSteps);
                filterX = imgX + (currentStep % steps) * (imgSize / 4);
                filterY = imgY + Math.floor(currentStep / steps) * (imgSize / 4);
                ctx.strokeStyle = `rgba(199, 165, 91, 1)`;
                ctx.lineWidth = 3;
                ctx.strokeRect(filterX, filterY, filterSize, filterSize);
                
                const featureMapCells = 3;
                const featureCellSize = featureMapSize / featureMapCells;
                for(let i = 0; i <= currentStep; i++) {
                     const x = featureMapX + (i % featureMapCells) * featureCellSize;
                     const y = featureMapY + Math.floor(i / featureMapCells) * featureCellSize;
                     ctx.fillStyle = `rgba(199, 165, 91, 0.6)`;
                     ctx.fillRect(x, y, featureCellSize, featureCellSize);
                }
                
                ctx.beginPath();
                ctx.moveTo(imgX + imgSize + 10, h / 2);
                ctx.lineTo(featureMapX - 10, h / 2);
                ctx.strokeStyle = 'rgba(199, 165, 91, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
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
                
                ctx.font = `bold ${h/8}px monospace`;
                ctx.fillStyle = 'rgba(60, 138, 133, 1)';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(currentSignal, mcuX - 25, h/2);
                
                ctx.font = `bold ${h/12}px Amiri`;
                ctx.fillText("INPUT", mcuX - 25, h/2 - 25);

                if (!matchFound) {
                    if (t % 4 === 0) {
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

                ctx.font = `bold ${h/10}px monospace`;
                ctx.textAlign = 'center';
                
                const checkItem = dictionary[dictionaryCheckIndex];
                ctx.fillStyle = 'rgba(199, 165, 91, 0.9)';
                ctx.fillText(`${checkItem.char} : ${checkItem.code}`, mcuX + mcuW/2, mcuY + mcuH/2);

                if (matchFound) {
                    const timeSinceMatch = t - timeOfMatch;
                    const highlightAlpha = Math.max(0, 1 - (timeSinceMatch / 60)); 
                    
                    ctx.fillStyle = `rgba(60, 138, 133, ${highlightAlpha * 0.5})`;
                    const rectWidth = ctx.measureText(`${checkItem.char} : ${checkItem.code}`).width + 20;
                    ctx.fillRect(mcuX + mcuW/2 - rectWidth/2, mcuY + mcuH/2 - h/10, rectWidth, h/5);
                    
                    ctx.font = `bold ${h/8}px Amiri`;
                    ctx.fillStyle = `rgba(60, 138, 133, 1)`;
                    ctx.textAlign = 'left';
                    ctx.fillText(checkItem.char, mcuX + mcuW + 25, h/2);
                    
                    ctx.font = `bold ${h/12}px Amiri`;
                    ctx.fillText("OUTPUT", mcuX + mcuW + 25, h/2 - 25);

                    if (timeSinceMatch > 120) {
                        matchFound = false;
                        dictionaryCheckIndex = 0;
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

                drawComponent('\uf108', 'Client (Browser)', client.x, client.y, h*0.3, 'rgba(60, 138, 133, 1)');
                drawComponent('\uf1d3', 'Server (PHP)', server.x, server.y, h*0.25, 'rgba(199, 165, 91, 1)');
                drawComponent('\uf1c0', 'Database (MySQL)', db.x, db.y, h*0.25, 'rgba(199, 165, 91, 1)');

                const progress = (t % cycleDuration) / cycleDuration;
                let packet;

                ctx.lineWidth = 2;
                ctx.font = `italic ${h/18}px Amiri`;
                ctx.textAlign = 'center';

                if (progress < 0.25) {
                    const p = progress / 0.25;
                    packet = { x: client.x + (server.x - client.x) * p, y: client.y + (server.y - client.y) * p, color: 'rgba(60, 138, 133, 0.8)' };
                    ctx.fillStyle = packet.color;
                    ctx.fillText('HTTP Request', client.x + (server.x - client.x) * 0.5, client.y - 30);
                } else if (progress < 0.5) {
                    const p = (progress - 0.25) / 0.25;
                    packet = { x: server.x + (db.x - server.x) * p, y: server.y + (db.y - server.y) * p, color: 'rgba(199, 165, 91, 0.8)' };
                     ctx.fillStyle = packet.color;
                     ctx.fillText('SQL Query', server.x + 30, server.y + (db.y - server.y)*0.5);
                } else if (progress < 0.75) {
                    const p = (progress - 0.5) / 0.25;
                    packet = { x: db.x + (server.x - db.x) * p, y: db.y + (server.y - db.y) * p, color: 'rgba(199, 165, 91, 0.8)' };
                     ctx.fillStyle = packet.color;
                     ctx.fillText('SQL Result', server.x + 30, server.y + (db.y - server.y)*0.5);
                } else {
                     const p = (progress - 0.75) / 0.25;
                     packet = { x: server.x + (client.x - server.x) * p, y: server.y + (client.y - server.y) * p, color: 'rgba(60, 138, 133, 0.8)' };
                    ctx.fillStyle = packet.color;
                    ctx.fillText('HTTP Response', client.x + (server.x - client.x) * 0.5, client.y - 30);
                }
                
                if (packet) {
                    ctx.beginPath();
                    ctx.arc(packet.x, packet.y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = packet.color;
                    ctx.fill();
                }
                
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
                { icon: '\uf043', x: w * 0.15, y: h*0.3, color: '60, 138, 133' },
                { icon: '\uf185', x: w * 0.85, y: h*0.3, color: '199, 165, 91' },
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
            const transitionDuration = 240;

            function loop() {
                t++;
                ctx.clearRect(0, 0, w, h);

                const currentIndex = Math.floor((t / transitionDuration) % piecesFramework.length);
                const currentItem = piecesFramework[currentIndex];

                ctx.strokeStyle = 'rgba(199, 165, 91, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.1);
                ctx.lineTo(w/2, h*0.9);
                ctx.stroke();

                ctx.font = `bold ${h/12}px Amiri`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.7)';
                ctx.textAlign = 'center';
                ctx.fillText('Sistem Manual', manualX, h * 0.2);
                ctx.fillText('Sistem Digital', digitalX, h * 0.2);
                
                ctx.font = `bold ${h/8}px "Font Awesome 6 Free"`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.5)';
                ctx.fillText('\uf061', w/2, h/2);

                ctx.font = `bold ${h/6}px "Font Awesome 6 Free"`;
                ctx.textBaseline = 'middle';

                ctx.fillStyle = 'rgba(199, 165, 91, 0.8)';
                ctx.fillText(currentItem.manualIcon, manualX, h/2);

                ctx.fillStyle = 'rgba(60, 138, 133, 1)';
                ctx.fillText(currentItem.digitalIcon, digitalX, h/2);
                
                ctx.font = `bold ${h/14}px Amiri`;
                ctx.fillStyle = 'rgba(199, 165, 91, 0.9)';
                ctx.fillText(currentItem.manualDesc, manualX, h * 0.7);
                ctx.fillStyle = 'rgba(60, 138, 133, 0.9)';
                ctx.fillText(currentItem.digitalDesc, digitalX, h * 0.7);

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
                
                drawComponent(internet.icon, 'Internet', internet.x, internet.y, h*0.25, 'rgba(60, 138, 133, 1)');
                drawComponent(router.icon, 'Router', router.x, router.y, h*0.2, 'rgba(199, 165, 91, 1)');
                drawComponent(coreSwitch.icon, 'Core Switch', coreSwitch.x, coreSwitch.y, h*0.2, 'rgba(199, 165, 91, 1)');
                drawComponent(servers.icon, 'Servers', servers.x, servers.y, h*0.15, 'rgba(199, 165, 91, 1)');
                
                departments.forEach(dept => {
                    drawComponent(dept.icon, dept.name, dept.x, dept.y, h*0.1, 'rgba(60, 138, 133, 1)');
                });
                
                ctx.strokeStyle = 'rgba(199, 165, 91, 0.3)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(internet.x, internet.y); ctx.lineTo(router.x, router.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(router.x, router.y); ctx.lineTo(coreSwitch.x, coreSwitch.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(coreSwitch.x, coreSwitch.y); ctx.lineTo(servers.x, servers.y); ctx.stroke();
                departments.forEach(dept => {
                    ctx.beginPath(); ctx.moveTo(coreSwitch.x, coreSwitch.y); ctx.lineTo(dept.x, dept.y); ctx.stroke();
                });

                const progress = (t % cycleDuration) / cycleDuration;
                let packet;
                
                if (progress < 0.25) {
                   const p = progress / 0.25;
                   if (p < 0.33) { packet = { x: internet.x + (router.x - internet.x) * (p/0.33), y: router.y }; }
                   else if (p < 0.66) { packet = { x: router.x + (coreSwitch.x - router.x) * ((p-0.33)/0.33), y: router.y }; }
                   else { packet = { x: coreSwitch.x, y: coreSwitch.y + (servers.y - coreSwitch.y) * ((p-0.66)/0.34) }; }
                } else if (progress < 0.5) {
                   const p = (progress - 0.25) / 0.25;
                   const targetDept = departments[1];
                   if (p < 0.5) { packet = { x: servers.x, y: servers.y + (coreSwitch.y - servers.y) * (p/0.5) }; }
                   else { packet = { x: coreSwitch.x + (targetDept.x-coreSwitch.x)*((p-0.5)/0.5), y: coreSwitch.y + (targetDept.y-coreSwitch.y)*((p-0.5)/0.5) }; }
                } else if (progress < 0.75) {
                   const p = (progress - 0.5) / 0.25;
                   const fromDept = departments[3];
                   const toDept = departments[0];
                   if (p < 0.5) { packet = { x: fromDept.x + (coreSwitch.x - fromDept.x) * (p/0.5), y: fromDept.y + (coreSwitch.y - fromDept.y) * (p/0.5) }; }
                   else { packet = { x: coreSwitch.x + (toDept.x-coreSwitch.x)*((p-0.5)/0.5), y: coreSwitch.y + (toDept.y-coreSwitch.y)*((p-0.5)/0.5) }; }
                } else {
                   const p = (progress - 0.75) / 0.25;
                   const fromDept = departments[4];
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

                particles.forEach(p => {
                    p.x += p.speed;
                    if (p.x > lastDirector.x) {
                        p.x = Math.random() * -50;
                        p.y = boomY + (Math.random() - 0.5) * h * 1.2;
                    }
                    if (p.x > reflector.x - 5 && p.x < reflector.x + 5 && Math.abs(p.y - boomY) < reflector.h/2) {
                        p.x = reflector.x - 6;
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
                
                drawAntenna();

                const lobeProgress = (t % 150) / 150;
                const pulse = Math.sin(lobeProgress * Math.PI);
                const lobeSize = w * 0.5 * (0.9 + pulse * 0.1);
                const lobeOpacity = 0.4 + pulse * 0.3;
                
                const startX = elements[1].x;
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

    // --- FUNGSI-FUNGSI ANIMASI YANG DIEKSPOR ---
    window.animations = {
        startCanvasAnimation: function(canvas) {
            const animationFunc = canvasAnimations[canvas.id];
            if (animationFunc) {
                const ctx = canvas.getContext('2d');
                animationFunc(ctx, canvas.width, canvas.height);
            }
        },

        startAstrolabeAnimation: function() {
            if (this.astrolabeAnimationId) return;
            const animate = (timestamp) => {
                const rete = document.getElementById('astrolabe-rete');
                const ruler = document.getElementById('astrolabe-ruler');
                const rulerAlt = document.getElementById('astrolabe-ruler-alt');
                const ring1 = document.getElementById('astrolabe-ring-1');
                const ring2 = document.getElementById('astrolabe-ring-2');
                if (!rete || !ruler) return;

                const time = timestamp / 1000;
                const currentRulerAngle = time * 30;
                const counterRulerAngle = time * -5;
                const reteAngle = time * 5;
                const ring1Angle = time * -8;
                const ring2Angle = time * 5;

                rete.setAttribute('transform', `rotate(${reteAngle} 250 250)`);
                ruler.setAttribute('transform', `rotate(${currentRulerAngle} 250 250)`);
                rulerAlt.setAttribute('transform', `rotate(${counterRulerAngle} 250 250)`);
                ring1.setAttribute('transform', `rotate(${ring1Angle} 250 250)`);
                ring2.setAttribute('transform', `rotate(${ring2Angle} 250 250)`);

                this.astrolabeAnimationId = requestAnimationFrame(animate);
            };
            this.astrolabeAnimationId = requestAnimationFrame(animate);
        },

        stopAstrolabeAnimation: function() {
            if (this.astrolabeAnimationId) {
                cancelAnimationFrame(this.astrolabeAnimationId);
                this.astrolabeAnimationId = null;
            }
        },

        initializeAstrolabeParallax: function() {
            const coverPage = document.getElementById('cover-page');
            const astrolabeSvg = document.getElementById('astrolabe-svg');
            if (coverPage && astrolabeSvg) {
                coverPage.addEventListener('mousemove', (e) => {
                    const { clientX, clientY, currentTarget } = e;
                    const { clientWidth, clientHeight } = currentTarget;
                    const x = (clientX / clientWidth - 0.5) * 2;
                    const y = (clientY / clientHeight - 0.5) * 2;
                    astrolabeSvg.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
                });
                coverPage.addEventListener('mouseleave', () => {
                    astrolabeSvg.style.transform = 'translate(0, 0)';
                });
            }
        },

        initializeStarfield: function() {
            const starfieldCanvas = document.getElementById('starfield-canvas');
            if (!starfieldCanvas) return;

            const ctx = starfieldCanvas.getContext('2d');
            let stars = [];
            let shootingStars = [];

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
                
                stars.forEach(star => {
                    star.y += star.speed;
                    if (star.y > starfieldCanvas.height) {
                        star.y = 0;
                        star.x = Math.random() * starfieldCanvas.width;
                    }
                    star.o += 0.003 * star.od;
                    if (star.o > 0.8 || star.o < 0.2) star.od *= -1;
                    
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(253, 246, 227, ${star.o})`;
                    ctx.fill();
                });

                if (Math.random() < 0.0015 && shootingStars.length < 2) {
                    createShootingStar();
                }

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
        },

        startParticleAnimation: function() {
            const particleCanvas = document.getElementById('particle-canvas');
            const pageContentContainer = document.getElementById('page-content-container');
            if (this.particleAnimationId || !particleCanvas || !pageContentContainer) return;

            const particleCtx = particleCanvas.getContext('2d');
            let particles = [];
            
            const resizeCanvas = () => {
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

                this.particleAnimationId = requestAnimationFrame(animateParticles);
            };

            const ro = new ResizeObserver(entries => {
                for (let entry of entries) {
                    resizeCanvas();
                }
            });
            ro.observe(pageContentContainer);

            resizeCanvas();
            animateParticles();
        },

        stopParticleAnimation: function() {
            if(this.particleAnimationId) {
                cancelAnimationFrame(this.particleAnimationId);
                this.particleAnimationId = null;
            }
        }
    };

    // --- INISIALISASI ANIMASI ---
    window.animations.startAstrolabeAnimation();
    window.animations.initializeAstrolabeParallax();
    window.animations.initializeStarfield();
});