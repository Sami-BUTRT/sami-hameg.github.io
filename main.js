/* 1. INITIALISATION DES PARTICULES */
particlesJS('particles-js', {
    particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: '#00f2ff' },
        shape: { type: 'circle' },
        opacity: { value: 0.3, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#00f2ff', opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1.5, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'grab' } },
        modes: { grab: { distance: 140, line_linked: { opacity: 0.5 } } }
    },
    retina_detect: true
});

/* 2. MODE MATRIX (DIGITAL RAIN) */
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*'.split('');
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];
for(let i=0; i<columns; i++) drops[i] = 1;

let matrixInterval;
function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const isRed = document.body.classList.contains('red-alert');
    ctx.fillStyle = isRed ? '#ff003c' : '#00ff41';

    ctx.font = fontSize + 'px monospace';
    for(let i=0; i<drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i*fontSize, drops[i]*fontSize);
        if(drops[i]*fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

/* 3. EFFETS DE SCROLL ET HUD */
const revealElements = document.querySelectorAll('.reveal-element');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('revealed'); });
}, { threshold: 0.1 });
revealElements.forEach(el => observer.observe(el));

const hudBox = document.getElementById('hud-box');
document.querySelectorAll('.hud-tooltip').forEach(el => {
    el.addEventListener('mouseenter', () => { hudBox.innerText = el.getAttribute('data-tooltip'); hudBox.style.opacity = '1'; });
    el.addEventListener('mousemove', (e) => { hudBox.style.left = (e.clientX + 15) + 'px'; hudBox.style.top = (e.clientY + 15) + 'px'; });
    el.addEventListener('mouseleave', () => { hudBox.style.opacity = '0'; });
});

/* 4. DÉCRYPTAGE AU SURVOL */
const decryptTargets = document.querySelectorAll('.decrypt-target');
const decryptChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
decryptTargets.forEach(target => {
    const originalText = target.dataset.text;
    target.addEventListener('mouseover', () => {
        let iteration = 0;
        const interval = setInterval(() => {
            target.innerText = originalText.split('').map((char, index) => {
                if (index < iteration) return originalText[index];
                return decryptChars[Math.floor(Math.random() * decryptChars.length)];
            }).join('');
            if (iteration >= originalText.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);
    });
    target.addEventListener('mouseout', () => target.innerText = originalText);
});

/* 5. EXTRACTION DE DONNÉES (PRESSE-PAPIERS) */
const emailLink = document.getElementById('email-extract');
emailLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('contact@samihameg.page');
    const original = emailLink.innerText;
    emailLink.innerText = '[ DATA EXTRACTED SUCCESSFULLY ]';
    emailLink.classList.add('extracted');

    setTimeout(() => {
        emailLink.innerText = original;
        emailLink.classList.remove('extracted');
    }, 2500);
});

/* 6. SCANNER BIOMÉTRIQUE (CV) */
const bioBtn = document.getElementById('biometric-btn');
const bioText = document.getElementById('biometric-text');
let scanTimer;
let scanSuccess = false;

bioBtn.addEventListener('mousedown', startScan);
bioBtn.addEventListener('touchstart', startScan);
bioBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startScan(e); }
});
window.addEventListener('mouseup', stopScan);
window.addEventListener('touchend', stopScan);
bioBtn.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { stopScan(); }
});

