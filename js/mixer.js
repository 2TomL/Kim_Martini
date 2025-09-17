// Sample Mixer Web Audio API
const samples = {
	low: 'assets/mixer/mix_1/kick.mp3',
	mid: 'assets/mixer/mix_1/Claps.mp3',
	high: 'assets/mixer/mix_1/HH.mp3'
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.gain.value = 1;
masterGain.connect(audioCtx.destination);

let buffers = {};
let sources = {};
let gains = {};
let startTime = 0;
let pauseTime = 0;
let isPlaying = false;


// --- SVG Knob Logic ---
const STEP = 32;
const DEG_RANGE = 135;
function createSVGKnob({ knobId, gradateId, sliderId, sliderShadowId, initial = 100, onChange }) {
	const knob = document.getElementById(knobId);
	const gradateGroup = document.getElementById(gradateId);
	const slider = document.getElementById(sliderId);
	const sliderShadow = document.getElementById(sliderShadowId);
	let value = initial;

	// Gradate lines
	const gradateLineTemplate = (deg, hue) =>
		`<line data-deg="${deg}" class="active" style="--deg: ${deg}deg; --h: ${hue}" x1="300" y1="30" x2="300" y2="70" />`;
	let gradateLines = ``;
	const Q = DEG_RANGE / STEP;
	for (let i = DEG_RANGE * -1; i <= DEG_RANGE; i += Q) {
		gradateLines += gradateLineTemplate(i, i + DEG_RANGE * 2);
	}
	gradateGroup.innerHTML = gradateLines;
	const gradateLineEls = gradateGroup.querySelectorAll("line");

	function deactiveAll() {
		gradateLineEls.forEach((l) => {
			l.classList.remove("active");
		});
	}
	function active(v) {
		for (let i = 0; i < gradateLineEls.length; i++) {
			const l = gradateLineEls[i];
			if (parseFloat(l.dataset.deg) >= v) l.classList.add("active");
		}
	}
	function setValue(v) {
		value = Math.max(DEG_RANGE * -1, Math.min(DEG_RANGE, v));
		deactiveAll();
		active(value);
		slider.style.setProperty("--deg", `${value}deg`);
		sliderShadow.style.setProperty("--deg", `${value}deg`);
		slider.style.setProperty("--h", `${value * 1 + DEG_RANGE * 2}`);
		if (onChange) onChange(getPercent());
	}
	function getPercent() {
		// Mapping: 100% is rechts (DEG_RANGE), 0% is links (-DEG_RANGE)
		return Math.round(((value + DEG_RANGE) / (DEG_RANGE * 2)) * 100);
	}
	function setByPercent(percent) {
		value = ((percent / 100) * (DEG_RANGE * 2)) - DEG_RANGE;
		setValue(value);
	}
	// Drag functionaliteit
	let dragging = false;
	function onPointerMove(e) {
		if (!dragging) return;
		let clientX, clientY;
		if (e.touches && e.touches.length) {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else {
			clientX = e.clientX;
			clientY = e.clientY;
		}
		setByCoords(clientX, clientY);
	}
	function stopDrag() {
		dragging = false;
		knob.classList.remove("without-animate");
		knob.style.cursor = "unset";
		window.removeEventListener('mousemove', onPointerMove);
		window.removeEventListener('mouseup', stopDrag);
		window.removeEventListener('touchmove', onPointerMove);
		window.removeEventListener('touchend', stopDrag);
	}
	function startDrag(e) {
		dragging = true;
		knob.classList.add("without-animate");
		knob.style.cursor = "grabbing";
		onPointerMove(e);
		window.addEventListener('mousemove', onPointerMove);
		window.addEventListener('mouseup', stopDrag);
		window.addEventListener('touchmove', onPointerMove);
		window.addEventListener('touchend', stopDrag);
		e.preventDefault();
	}
	function setByCoords(clientX, clientY) {
		const rect = knob.getBoundingClientRect();
		const CX = rect.width / 2;
		const CY = rect.height / 2;
		const x = clientX - rect.left;
		const y = clientY - rect.top;
		// Draai 90 graden zodat 0 graden boven is, 100% rechtsboven
		const r = Math.atan2(y - CY, x - CX);
		let deg = (r * 180) / Math.PI + 90;
		if (deg > 180) deg -= 360;
		let v = deg;
		v = v <= DEG_RANGE * -1 ? DEG_RANGE * -1 : v;
		v = v >= DEG_RANGE ? DEG_RANGE : v;
		setValue(v);
	}
	knob.addEventListener('mousedown', startDrag);
	knob.addEventListener('touchstart', startDrag);
	knob.addEventListener('click', (e) => {
		if (!dragging) setByCoords(e.clientX, e.clientY);
	});
	// Keyboard
	knob.addEventListener('keydown', e => {
		if (e.key === 'ArrowUp') setByPercent(getPercent() + 1);
		if (e.key === 'ArrowDown') setByPercent(getPercent() - 1);
	});
	// Mouse wheel
	knob.addEventListener('wheel', e => {
		e.preventDefault();
		setByPercent(getPercent() - e.deltaY / 10);
	});
	// Init
	setByPercent(initial);
	return {
		set: setByPercent,
		get: getPercent
	};
}

// --- Mixer Logic ---
// Load all samples
async function loadSample(name, url) {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
	buffers[name] = audioBuffer;
}

async function loadAllSamples() {
	await Promise.all(Object.entries(samples).map(([name, url]) => loadSample(name, url)));
}

function createSource(name, offset = 0) {
	const source = audioCtx.createBufferSource();
	source.buffer = buffers[name];
	source.loop = true;
	const gainNode = audioCtx.createGain();
	gainNode.gain.value = knobValues[name] / 100;
	source.connect(gainNode).connect(masterGain);
	sources[name] = source;
	gains[name] = gainNode;
	return { source, gainNode };
}

function playAll(offset = 0) {
	Object.keys(samples).forEach(name => {
		const { source } = createSource(name, offset);
		source.start(0, offset);
	});
	isPlaying = true;
	startTime = audioCtx.currentTime - offset;
}

function stopAll() {
	Object.values(sources).forEach(source => {
		try { source.stop(); } catch {}
	});
	sources = {};
	isPlaying = false;
}

function getCurrentOffset() {
	if (!isPlaying) return pauseTime;
	return (audioCtx.currentTime - startTime) % buffers.low.duration;
}

function pauseAll() {
	pauseTime = getCurrentOffset();
	stopAll();
}

function resumeAll() {
	playAll(pauseTime);
}

function playChannel(name) {
	// Altijd opnieuw starten op de juiste offset, zodat alles in sync blijft
	if (sources[name]) {
		try { sources[name].stop(); } catch {}
		delete sources[name];
	}
	// Alleen starten als de master loopt
	if (isPlaying) {
		const offset = getCurrentOffset();
		const { source } = createSource(name, offset);
		source.start(0, offset);
	}
}

function pauseChannel(name) {
	if (!sources[name]) return;
	try { sources[name].stop(); } catch {}
	delete sources[name];
}

function updateVolume(name, value) {
	knobValues[name] = value;
	if (gains[name]) {
		gains[name].gain.value = value / 100;
	}
}

function updateMasterVolume(value) {
	knobValues.master = value;
	masterGain.gain.value = value / 100;
}


// --- Knob Instances ---
const knobValues = { low: 100, mid: 100, high: 100, master: 100 };
const knobInstances = {};

// UI Event Listeners
window.addEventListener('DOMContentLoaded', async () => {
	// Mix select functionaliteit
	const mixSelectItems = document.querySelectorAll('.mix-select-item');
	function setSamplesForMix(mix) {
		if (mix === 'mix_1') {
			samples.low = 'assets/mixer/mix_1/kick.mp3';
			samples.mid = 'assets/mixer/mix_1/Claps.mp3';
			samples.high = 'assets/mixer/mix_1/HH.mp3';
		} else if (mix === 'mix_2') {
			samples.low = 'assets/mixer/mix_2/kick - Copy.mp3';
			samples.mid = 'assets/mixer/mix_2/Claps - Copy.mp3';
			samples.high = 'assets/mixer/mix_2/HH - Copy.mp3';
		}
	}
	if (mixSelectItems) {
		mixSelectItems.forEach(btn => {
			btn.addEventListener('click', async (e) => {
				const mix = btn.getAttribute('data-mix');
				setSamplesForMix(mix);
				await loadAllSamples();
				// Sluit menu na kiezen
				if (mixSelectMenu) mixSelectMenu.classList.remove('open');
			});
		});
	}
	// Mix select submenu openen/sluiten
	const mixSelectBtn = document.getElementById('mix-select-btn');
	const mixSelectMenu = document.getElementById('mix-select-menu');
	const mixSelectClose = document.getElementById('mix-select-close');
	if (mixSelectBtn && mixSelectMenu) {
		mixSelectBtn.addEventListener('click', () => {
			mixSelectMenu.classList.toggle('open');
		});
	}
	if (mixSelectClose && mixSelectMenu) {
		mixSelectClose.addEventListener('click', () => {
			mixSelectMenu.classList.remove('open');
		});
	}
	// Mixer openen via de knop in de navbar
	const openBtn = document.getElementById('open-mixer-btn');
	if (openBtn) {
		openBtn.addEventListener('click', () => {
			const popup = document.getElementById('mixer-popup-overlay');
			if (popup) {
				if (popup.style.display === 'block') {
					popup.style.display = 'none';
				} else {
					popup.style.display = 'block';
				}
			}
		});
	}
	// Hamburger/hide button logic
	const hideBtn = document.getElementById('mixer-hide-btn');
	if (hideBtn) {
		hideBtn.addEventListener('click', () => {
			const popup = document.getElementById('mixer-popup-overlay');
			if (popup) popup.style.display = 'none';
		});
	}
	// --- Theme-aware icon logic ---
	const html = document.documentElement;
	// Icon paths
	const ICONS = {
		light: {
			playpause: 'assets/icons/PP_button.png',
			stop: 'assets/icons/S_button.png'
		},
		dark: {
			playpause: 'assets/icons/plps_btn.png',
			stop: 'assets/icons/stop_btn.png'
		}
	};
	function getTheme() {
		return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
	}
	function updateMixerIcons() {
		const theme = getTheme();
		// Channel play/pause buttons
		['high','mid','low'].forEach(name => {
			const btn = document.getElementById(name+'-toggle');
			if (btn) {
				const img = btn.querySelector('img');
				if (img) img.src = ICONS[theme].playpause;
			}
		});
		// Master play/pause
		const masterBtn = document.getElementById('master-toggle');
		if (masterBtn) {
			const img = masterBtn.querySelector('img');
			if (img) img.src = ICONS[theme].playpause;
		}
		// Master stop
		const stopBtn = document.getElementById('master-stop');
		if (stopBtn) {
			const img = stopBtn.querySelector('img');
			if (img) img.src = ICONS[theme].stop;
		}
	}
	// Listen for theme changes
	const themeToggle = document.getElementById('theme-toggle');
	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			setTimeout(updateMixerIcons, 10); // Wait for attribute to update
		});
	}
	// Initial icon set
	updateMixerIcons();
	// SVG Knobs koppelen
	knobInstances.high = createSVGKnob({
		knobId: 'high-volume-knob',
		gradateId: 'high-gradate',
		sliderId: 'high-slider',
		sliderShadowId: 'high-slider-shadow',
		initial: 100,
		onChange: v => updateVolume('high', v)
	});
	knobInstances.mid = createSVGKnob({
		knobId: 'mid-volume-knob',
		gradateId: 'mid-gradate',
		sliderId: 'mid-slider',
		sliderShadowId: 'mid-slider-shadow',
		initial: 100,
		onChange: v => updateVolume('mid', v)
	});
	knobInstances.low = createSVGKnob({
		knobId: 'low-volume-knob',
		gradateId: 'low-gradate',
		sliderId: 'low-slider',
		sliderShadowId: 'low-slider-shadow',
		initial: 100,
		onChange: v => updateVolume('low', v)
	});
	knobInstances.master = createSVGKnob({
		knobId: 'master-volume-knob',
		gradateId: 'master-gradate',
		sliderId: 'master-slider',
		sliderShadowId: 'master-slider-shadow',
		initial: 100,
		onChange: v => updateMasterVolume(v)
	});

	await loadAllSamples();


	// Play/Pause toggle per kanaal
	function setToggleState(name) {
		const btn = document.getElementById(name+'-toggle');
		const img = btn.querySelector('img');
		const theme = getTheme();
		if (sources[name]) {
			img.src = ICONS[theme].playpause;
			img.alt = 'Pause';
		} else {
			img.src = ICONS[theme].playpause;
			img.alt = 'Play';
		}
	}
	['low','mid','high'].forEach(name => {
		const btn = document.getElementById(name+'-toggle');
		btn.onclick = () => {
			if (sources[name]) {
				pauseChannel(name);
			} else {
				playChannel(name);
			}
			setToggleState(name);
		};
		setToggleState(name);
	});

	// Update knopstatus als alles gepauzeerd of gestart wordt
	function updateAllToggleStates() {
		['low','mid','high'].forEach(setToggleState);
		setMasterToggleState();
	}

	// Master play/pause knop
	function setMasterToggleState() {
		const btn = document.getElementById('master-toggle');
		if (!btn) return;
		const img = btn.querySelector('img');
		if (!img) return;
		const theme = getTheme();
		if (isPlaying) {
			img.src = ICONS[theme].playpause;
			img.alt = 'Pause';
		} else {
			img.src = ICONS[theme].playpause;
			img.alt = 'Play';
		}
	}
	const masterToggleBtn = document.getElementById('master-toggle');
	if (masterToggleBtn) {
		masterToggleBtn.onclick = () => {
			if (!isPlaying) {
				resumeAll();
			} else {
				pauseAll();
			}
			updateAllToggleStates();
		};
	}
	setMasterToggleState();

	// Master stop knop
	const masterStopBtn = document.getElementById('master-stop');
	if (masterStopBtn) {
		masterStopBtn.onclick = () => {
			stopAll();
			pauseTime = 0;
			updateAllToggleStates();
			updateMixerIcons();
		};
	}

	// Play/Pause all
	const allPlayBtn = document.getElementById('all-play');
	if (allPlayBtn) {
		allPlayBtn.onclick = () => {
			if (!isPlaying) {
				resumeAll();
			} else {
				// Start missing channels
				['low', 'mid', 'high'].forEach(name => {
					if (!sources[name]) playChannel(name);
				});
			}
			updateAllToggleStates();
		};
	}
	const allPauseBtn = document.getElementById('all-pause');
	if (allPauseBtn) {
		allPauseBtn.onclick = () => {
			pauseAll();
			updateAllToggleStates();
		};
	}
});
