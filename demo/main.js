function initializeDemo() {
	const $slideshow = $(".cycle-slideshow");
	const $pause = $(".cycle-pause");

	if (!$slideshow.length) {
		return;
	}

	$slideshow.cycle({
		slides: "> img",
		autoHeight: "calc",
	});

	$slideshow.on("cycle-paused", () => {
		$pause.text("Resume slideshow");
	});

	$slideshow.on("cycle-resumed", () => {
		$pause.text("Pause slideshow");
	});
}

$(document).ready(initializeDemo);
