function initializeDemo() {
	const $slideshow = $(".cycle-slideshow");
	const $next = $(".cycle-next");
	const $prev = $(".cycle-prev");
	const $carousel = $(".demo-carousel");

	if (!$slideshow.length) {
		return;
	}

	$slideshow.cycle({
		slides: "> img",
		autoHeight: "calc",
	});
}

$(document).ready(initializeDemo);
