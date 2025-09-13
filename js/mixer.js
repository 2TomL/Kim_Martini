// Live Mixer Functionality
class LiveMixer {
    constructor() {
        this.channels = {
            1: { audio: null, volume: 0, isPlaying: false },
            2: { audio: null, volume: 0, isPlaying: false },
            3: { audio: null, volume: 0, isPlaying: false }
        };
        this.masterVolume = 0.5;
        this.isCollapsed = true; // Start collapsed
        
        // Sample audio URLs (placeholder - replace with actual samples)
        this.sampleUrls = {
            1: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
            2: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
            3: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'
        };
        
        this.init();
    }
    
    init() {
        this.setupAudioChannels();
        this.setupEventListeners();
        this.updateUI();
    }
    
    setupAudioChannels() {
        // Create audio context first
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio objects for each channel
        for (let i = 1; i <= 3; i++) {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = 0;
            audio.preload = 'auto';
            
            // Initialize channel data
            this.channels[i].source = null;
            this.channels[i].gainNode = null;
        }
    }
    
    async createSineWave(channel) {
        // Ensure audio context is ready
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        const frequencies = { 1: 220, 2: 330, 3: 440 }; // Different frequencies for each channel
        const frequency = frequencies[channel];
        const duration = 2; // 2 second loop
        const sampleRate = this.audioContext.sampleRate;
        const frameCount = sampleRate * duration;
        
        const audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        }
        
