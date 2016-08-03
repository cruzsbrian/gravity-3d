var ctx;

var particles = new Array();
var centerX;
var centerY;

function newParticle(m, v, p) {
	var p = new Particle(m, v, p);
	particles[particles.length] = p;
}

function cloud() {
	for (var i = 0; i < 1000; i++) {
		var angle1 = Math.random() * 2 * Math.PI;
		var angle2 = Math.random() * 2 * Math.PI;
		var dist = Math.pow(Math.random() * 20, 2);
		
		var x = dist * Math.cos(angle1) * Math.cos(angle2);
		var y = dist * Math.sin(angle1);
		var z = dist * Math.cos(angle1) * Math.sin(angle2);

		newParticle(2, new Vector3D(0, 0, 0), new Vector3D(x, y, z));
	}
}

$(document).ready(function() {
	centerX = $(window).width() / 2;
	centerY = $(window).height() / 2;
	ctx = $("#canvas")[0].getContext("2d");
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	$("body").keyup(function(e) {
		if (e.which == 32) {
			cloud();
		}
	});

	var t = setInterval(function() {
		gravityCalc(particles);

		particles.sort(function(a, b) {
			return a.z > b.z ? 1 : -1;
		});

		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

		for (var i = 0; i < particles.length; i++) {
			particles[i].paint();
		}
	}, 15);
});
