
export default class TapHandler {
	constructor(eventTarget) {
		this.eventTarget = eventTarget;
		let ua = navigator.userAgent.toLowerCase();
		this.onTouch = ua.indexOf("android") > -1 || ua.indexOf("iphone") > -1;

		if(this.onTouch) {
			this.handlers = [];
			this.eventTarget.addEventListener("touchstart", this.handleTouchStart.bind(this));
			this.eventTarget.addEventListener("touchend", this.handleTouchEnd.bind(this));
		}
	}
	handleTouchStart(e) {
		e.preventDefault();

		if(!e.touches || e.touches.length == 0) {
			return;
		}

		this.startX = e.changedTouches[0].clientX;
		this.startY = e.changedTouches[0].clientY;
	}
	handleTouchEnd(e) {
		let currentX = e.changedTouches[0].clientX;
		let currentY = e.changedTouches[0].clientY;

		let distance = Math.sqrt(Math.pow(currentX-this.startX, 2) + Math.pow(currentY-this.startY, 2));
		if(distance > 30) {
			return true;
		}

		for(let i=0; i<this.handlers.length; i++) {
			this.handlers[i].call(this.eventTarget, e);
		}

		e.preventDefault();
		return false;
	}
	listen(callback, opt_capture) {
		if(this.onTouch) {
			this.handlers.push(callback);
		} else {
			this.eventTarget.addEventListener("click", callback, opt_capture);
		}
	}
	unlisten(callback) {
		if(this.onTouch) {
			let index = this.handlers.indexOf(callback);
			if(index > -1) {
				this.handlers.splice(index, 1);
			}
		} else {
			this.eventTarget.removeEventListener("click", callback);
		}
	}
}