function downloadPDF(path, downloadName) {
    const a = document.createElement('a');
    a.href = path;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function startScan(e) {
    if(scanSuccess) return;

    bioBtn.classList.add('scanning');
    bioText.innerText = "VERIFYING IDENTITY...";
    bioText.style.color = "var(--primary-color)";

    scanTimer = setTimeout(() => {
        scanSuccess = true;
        bioBtn.classList.remove('scanning');
        bioBtn.classList.add('granted');
        bioText.innerText = "[ ACCESS GRANTED ] - DOWNLOADING...";
        bioText.style.color = "#00ff00";

        setTimeout(() => {
            downloadPDF('CV_STAGE_HAMEG_Sami.pdf', 'CV_STAGE_HAMEG_Sami.pdf');
            setTimeout(() => {
                downloadPDF('CV_ALTERNANCE_HAMEG_Sami.pdf', 'CV_ALTERNANCE_HAMEG_Sami.pdf');
            }, 300);

            setTimeout(() => {
                scanSuccess = false;
                bioBtn.classList.remove('granted');
                bioText.innerText = "HOLD_TO_DECRYPT_CV.pdf";
                bioText.style.color = "var(--primary-color)";
            }, 3000);
        }, 800);

    }, 1500);
}

function stopScan() {
    clearTimeout(scanTimer);
    if(!scanSuccess && bioBtn.classList.contains('scanning')) {
        bioBtn.classList.remove('scanning');
        bioText.innerText = "ACCESS DENIED - HOLD LONGER";
        bioText.style.color = "var(--accent-color)";
        setTimeout(() => {
            if(!scanSuccess) {
                bioText.innerText = "HOLD_TO_DECRYPT_CV.pdf";
                bioText.style.color = "var(--primary-color)";
            }
        }, 1500);
    }
}

/* 7. TERMINAL, RED ALERT & MATRIX TOGGLE */
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

document.querySelector('.typing').style.animation = 'typing-sequence 2s steps(17) forwards';
setTimeout(() => { document.querySelector('.typing-delayed').style.animation = 'typing-sequence 2s steps(28) forwards'; document.querySelector('.typing-delayed').style.opacity = '1'; }, 2400);
setTimeout(() => { document.querySelector('.typing-interactive-prompt').style.opacity = '1'; }, 4600);

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = terminalInput.value.toLowerCase().trim();
        terminalInput.value = '';

        if (command === 'clear') {
            terminalOutput.innerText = '';
        }
        else if (command === 'whoami') {
            terminalOutput.innerText = '> SYSTEM USER: SAMI HAMEG. ROLE: CYBERSECURITY STUDENT.';
        }
        else if (command === 'sudo su' || command === 'alert') {
            document.body.classList.toggle('red-alert');
            const isRed = document.body.classList.contains('red-alert');

            if (isRed) {
                terminalOutput.innerHTML = '<span style="color:#ff003c; font-weight:bold;">> CRITICAL WARNING: ROOT ACCESS BREACH DETECTED.</span>';
                document.querySelector('.status-online').style.color = '#ff003c';
                document.querySelector('.status-online').innerText = 'COMPROMISED';
            } else {
                terminalOutput.innerText = '> SYSTEM RESTORED TO SECURE STATE.';
                document.querySelector('.status-online').style.color = '#00ff00';
                document.querySelector('.status-online').innerText = 'PROTECTED';
            }

            if(window.pJSDom && window.pJSDom.length > 0) {
                const pjs = window.pJSDom[0].pJS;
                const color = isRed ? '#ff003c' : '#00f2ff';
                pjs.particles.color.value = color;
                pjs.particles.line_linked.color = color;
                pjs.fn.particlesRefresh();
            }
        }
        else if (command === 'matrix') {
            document.body.classList.toggle('matrix-mode');
            if (document.body.classList.contains('matrix-mode')) {
                document.getElementById('particles-js').style.display = 'none';
                canvas.style.display = 'block';
                if(!matrixInterval) matrixInterval = setInterval(drawMatrix, 33);
                terminalOutput.innerText = '> WAKE UP, NEO. MATRIX PROTOCOL INITIATED.';
            } else {
                document.getElementById('particles-js').style.display = 'block';
                canvas.style.display = 'none';
                clearInterval(matrixInterval);
                matrixInterval = null;
                terminalOutput.innerText = '> MATRIX PROTOCOL DEACTIVATED.';
            }
        }
        else if (command === '') {
            terminalOutput.innerText = '';
        } else {
            terminalOutput.innerText = `> COMMAND NOT FOUND: ${command}. Try 'matrix', 'sudo su', 'whoami', 'clear'.`;
        }
    }
});
