
export default class StatsView {
  constructor() {
    this.stats = new Stats();
    this.init();
  }
  init() {
    const { stats} = this;
    stats.setMode(0); // 0: fps, 1: ms

    // 放在左上角
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);
  }
  update() {
    this.stats.update();
  }
}
