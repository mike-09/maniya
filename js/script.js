document.addEventListener("DOMContentLoaded", () => {
    const mains = Array.from(document.querySelectorAll("body > main"));
    const visuals = Array.from(document.querySelectorAll(".visual"));
    const body = document.body;
    const colors = ["red", "orange", "blue", "green"];
    let current = 0;
    let locked = false;

    const viewport = document.createElement("div");
    const track = document.createElement("div");
    viewport.className = "slider-viewport";
    track.className = "slider-track";
    mains[0].before(viewport);
    viewport.appendChild(track);
    mains.forEach(m => track.appendChild(m));

    Object.assign(viewport.style, {
        position: "relative",
        overflow: "hidden",
        width: "100%"
    });

    Object.assign(track.style, {
        display: "flex",
        transition: "transform 0.9s cubic-bezier(0.77, 0, 0.175, 1)",
        willChange: "transform",
        height: "100%"
    });

    mains.forEach(m => {
        m.style.flex = "0 0 100%";
        m.style.position = "relative";
    });

    function syncHeight() {
        viewport.style.height = "calc(100vh - 91px)";
    }

    window.addEventListener("resize", syncHeight);

    function updateVisuals() {
        visuals.forEach((v, i) => {
            v.style.opacity = i === current ? "1" : "0";
            v.style.transition = "opacity 0.6s ease";
            v.style.pointerEvents = "none";
        });
    }

    function updateBackground() {
        body.classList.remove("red", "orange", "blue", "green");
        body.classList.add(colors[current]);
    }

    function triggerEnterAnimation() {
        const activeMain = mains[current];
        const activeVisual = visuals[current];
        setTimeout(() => {
            activeMain?.classList.add('animate-in');
            activeVisual?.classList.add('animate-in');
        }, 50);
        setTimeout(() => {
            activeMain?.classList.add('animate-done');
            activeVisual?.classList.add('animate-done');
        }, 1500);
    }

    function clearAnimations() {
        mains.forEach(m => {
            m.classList.remove('animate-in', 'animate-out', 'animate-done');
        });
        visuals.forEach(v => {
            v.classList.remove('animate-in', 'animate-done');
        });
    }

    function goTo(index) {
        if (locked) return;
        locked = true;
        viewport.classList.add('is-animating');
        clearAnimations();
        if (mains[current]) {
            mains[current].classList.add('animate-out');
        }
        current = (index + mains.length) % mains.length;
        viewport.style.transform = 'scale(1.02)';
        viewport.style.transition = 'transform 0.3s ease';
        track.style.transform = `translateX(-${current * 100}%)`;
        setTimeout(() => {
            updateBackground();
            updateVisuals();
            mains.forEach(m => m.classList.remove('animate-out'));
            setTimeout(() => {
                triggerEnterAnimation();
                viewport.style.transform = 'scale(1)';
                setTimeout(() => {
                    syncHeight();
                    locked = false;
                    viewport.classList.remove('is-animating');
                }, 300);
            }, 200);
        }, 400);
    }

    // ===== PARTICLES ENGINE =====
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4
    }));

    function renderParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
            ctx.fill();
        }

        requestAnimationFrame(renderParticles);
    }

    renderParticles();

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;

        const activeImg = document.querySelector('.visual.animate-done .visual__img');
        if (activeImg) {
            activeImg.style.transform =
                `translate3d(${x}px, ${y}px, 0) scale(1) rotateY(${x * 0.1}deg)`;
        }

        const activeShadow = document.querySelector('.visual.animate-done .visual__shadow');
        if (activeShadow) {
            activeShadow.style.transform =
                `translate3d(${x * 0.7}px, ${y * 0.7}px, 0) scale(1)`;
        }
    });

    document.querySelectorAll(".slide-right").forEach(btn =>
        btn.addEventListener("click", () => goTo(current + 1))
    );

    document.querySelectorAll(".slide-left").forEach(btn =>
        btn.addEventListener("click", () => goTo(current - 1))
    );

    updateBackground();
    updateVisuals();
    syncHeight();
    setTimeout(() => {
        triggerEnterAnimation();
    }, 100);
});