        return audioBuffer;
    }
    
    setupEventListeners() {
        // Mixer toggle
        const mixerToggle = document.getElementById('mixer-toggle');
        if (mixerToggle) {
            mixerToggle.addEventListener('click', () => this.toggleMixer());
        }
        
        // Ook klikken op de hele mixer-header opent/sluit de mixer
        const mixerHeader = document.querySelector('.mixer-header');
        if (mixerHeader) {
            mixerHeader.addEventListener('click', (e) => {
                // voorkom dubbele toggle als op het pijltje wordt geklikt
                if (!e.target.classList.contains('mixer-toggle')) {
                    this.toggleMixer();
                }
            });
        }
        
        // Channel play buttons
        for (let i = 1; i <= 3; i++) {
            const playBtn = document.querySelector(`[data-channel="${i}"].play-btn`);
            if (playBtn) {
                playBtn.addEventListener('click', () => this.toggleChannel(i));
            }
            
            const dial = document.querySelector(`[data-channel="${i}"].volume-dial`);
            if (dial) {
                this.setupDialControls(dial, i);
            }
        }
        
        // Master controls
        const masterPlay = document.getElementById('master-play');
        if (masterPlay) {
            masterPlay.addEventListener('click', () => this.toggleAllChannels());
        }
        
        const masterDial = document.querySelector('.master-dial');
        if (masterDial) {
            this.setupMasterDialControls(masterDial);
        }
    }
    
    setupDialControls(dial, channel) {
        let isDragging = false;
        let startAngle = 0;
        let currentAngle = -135; // Start at minimum
        
        const thumb = dial.querySelector('.dial-thumb');
        const valueDisplay = dial.parentElement.querySelector('.volume-value');
        const dots = dial.querySelectorAll('.dot');
        
        const getAngleFromMouse = (e, rect) => {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;
            if (angle < 0) angle += 360;
            if (angle > 180) angle -= 360;
            return Math.max(-135, Math.min(135, angle));
        };
        
        const updateDial = (angle) => {
            currentAngle = angle;
            const volume = (angle + 135) / 270; // Convert -135 to 135 range to 0-1
            this.channels[channel].volume = volume;
            
            // Update visual elements
            thumb.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            valueDisplay.textContent = Math.round(volume * 100);
            
            // Update dots - reduce to 7 dots for compact design
            const activeDots = Math.floor(volume * 7);
            dots.forEach((dot, index) => {
                dot.classList.toggle('filled', index < activeDots);
            });
            
            // Update audio volume
            if (this.channels[channel].gainNode) {
                this.channels[channel].gainNode.gain.value = volume * this.masterVolume;
            }
        };
        
        dial.addEventListener('mousedown', (e) => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            isDragging = true;
            const rect = dial.getBoundingClientRect();
            const angle = getAngleFromMouse(e, rect);
            updateDial(angle);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = dial.getBoundingClientRect();
                const angle = getAngleFromMouse(e, rect);
                updateDial(angle);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Touch events for mobile
        dial.addEventListener('touchstart', (e) => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            isDragging = true;
            const rect = dial.getBoundingClientRect();
            const touch = e.touches[0];
            const angle = getAngleFromMouse(touch, rect);
            updateDial(angle);
            e.preventDefault();
        }, { passive: false }); // We need preventDefault, so can't be passive
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                const rect = dial.getBoundingClientRect();
                const touch = e.touches[0];
                const angle = getAngleFromMouse(touch, rect);
                updateDial(angle);
                e.preventDefault();
            }
        }, { passive: false }); // We need preventDefault, so can't be passive
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });
    }
    
    setupMasterDialControls(dial) {
        let isDragging = false;
        let currentAngle = 0; // Start at middle (50%)
        
        const thumb = dial.querySelector('.dial-thumb');
        const valueDisplay = dial.parentElement.querySelector('.volume-value');
        const dots = dial.querySelectorAll('.dot');
        
        const getAngleFromMouse = (e, rect) => {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;
            if (angle < 0) angle += 360;
            if (angle > 180) angle -= 360;
            return Math.max(-135, Math.min(135, angle));
        };
        
        const updateMasterDial = (angle) => {
            currentAngle = angle;
            const volume = (angle + 135) / 270; // Convert -135 to 135 range to 0-1
            this.masterVolume = volume;
            
            // Update visual elements
            thumb.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            valueDisplay.textContent = Math.round(volume * 100);
            
            // Update dots - reduce to 7 dots for compact design
            const activeDots = Math.floor(volume * 7);
            dots.forEach((dot, index) => {
                dot.classList.toggle('filled', index < activeDots);
            });
            
            // Update all channel volumes
            for (let i = 1; i <= 3; i++) {
                if (this.channels[i].gainNode) {
                    this.channels[i].gainNode.gain.value = this.channels[i].volume * this.masterVolume;
                }
            }
        };
        
        dial.addEventListener('mousedown', (e) => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            isDragging = true;
            const rect = dial.getBoundingClientRect();
            const angle = getAngleFromMouse(e, rect);
            updateMasterDial(angle);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = dial.getBoundingClientRect();
                const angle = getAngleFromMouse(e, rect);
                updateMasterDial(angle);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Touch events
        dial.addEventListener('touchstart', (e) => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            isDragging = true;
            const rect = dial.getBoundingClientRect();
            const touch = e.touches[0];
            const angle = getAngleFromMouse(touch, rect);
            updateMasterDial(angle);
            e.preventDefault();
        }, { passive: false }); // We need preventDefault, so can't be passive
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                const rect = dial.getBoundingClientRect();
                const touch = e.touches[0];
                const angle = getAngleFromMouse(touch, rect);
                updateMasterDial(angle);
                e.preventDefault();
            }
        }, { passive: false }); // We need preventDefault, so can't be passive
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });
        
        // Initialize master at 50%
        updateMasterDial(0);
    }
    
    async toggleChannel(channel) {
        const playBtn = document.querySelector(`[data-channel="${channel}"].play-btn`);
        
        // Ensure audio context is ready
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        if (!this.channels[channel].source || !this.channels[channel].isPlaying) {
            // Create new source
            try {
                const audioBuffer = await this.createSineWave(channel);
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.loop = true;
                
                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = this.channels[channel].volume * this.masterVolume;
                
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                this.channels[channel].source = source;
                this.channels[channel].gainNode = gainNode;
                
                source.start();
                this.channels[channel].isPlaying = true;
                playBtn.classList.add('playing');
                playBtn.textContent = '⏸';
                
                // Check if any channel is playing, then add .is-playing to body
                if (Object.values(this.channels).some(ch => ch.isPlaying)) {
                    document.body.classList.add('is-playing');
                }
            } catch (error) {
                console.error('Error creating audio for channel', channel, error);
            }
        } else {
            // Stop current source
            try {
                this.channels[channel].source.stop();
            } catch (error) {
                console.log('Audio source already stopped');
            }
            this.channels[channel].isPlaying = false;
            playBtn.classList.remove('playing');
            playBtn.textContent = '▶';
            
            // Check if no channel is playing, then remove .is-playing from body
            if (!Object.values(this.channels).some(ch => ch.isPlaying)) {
                document.body.classList.remove('is-playing');
            }
            
            // Clear source for next play
            this.channels[channel].source = null;
            this.channels[channel].gainNode = null;
        }
    }
    
    async toggleAllChannels() {
        const masterPlay = document.getElementById('master-play');
        const anyPlaying = Object.values(this.channels).some(ch => ch.isPlaying);
        
        if (anyPlaying) {
            // Stop all
            for (let i = 1; i <= 3; i++) {
                if (this.channels[i].isPlaying) {
                    await this.toggleChannel(i);
                }
            }
            masterPlay.classList.remove('playing');
            masterPlay.textContent = '▶';
            document.body.classList.remove('is-playing');
        } else {
            // Start all
            for (let i = 1; i <= 3; i++) {
                if (!this.channels[i].isPlaying) {
                    await this.toggleChannel(i);
                }
            }
            masterPlay.classList.add('playing');
            masterPlay.textContent = '⏸';
            document.body.classList.add('is-playing');
        }
    }
    
    toggleMixer() {
        const mixerContent = document.getElementById('mixer-content');
        const mixerToggle = document.getElementById('mixer-toggle');
        
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            mixerContent.classList.add('collapsed');
            mixerToggle.classList.add('collapsed');
        } else {
            mixerContent.classList.remove('collapsed');
            mixerToggle.classList.remove('collapsed');
        }
    }
    
    updateUI() {
        // Initialize UI state
        for (let i = 1; i <= 3; i++) {
            const valueDisplay = document.querySelector(`[data-channel="${i}"].volume-dial`).parentElement.querySelector('.volume-value');
            valueDisplay.textContent = '0';
        }
    }
}

// Initialize mixer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.liveMixer = new LiveMixer();
});
