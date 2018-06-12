import VrAligner from './vrAligner';
import VrTraveller from './vrTraveller';

const VrPano = {
    VrAligner,
    VrTraveller
}
export default VrPano;

// 解决浏览器中引用的时候VrPano.default的问题
module.exports = VrPano;