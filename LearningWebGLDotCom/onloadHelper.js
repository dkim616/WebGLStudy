function addLoadEvent(func) {
	var prevOnload = window.onload;
	if (typeof window.onload != "function") {
		window.onload = func;
	} else {
		window.onload = function() {
			if (prevOnload) {
				prevOnload();
			}
			func();
		}
	}
}