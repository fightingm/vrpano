import { Euler } from 'three/src/math/Euler';
import { _Math } from 'three/src/math/Math';

import Rotation from './rotation';

export default class ManulRotation extends Rotation {
  constructor(alpha, beta, gamma) {
    super(alpha, beta, gamma);
  }
  getQuat() {
    const z = this.gamma;
    const x = this.beta;
    const y = -this.alpha;
    this.setQuaternion(this.quat, z, x, y);
    return this.quat;
  }
  setQuaternion(quaternion, z, x, y) {

    let euler = new Euler();

    let order = 'ZYX';
    euler.set( _Math.degToRad(x), _Math.degToRad(y), _Math.degToRad(z), order ); // 'ZXY' for the device, but 'YXZ' for us

    quaternion.setFromEuler( euler ); // orient the device

  }
}
