import emitter from "./CustomEmitter";

/**
 * Demo class that "detects" brute force attacks based on IP and emits events. Uses the custom Event Emitter (CustomEmitter.js)
 * TimeValue: Amount of milliseconds allowed between requests.
 */
class BruteForceDetector {
  urls: Map<string, number>;
  TIME_BETWEEN_CALLS: number;
  constructor(timeValue: number) {
    this.urls = new Map();
    this.TIME_BETWEEN_CALLS = timeValue;
  }
  addUrl = (url: string) => {
    const time = new Date().getTime();
    if (this.urls.has(url)) {
      const previousTime: number | any = this.urls.get(url);
      const deltaTime = time - previousTime;
      if (deltaTime < this.TIME_BETWEEN_CALLS) {
        emitter.emit("Brute Force Attack Detected", {url : url, timeBetweenCalls : deltaTime})
      }
    }
    this.urls.set(url, time);
  };
}

export default BruteForceDetector;