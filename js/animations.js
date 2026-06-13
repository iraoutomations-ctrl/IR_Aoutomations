/* ==========================================================================
   autoRI-studio - js/animations.js
   ========================================================================== */
export function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px -10px -40px -10px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-active');
            } else {
                entry.target.classList.remove('scroll-active');
            }
        });
    }, observerOptions);

    const revealSelectors = [
        '.service-card',
        '.calculator-card-wrapper',
        '.survey-card-wrapper',
        '.contact-card',
        '.hero-content',
        '.hero-mockup',
        '.section-header',
        '.tech-stack-section',
        '.about-content',
        '.about-visual'
    ];

    revealSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });
    });
}

export function initMouseGlow() {
    const glow = document.getElementById('mouseGlow');
    if (!glow) return;

    window.addEventListener('mousemove', (e) => {
        window.requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            glow.style.opacity = '1';
        });
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });
}

export function initParticleTrail() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationFrameId = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#8b5cf6', '#06b6d4', '#3b82f6'];

    function createParticles(x, y, count = 2, speedFactor = 1) {
        for (let i = 0; i < count; i++) {
            const vx = count === 1 ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 3 * speedFactor;
            const vy = count === 1 ? (Math.random() - 0.5) * 1.5 - 0.6 : (Math.random() - 0.5) * 3 * speedFactor - 0.2;
            particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                size: Math.random() * 2.5 + 1.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: count === 1 ? (Math.random() * 0.02 + 0.015) : (Math.random() * 0.03 + 0.02)
            });
        }
        if (!animationFrameId) {
            animate();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.restore();
        }

        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            animationFrameId = null;
        }
    }

    window.addEventListener('mousemove', (e) => {
        createParticles(e.clientX, e.clientY, 1, 0.4);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            createParticles(e.touches[0].clientX, e.touches[0].clientY, 1, 0.4);
        }
    });

    window.addEventListener('click', (e) => {
        createParticles(e.clientX, e.clientY, 15, 1.3);
    });

    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('a, button, .chat-chip, .carousel-item, .service-card, input[type="range"]');
        if (interactive) {
            const now = Date.now();
            const lastHover = interactive.dataset.lastHover || 0;
            if (now - lastHover > 300) {
                interactive.dataset.lastHover = now;
                createParticles(e.clientX, e.clientY, 6, 0.6);
            }
        }
    });
}

export function initRobotMascot() {
    const robot = document.getElementById('heroRobot');
    if (!robot) return;

    const eyeLeft = robot.querySelector('.eye-left .eye-pupil');
    const eyeRight = robot.querySelector('.eye-right .eye-pupil');
    const head = robot.querySelector('.robot-head');
    const torso = robot.querySelector('.robot-torso');
    const armLeft = robot.querySelector('.arm-left');
    const armRight = robot.querySelector('.arm-right');

    window.addEventListener('mousemove', (e) => {
        const rect = robot.getBoundingClientRect();
        const robotX = rect.left + rect.width / 2;
        const robotY = rect.top + rect.height / 2;

        const deltaX = e.clientX - robotX;
        const deltaY = e.clientY - robotY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Limit pupils movement
        const maxPupilMove = 4; // pixels
        const angle = Math.atan2(deltaY, deltaX);
        const pupilX = Math.cos(angle) * Math.min(maxPupilMove, distance * 0.03);
        const pupilY = Math.sin(angle) * Math.min(maxPupilMove, distance * 0.03);

        if (eyeLeft && eyeRight) {
            eyeLeft.style.transform = `translate3d(${pupilX}px, ${pupilY}px, 0)`;
            eyeRight.style.transform = `translate3d(${pupilX}px, ${pupilY}px, 0)`;
        }

        // Tilt the head towards mouse
        const maxTilt = 12; // degrees
        const tiltX = Math.min(maxTilt, Math.max(-maxTilt, (deltaY / window.innerHeight) * maxTilt));
        const tiltY = Math.min(maxTilt, Math.max(-maxTilt, (deltaX / window.innerWidth) * -maxTilt));

        if (head) {
            head.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }

        // Counter-tilt the torso for organic balance
        if (torso) {
            torso.style.transform = `rotateX(${-tiltX * 0.4}deg) rotateY(${-tiltY * 0.4}deg)`;
        }

        // Sway arms slightly based on mouse horizontal movement
        if (armLeft) {
            armLeft.style.transform = `rotate(${12 - tiltY * 0.6}deg)`;
        }
        
        // Only apply mouse sway to right arm if robot is not hovered (so it doesn't conflict with wave)
        const isHovered = robot.matches(':hover');
        if (armRight && !isHovered) {
            armRight.style.transform = `rotate(${-12 - tiltY * 0.6}deg)`;
        }
    });

    // Reset right arm transform on hover end to allow transition back to wave/idle state
    robot.addEventListener('mouseleave', () => {
        if (armRight) {
            armRight.style.transform = '';
        }
    });
}

export function initRoadmapAnimations() {
    const roadmapSection = document.querySelector('.roadmap-section');
    const fillLine = document.getElementById('roadmapLineFill');
    const steps = document.querySelectorAll('.roadmap-step');
    if (!roadmapSection || !fillLine || steps.length === 0) return;

    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    // 1. Smooth scroll-linked filling of the vertical timeline line
    const handleScroll = () => {
        const firstRect = firstStep.getBoundingClientRect();
        const lastRect = lastStep.getBoundingClientRect();
        const triggerY = window.innerHeight * 0.6; // Matches the Observer trigger point (60% from top)
        
        const totalDistance = lastRect.top - firstRect.top;
        if (totalDistance <= 0) return;
        
        const currentProgress = triggerY - firstRect.top;
        let percentage = (currentProgress / totalDistance) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        
        fillLine.style.height = `${percentage}%`;
    };

    // Use requestAnimationFrame for smooth execution on scroll
    let scrollTimeout;
    const scrollListener = () => {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', scrollListener);
    // Run once on load
    handleScroll();

    // 2. Active status and checkmark toggle on scroll for steps
    // When the step dot crosses 60% of viewport height, mark as active
    const stepObserverOptions = {
        root: null,
        rootMargin: '0px 0px -40% 0px',
        threshold: 0.1
    };

    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                const rect = entry.target.getBoundingClientRect();
                if (rect.top > window.innerHeight * 0.6) {
                    entry.target.classList.remove('active');
                }
            }
        });
    }, stepObserverOptions);

    steps.forEach(step => {
        stepObserver.observe(step);
    });
}
