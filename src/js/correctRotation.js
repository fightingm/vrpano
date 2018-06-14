
// import { Euler, THREEMath } from 'three';
import { Euler } from 'three/src/math/Euler';
import { _Math } from 'three/src/math/Math';

import Rotation from './rotation';

export default class CorrectRotation extends Rotation {
  constructor(alpha, beta, gamma) {
    super(alpha, beta, gamma);
  }
  getQuat() {
    const z = this.beta;
    const x = -this.gamma;
    const y = -this.alpha+270;
    this.setQuaternion(this.quat, z, x, y);
    return this.quat;
  }
  setQuaternion(quaternion, z, x, y) {

    let euler = new Euler();

    // 这里的两个order是通过不断尝试推测出来的
    let order = 'ZXY';
    if(z!== 0 && x !== 0) {
      order = 'XZY'
    }
    euler.set( _Math.degToRad(x), _Math.degToRad(y), _Math.degToRad(z), order ); // 'ZXY' for the device, but 'YXZ' for us

    quaternion.setFromEuler( euler ); // orient the device

  }
}
