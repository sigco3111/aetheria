'use client'

/**
 * Procedural ambience synthesized with the Web Audio API:
 * soft wind (filtered noise), rolling ocean waves (slow LFO swells),
 * distant bird chirps and a faint orchestral pad. No audio files needed.
 */
export class AmbientAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private birdTimer: ReturnType<typeof setTimeout> | null = null

  get running() {
    return this.ctx !== null
  }

  start() {
    if (this.ctx) return
    const ctx = new AudioContext()
    this.ctx = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 4)
    this.master = master

    const noiseBuffer = this.makeNoise(ctx)

    // --- Wind: bandpassed noise with a slow wandering filter ---
    const wind = ctx.createBufferSource()
    wind.buffer = noiseBuffer
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 420
    windFilter.Q.value = 0.6
    const windGain = ctx.createGain()
    windGain.gain.value = 0.05
    const windLfo = ctx.createOscillator()
    windLfo.frequency.value = 0.07
    const windLfoGain = ctx.createGain()
    windLfoGain.gain.value = 180
    windLfo.connect(windLfoGain).connect(windFilter.frequency)
    wind.connect(windFilter).connect(windGain).connect(master)
    wind.start()
    windLfo.start()

    // --- Ocean waves: lowpassed noise with slow amplitude swells ---
    const waves = ctx.createBufferSource()
    waves.buffer = noiseBuffer
    waves.loop = true
    waves.playbackRate.value = 0.4
    const waveFilter = ctx.createBiquadFilter()
    waveFilter.type = 'lowpass'
    waveFilter.frequency.value = 320
    const waveGain = ctx.createGain()
    waveGain.gain.value = 0.06
    const waveLfo = ctx.createOscillator()
    waveLfo.frequency.value = 0.09
    const waveLfoGain = ctx.createGain()
    waveLfoGain.gain.value = 0.045
    waveLfo.connect(waveLfoGain).connect(waveGain.gain)
    waves.connect(waveFilter).connect(waveGain).connect(master)
    waves.start()
    waveLfo.start()

    // --- Faint orchestral pad: detuned triads, very quiet ---
    const chord = [130.81, 196.0, 261.63, 329.63] // C3 G3 C4 E4
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      osc.detune.value = i % 2 === 0 ? -4 : 5
      const g = ctx.createGain()
      g.gain.value = 0
      g.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 8 + i * 2)
      const padLfo = ctx.createOscillator()
      padLfo.frequency.value = 0.05 + i * 0.013
      const padLfoGain = ctx.createGain()
      padLfoGain.gain.value = 0.006
      padLfo.connect(padLfoGain).connect(g.gain)
      osc.connect(g).connect(master)
      osc.start()
      padLfo.start()
    })

    // --- Distant birds: occasional soft chirps ---
    const chirp = () => {
      if (!this.ctx || !this.master) return
      const c = this.ctx
      const osc = c.createOscillator()
      osc.type = 'sine'
      const g = c.createGain()
      const now = c.currentTime
      const base = 1800 + Math.random() * 1400
      osc.frequency.setValueAtTime(base, now)
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.09)
      osc.frequency.exponentialRampToValueAtTime(base * 0.9, now + 0.2)
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(0.015, now + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
      osc.connect(g).connect(this.master)
      osc.start(now)
      osc.stop(now + 0.35)
      this.birdTimer = setTimeout(chirp, 2500 + Math.random() * 6000)
    }
    this.birdTimer = setTimeout(chirp, 4000)
  }

  stop() {
    if (this.birdTimer) clearTimeout(this.birdTimer)
    this.birdTimer = null
    if (this.ctx && this.master) {
      const ctx = this.ctx
      this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
      setTimeout(() => ctx.close(), 1000)
    }
    this.ctx = null
    this.master = null
  }

  private makeNoise(ctx: AudioContext) {
    const length = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < length; i++) {
      // Pink-ish noise via simple low-pass of white noise
      const white = Math.random() * 2 - 1
      last = last * 0.96 + white * 0.04
      data[i] = last * 4
    }
    return buffer
  }
}
