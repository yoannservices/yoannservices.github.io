    const targetDate = new Date("2026-11-19T14:00:00").getTime();
    const announceDate = new Date("2023-12-04T00:00:00").getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        document.getElementById("countdown").innerHTML = `
          <div style="grid-column:1/-1;text-align:center">
            <h2 style="font-size:2.2rem;margin:0">🎮 GTA VI est sorti !</h2>
            <p style="color:var(--ink-soft);margin-top:8px">Bienvenue à Vice City</p>
          </div>`;
        launchConfetti();
        document.getElementById("progress-fill").style.width = "100%";
        document.getElementById("progress-pct").textContent = "100%";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById("days").textContent = days;
      document.getElementById("hours").textContent = hours;
      document.getElementById("minutes").textContent = minutes;
      document.getElementById("seconds").textContent = seconds;

      // Progress bar
      const total = targetDate - announceDate;
      const elapsed = now - announceDate;
      const pct = Math.min(100, Math.max(0, (elapsed / total) * 100)).toFixed(1);
      document.getElementById("progress-fill").style.width = pct + "%";
      document.getElementById("progress-pct").textContent = pct + "%";
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* Share */
    function shareCountdown(platform) {
      const now = new Date().getTime();
      const days = Math.floor((targetDate - now) / (1000 * 60 * 60 * 24));
      const text = `🎮 GTA VI sort dans ${days} jours ! Plus que ${days}J avant Vice City 🌴`;

      if (platform === "twitter") {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          const btn = document.getElementById('btn-copy');
          if (btn) { btn.textContent = "✅"; setTimeout(() => btn.textContent = "📋", 1500); }
        });
      }
    }

    /* Visitor counter (localStorage simulation) */
    (function() {
      const VC_KEY = 'gta-visit-count';
      let count = parseInt(localStorage.getItem(VC_KEY) || '0', 10);
      if (!sessionStorage.getItem('gta-visited')) {
        count++;
        localStorage.setItem(VC_KEY, count);
        sessionStorage.setItem('gta-visited', '1');
      }
      const el = document.getElementById('visitor-count');
      if (el) el.textContent = `👁️ ${count.toLocaleString('fr-FR')} visite${count > 1 ? 's' : ''} sur cet appareil`;
    })();

    /* Confetti for D-day */
    function launchConfetti() {
      for (let i = 0; i < 60; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.left = Math.random() * 100 + "vw";
        c.style.animationDuration = (Math.random() * 2 + 2) + "s";
        c.style.animationDelay = Math.random() * 2 + "s";
        c.style.background = ["#7ec4ff","#ff9a6e","#ffdd57","#a0ff9a","#ff6eb4"][Math.floor(Math.random()*5)];
        document.body.appendChild(c);
      }
    }