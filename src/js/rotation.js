
import { Quaternion } from 'three/src/math/Quaternion';

export default class Rotation {
  constructor(alpha, beta, gamma) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.quat = new Quaternion();
  }
  reset(rotation) {
    this.alpha = rotation[0];
    this.beta = rotation[1];
    this.gamma = rotation[2];
  }
  setAlphaRotation(val) {
    this.alpha = val;
  }
  setBetaRotation(val) {
    this.beta = val;
  }
  setGammaRotation(val) {
    this.gamma = val;
  }
  getRotation() {
    return [this.alpha, this.beta, this.gamma].map(Number);
  }
}
