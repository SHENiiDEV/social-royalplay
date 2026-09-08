<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>{{ $game->name }} - Slot Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Syne:wght@800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #07090e; }
        .slot-reel {
            box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.9);
            border-radius: 12px;
        }
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.4); }
            50% { box-shadow: 0 0 45px rgba(234, 179, 8, 0.8); }
        }
        .golden-glow { animation: pulseGlow 2s infinite ease-in-out; }
    </style>
</head>
<body class="text-white select-none overflow-hidden h-screen flex flex-col justify-between p-2 md:p-6 bg-gradient-to-b from-[#090d16] via-[#05070a] to-[#000000]">

    <!-- Top Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl shadow-xl">
        <div class="flex items-center gap-3">
            <span class="text-2xl">🎰</span>
            <div>
                <h1 class="font-extrabold text-sm md:text-base tracking-wide text-amber-400">{{ $game->name }}</h1>
                <span class="text-[10px] text-slate-400 font-mono uppercase bg-slate-800 px-2 py-0.5 rounded">{{ $game->provider_code }} • RTP: {{ $game->rtp_display }}</span>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <div class="text-right">
                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Player Balance</div>
                <div class="text-lg md:text-xl font-mono font-extrabold text-emerald-400" id="userBalanceDisplay">
                    SC {{ number_format($user->game_balance ?? 100, 2) }}
                </div>
            </div>
        </div>
    </div>

    <!-- Main Slot Machine Area -->
    <div class="flex-1 flex flex-col items-center justify-center my-2 relative">
        <div class="w-full max-w-4xl bg-slate-950/90 border-2 border-amber-500/30 rounded-3xl p-3 md:p-6 shadow-2xl relative golden-glow overflow-hidden">
            <!-- Win Banner Overlay -->
            <div id="winOverlay" class="hidden absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center transition-all">
                <div id="winTierBadge" class="text-xs uppercase font-extrabold tracking-widest px-4 py-1 rounded-full bg-amber-500 text-black mb-2 animate-bounce">
                    BIG WIN!
                </div>
                <div id="winAmountDisplay" class="text-4xl md:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                    +SC 0.00
                </div>
                <div class="text-slate-400 text-xs mt-2 font-mono" id="winMultiplierDisplay">Multiplier: 25.00x</div>
            </div>

            <!-- Reels Container (5 Reels x 3 Rows) -->
            <div class="grid grid-cols-5 gap-2 md:gap-4 bg-slate-900/90 p-2 md:p-4 rounded-2xl border border-slate-800/80 slot-reel" id="reelsContainer">
                <!-- 5 Reels generated dynamically -->
            </div>
        </div>
    </div>

    <!-- Bottom Controls & Spin Button -->
    <div class="bg-slate-900/90 backdrop-blur border border-slate-800/80 rounded-2xl p-3 md:p-4 flex flex-wrap items-center justify-between gap-4 max-w-4xl mx-auto w-full">
        <!-- Bet Controls -->
        <div class="flex items-center gap-3">
            <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bet Amount</span>
                <div class="flex items-center gap-2 mt-1">
                    <button onclick="adjustBet(-0.20)" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold active:scale-95 transition">-</button>
                    <span id="betDisplay" class="font-mono font-extrabold text-amber-400 text-base md:text-lg min-w-[70px] text-center">SC 1.00</span>
                    <button onclick="adjustBet(0.20)" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold active:scale-95 transition">+</button>
                </div>
            </div>

            <div class="hidden sm:flex gap-1">
                <button onclick="setBet(0.40)" class="px-2 py-1 bg-slate-800 text-[11px] rounded hover:bg-slate-700 font-mono">0.40</button>
                <button onclick="setBet(1.00)" class="px-2 py-1 bg-slate-800 text-[11px] rounded hover:bg-slate-700 font-mono">1.00</button>
                <button onclick="setBet(2.00)" class="px-2 py-1 bg-slate-800 text-[11px] rounded hover:bg-slate-700 font-mono">2.00</button>
                <button onclick="setBet(5.00)" class="px-2 py-1 bg-slate-800 text-[11px] rounded hover:bg-slate-700 font-mono">5.00</button>
                <button onclick="setBet(10.00)" class="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] rounded hover:bg-amber-500/30 font-mono font-bold">MAX</button>
            </div>
        </div>

        <!-- Last Win Display -->
        <div class="text-center">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Win</span>
            <div id="lastWinDisplay" class="text-lg md:text-xl font-mono font-extrabold text-amber-300">SC 0.00</div>
        </div>

        <!-- Spin Button -->
        <div class="flex items-center gap-3">
            <button id="autoSpinBtn" onclick="toggleAutoSpin()" class="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-700">
                <span id="autoSpinText">AUTO</span>
            </button>

            <button id="spinBtn" onclick="triggerSpin()" class="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-black font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20 tracking-wider transition transform cursor-pointer flex items-center gap-2">
                <span>SPIN</span>
                <span class="text-xl">⚡</span>
            </button>
        </div>
    </div>

    <script>
        const SYMBOLS = [
            { icon: '👑', name: 'Crown', mult: 50, color: 'text-yellow-400' },
            { icon: '💎', name: 'Diamond', mult: 25, color: 'text-cyan-400' },
            { icon: '⚡', name: 'Thunder', mult: 15, color: 'text-amber-400' },
            { icon: '🍒', name: 'Cherry', mult: 10, color: 'text-rose-400' },
            { icon: '🍋', name: 'Lemon', mult: 8, color: 'text-lime-400' },
            { icon: '🍇', name: 'Grape', mult: 6, color: 'text-purple-400' },
            { icon: '⭐', name: 'Star', mult: 4, color: 'text-yellow-300' },
            { icon: '7️⃣', name: 'Seven', mult: 30, color: 'text-red-500' },
        ];

        let currentBet = 1.00;
        let isSpinning = false;
        let isAutoSpin = false;
        let userCode = '{{ $user->user_code ?? "user_1" }}';
        let gameCode = '{{ $game->game_code }}';
        let providerCode = '{{ $game->provider_code }}';

        // Sound Synthesizer via Web Audio API (No external sound files required)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playTone(freq, duration = 0.1, type = 'sine') {
            try {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch(e) {}
        }

        function showError(msg) {
            let toast = document.getElementById('errorToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'errorToast';
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-rose-950/95 border-2 border-rose-500 text-rose-200 px-6 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200';
                document.body.appendChild(toast);
            }
            toast.innerHTML = '<span>⚠️</span> <span>' + msg + '</span>';
            toast.classList.remove('hidden');
            clearTimeout(window._errTimeout);
            window._errTimeout = setTimeout(() => toast.classList.add('hidden'), 4500);
        }

        function playWinFanfare() {
            [440, 554, 659, 880].forEach((freq, idx) => {
                setTimeout(() => playTone(freq, 0.3, 'triangle'), idx * 120);
            });
        }

        // Initialize 5x3 Grid
        function initGrid() {
            const container = document.getElementById('reelsContainer');
            container.innerHTML = '';
            for (let r = 0; r < 5; r++) {
                const reelCol = document.createElement('div');
                reelCol.className = 'flex flex-col gap-2 bg-black/40 p-1.5 md:p-3 rounded-xl border border-slate-800/60';
                reelCol.id = `reel_${r}`;
                for (let row = 0; row < 3; row++) {
                    const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                    const symBox = document.createElement('div');
                    symBox.className = 'h-16 md:h-24 flex items-center justify-center bg-slate-900/80 rounded-xl text-3xl md:text-5xl shadow transition-transform';
                    symBox.innerHTML = `<span>${sym.icon}</span>`;
                    reelCol.appendChild(symBox);
                }
                container.appendChild(reelCol);
            }
        }
        initGrid();

        function adjustBet(delta) {
            if (isSpinning) return;
            currentBet = Math.max(0.20, Math.min(100.00, +(currentBet + delta).toFixed(2)));
            document.getElementById('betDisplay').innerText = 'SC ' + currentBet.toFixed(2);
            playTone(600, 0.05);
        }

        function setBet(amount) {
            if (isSpinning) return;
            currentBet = amount;
            document.getElementById('betDisplay').innerText = 'SC ' + currentBet.toFixed(2);
            playTone(700, 0.05);
        }

        function toggleAutoSpin() {
            isAutoSpin = !isAutoSpin;
            const btn = document.getElementById('autoSpinBtn');
            const text = document.getElementById('autoSpinText');
            if (isAutoSpin) {
                btn.className = 'px-3 py-3 rounded-xl bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1 border border-rose-500 animate-pulse';
                text.innerText = 'STOP';
                if (!isSpinning) triggerSpin();
            } else {
                btn.className = 'px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-700';
                text.innerText = 'AUTO';
            }
        }

        async function triggerSpin() {
            if (isSpinning) return;
            isSpinning = true;
            document.getElementById('spinBtn').disabled = true;
            document.getElementById('spinBtn').classList.add('opacity-50');

            // Sound effect
            playTone(300, 0.15, 'sawtooth');

            // Generate unique txn_id for GGR Webhook
            const txnId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            const roundId = 'rnd_' + Date.now();

            // Animate Reels spinning
            const reelIntervals = [];
            for (let r = 0; r < 5; r++) {
                const col = document.getElementById(`reel_${r}`);
                const interval = setInterval(() => {
                    playTone(200 + r * 50, 0.03);
                    const children = col.children;
                    for (let c of children) {
                        const randomSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        c.innerHTML = `<span>${randomSym.icon}</span>`;
                        c.classList.add('scale-90', 'opacity-80');
                    }
                }, 80);
                reelIntervals.push(interval);
            }

            // Decide RNG win on client/mock engine (or webhooks)
            const isWin = Math.random() < 0.42; // ~42% hit frequency
            let winAmount = 0;
            let chosenSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            if (isWin) {
                const multRandom = (Math.random() < 0.1) ? (15 + Math.random() * 85) : (1.2 + Math.random() * 8);
                winAmount = +(currentBet * multRandom).toFixed(2);
            }

            // Call Webhook POST /gold_api seamlessly
            try {
                const response = await fetch('/gold_api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        method: 'transaction',
                        agent_code: 'crowdplay',
                        agent_token: 'c9540f990614ec0e60efa22d4c5fe5fe',
                        user_code: userCode,
                        game_code: gameCode,
                        provider_code: providerCode,
                        bet_money: currentBet,
                        win_money: winAmount,
                        txn_id: txnId,
                        txn_id_v2: txnId + '_v2',
                        round_id: roundId,
                        txn_type: 'debit_credit'
                    })
                });

                const result = await response.json();
                
                // Stop reels sequentially
                for (let r = 0; r < 5; r++) {
                    await new Promise(res => setTimeout(res, 200));
                    clearInterval(reelIntervals[r]);
                    const col = document.getElementById(`reel_${r}`);
                    for (let row = 0; row < 3; row++) {
                        const sym = (isWin && row === 1 && r < 4) ? chosenSym : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        col.children[row].innerHTML = `<span class="${sym.color}">${sym.icon}</span>`;
                        col.children[row].classList.remove('scale-90', 'opacity-80');
                        col.children[row].classList.add('scale-105');
                        setTimeout(() => col.children[row].classList.remove('scale-105'), 150);
                    }
                    playTone(500 + r * 100, 0.08);
                }

                if (result.status === 1) {
                    // Update Balance Display
                    document.getElementById('userBalanceDisplay').innerText = 'SC ' + Number(result.user_balance).toFixed(2);
                    
                    if (winAmount > 0) {
                        handleWinCelebration(winAmount, +(winAmount / currentBet).toFixed(2));
                    } else {
                        document.getElementById('lastWinDisplay').innerText = 'SC 0.00';
                    }
                } else {
                    showError(result.msg || 'Insufficient funds! Spin the Daily Wheel or claim your Free Daily Bonus in Lobby.');
                    isAutoSpin = false;
                }

            } catch (err) {
                console.error(err);
                // Clear all intervals
                reelIntervals.forEach(clearInterval);
            } finally {
                isSpinning = false;
                document.getElementById('spinBtn').disabled = false;
                document.getElementById('spinBtn').classList.remove('opacity-50');

                if (isAutoSpin) {
                    setTimeout(() => { if (isAutoSpin) triggerSpin(); }, 1200);
                }
            }
        }

        function handleWinCelebration(amount, mult) {
            document.getElementById('lastWinDisplay').innerText = '+SC ' + amount.toFixed(2);
            playWinFanfare();

            if (mult >= 10 || amount >= 20) {
                const overlay = document.getElementById('winOverlay');
                const badge = document.getElementById('winTierBadge');
                const amountEl = document.getElementById('winAmountDisplay');
                const multEl = document.getElementById('winMultiplierDisplay');

                if (amount >= 500 || mult >= 50) {
                    badge.innerText = '👑 EPIC WIN!';
                    badge.className = 'text-xs uppercase font-extrabold tracking-widest px-6 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black mb-2 animate-bounce shadow-lg shadow-amber-500/50';
                } else if (amount >= 100 || mult >= 25) {
                    badge.innerText = '⚡ MEGA WIN!';
                    badge.className = 'text-xs uppercase font-extrabold tracking-widest px-6 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white mb-2 animate-bounce';
                } else {
                    badge.innerText = '💎 BIG WIN!';
                    badge.className = 'text-xs uppercase font-extrabold tracking-widest px-6 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black mb-2 animate-bounce';
                }

                amountEl.innerText = '+SC ' + amount.toFixed(2);
                multEl.innerText = `Multiplier: ${mult}x`;
                overlay.classList.remove('hidden');

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                setTimeout(() => {
                    overlay.classList.add('hidden');
                }, 2200);
            }
        }
    </script>
</body>
</html>
