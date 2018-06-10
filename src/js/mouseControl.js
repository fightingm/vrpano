/**
 * @description 用来处理鼠标事件
 * @export
 * @class MouseControl
 */
export default class MouseControl {
  constructor(viewer) {
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.viewer = viewer;
    this.fov = 90;
    this.initPos = {x: 0, y: 0};
    this.flag = false;
    this.moving = false;
    this.bindEvents();
  }
  bindEvents() {
    const container = this.viewer.getContainer();
    window.addEventListener( 'resize', this.handleWindowResize, false );
    container.addEventListener('mousedown', this.handleMouseDown);
    container.addEventListener('touchstart', this.handleMouseDown);
    container.addEventListener('mousewheel', this.handleMouseWheel);
  }
  handleWindowResize() {
    const {width, height} = this.viewer.getSize();
    this.viewer.handleWindowResize(width, height);
  }
  // 滚轮控制场景缩放
  handleMouseWheel(e) {
    // e.wheelDelta
    if(e.wheelDelta > 0) { //向下滚，放大
      this.fov = Math.max(65, this.fov - 5);
    } else { // 向上滚，缩小
      this.fov = Math.min(150, this.fov + 5);
    }
    this.viewer.setScale();
  }

  // 拖拽控制场景旋转
  handleMouseDown(e) {
    if(this.viewer.isDeviceing) return;
    const _this = this;
    const touch = e.touches ? e.touches[0] : e;
    this.initPos = {
      x: touch.clientX,
      y: touch.clientY
    };
    this.touchNum = e.touches ? e.touches.length : 1;
    this.startManulRotation = this.viewer.getManulRotation();
    this.speedX = 0;
    this.speedY = 0;
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
    if(this.inertial) {
      cancelAnimationFrame(this.inertial);
    }
    if(this.touchNum === 2) {
      this.startDistance = this.getDistance(e.touches[0], e.touches[1]);
    }
    // 添加flag一个标识，防止其他地方的mouseup事件在这里触发
    // moving 用来判断当前场景是否正在被拖动
    // let flag = true, moving = false;
    this.flag = true;
    this.moving = false;
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('touchmove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchend', this.handleMouseUp);
  }

  getDistance(poi1, poi2) {
    return Math.sqrt(Math.pow(poi1.clientX - poi2.clientX, 2) + Math.pow(poi1.clientY - poi2.clientY, 2));
  };

  // 鼠标移动的时候计算出横向和纵向的移动角度，然后传给viewer处理
  handleMouseMove(e) {
    // 移动端缩放
    if(this.touchNum === 2) {
      // touchstart的时候两个手指，touchmove的时候变成一个手指，就会报错
      if(e.touches.length !== 2) return;
      this.moving = false;
      const endDistance = this.getDistance(e.touches[0], e.touches[1]);
      const deltaDistance = endDistance - this.startDistance;
      this.handleMouseWheel({wheelDelta: deltaDistance});
      this.startDistance = endDistance;
    }else {
      this.moving = true;
      const touch = e.touches ? e.touches[0] : e;
      const x = touch.clientX,
            y = touch.clientY;
      //这里相当于鼠标移动10px,场景选择1deg,显示更加平滑
      const curX = ((this.initPos.x - x)/5 + this.startManulRotation[0]) %360,
            curY = ((y - this.initPos.y)/5 + this.startManulRotation[1]) %360;
      this.speedX = x - this.lastX;
      this.speedY = y - this.lastY;
      this.lastX = x;
      this.lastY = y;
      this.viewer.handleMouseMove(curX, curY);
    }
  }
  // 鼠标抬起之后移除事件
  handleMouseUp(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    if(this.flag) {
      if(e.changedTouches && this.touchNum === 1) {
        const x = touch.clientX,
              y = touch.clientY;
        const _this = this;
        this.startManulRotation = this.viewer.getManulRotation();
        let { speedX, speedY } = this;
        speedX = Math.max(Math.min(speedX, 90), -90);
        speedY = Math.max(Math.min(speedY, 90), -90);
        let t = 0, b = 0, d = 30;
        if(Math.abs(speedX) >= 3 || Math.abs(speedY) >= 3) {
          step();
        }
        function step() {
          var xvalue = easeOut(t, b, speedX, d);
          var yvalue = easeOut(t,b, speedY, d);
          const curX = (_this.startManulRotation[0] - xvalue) %360,
                curY = (_this.startManulRotation[1] + yvalue) %360;
          _this.viewer.handleMouseMove(curX, curY);
          t++;
          if(t <= d) {
            _this.inertial = requestAnimationFrame(step);
          }else {
            cancelAnimationFrame(_this.inertial);
          }
        }
        function easeOut(t, b, c, d) {
            return c * ((t = t/d - 1) * t * t * t * t + 1) + b;
        }
      }
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('touchmove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      document.removeEventListener('touchend', this.handleMouseUp);
      this.flag = false;
      this.moving = false;
      this.viewer.handleMouseUp();
    }
  }
}
