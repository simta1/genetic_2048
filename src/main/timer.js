class Timer {
    constructor(duration=0) {
        this.duration = duration;
        this.isOn = false;
    }

    start() {
        this.elapsedTime = 0;
        this.isOn = true;
    }

    work() { // true only when the timer ends
        if (!this.isOn) return false;
    
        if (++this.elapsedTime >= this.duration) {
            this.isOn = false;
            return true;
        }
        return false;
    }

    isWorking() {
        return this.isOn;
    }

    elapsedRate() {
        return this.elapsedTime / this.duration;
    }

    setDuration(duration) {
        this.duration = duration;
    }
}