// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

let ctx;
let fireworkCount = 0;
let fireworks = [];
let lastFireworkTime = 0;
const fireworkInterval = window.innerWidth > 1280 ? 400 : 500;

const beautifulColors = [
	'#FF6B6B', // Red Coral
	'#FFD93D', // Sunny Yellow
	'#6BCB77', // Soft Green
	'#4D96FF', // Sky Blue
	'#A66DD4', // Lavender Purple
	'#F38BA0', // Rose Pink
	'#FF8E3C', // Orange
	'#3CFFDC', // Mint Blue
	'#FFC75F', // Mustard
	'#9D4EDD' // Deep Violet
];

const floatingImages = [];
const countToShowImage = 12;
const specialImages = ['image.jpg'];
const loadedImages = [];
specialImages.forEach(src => {
	const img = new Image();
	img.src = './images/' + src;
	loadedImages.push(img);
});

const random = (min, max) => Math.random() * (max - min) + min;

function createParticle(x, y, color) {
	const angle = random(0, Math.PI * 2);
	const speed = random(2, window.innerWidth > 1280 ? 6 : 7);

	return {
		x,
		y,
		radius: 2,
		color,
		velocity: {
			x: Math.cos(angle) * speed,
			y: Math.sin(angle) * speed
		},
		alpha: 1,
		friction: 0.98
	};
}

function updateParticle(p) {
	return {
		...p,
		x: p.x + p.velocity.x * p.friction,
		y: p.y + p.velocity.y * p.friction,
		velocity: {
			x: p.velocity.x * p.friction,
			y: p.velocity.y * p.friction
		},
		alpha: p.alpha - 0.01
	};
}

function drawParticle(p) {
	ctx.save();
	ctx.globalAlpha = p.alpha;
	ctx.beginPath();
	ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
	ctx.fillStyle = p.color;
	ctx.fill();
	ctx.restore();
}

function createFirework(x, targetY, color) {
	return {
		x,
		y: canvas.height,
		targetY,
		color,
		exploded: false,
		velocityY: random(-9, -5),
		particles: []
	};
}

function updateFirework(fw) {
	if (!fw.exploded) {
		const newY = fw.y + fw.velocityY;
		if (newY <= fw.targetY) {
			fireworkCount++;
			if (fireworkCount % countToShowImage === 0) {
				const imageIndex =
					(fireworkCount / countToShowImage - 1) %
					loadedImages.length;
				const selectedImage = loadedImages[imageIndex];

				floatingImages.push({
					x: fw.x,
					y: fw.targetY,
					startTime: performance.now(),
					duration: 3000, //3s
					width:
						window.innerWidth < 1280 ? window.innerWidth / 3 : 300,
					height:
						window.innerWidth < 1280 ? window.innerWidth / 3 : 300,
					image: selectedImage
				});
			}

			return {
				...fw,
				y: fw.targetY,
				exploded: true,
				particles: Array.from({ length: 200 }, () =>
					createParticle(fw.x, fw.targetY, fw.color)
				)
			};
		}
		return { ...fw, y: newY };
	}

	const updatedParticles = fw.particles
		.map(updateParticle)
		.filter(p => p.alpha > 0);

	return { ...fw, particles: updatedParticles };
}

function drawFirework(fw) {
	if (!fw.exploded) {
		ctx.beginPath();
		ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
		ctx.fillStyle = fw.color;
		ctx.fill();
	} else {
		fw.particles.forEach(drawParticle);
	}
}

function animate(timestamp) {
	requestAnimationFrame(animate);

	ctx.fillStyle = 'rgba(0,0,0,0.2)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Thời gian thực tế đã trôi qua (timestamp là do requestAnimationFrame cung cấp)
	if (timestamp - lastFireworkTime > fireworkInterval) {
		const x = random(100, canvas.width - 100);
		const targetY = random(100, canvas.height / 2);
		const color =
			beautifulColors[Math.floor(Math.random() * beautifulColors.length)];

		fireworks.push(createFirework(x, targetY, color));
		lastFireworkTime = timestamp;
	}

	fireworks = fireworks
		.map(updateFirework)
		.filter(fw => !(fw.exploded && fw.particles.length === 0));

	fireworks.forEach(drawFirework);

	floatingImages.forEach((img, index) => {
		const elapsed = timestamp - img.startTime;
		if (elapsed > img.duration) {
			floatingImages.splice(index, 1); // xóa nếu quá thời gian
			return;
		}

		const alpha = 1 - elapsed / img.duration;

		// Tính tỷ lệ gốc của ảnh
		const originalWidth = img.image.width;
		const originalHeight = img.image.height;
		const aspectRatio = originalWidth / originalHeight;

		let drawWidth = img.width;
		let drawHeight = img.height;

		// Giữ đúng tỷ lệ gốc của ảnh
		if (originalWidth > originalHeight) {
			drawHeight = drawWidth / aspectRatio;
		} else {
			drawWidth = drawHeight * aspectRatio;
		}

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.drawImage(
			img.image,
			img.x - drawWidth / 2,
			img.y - drawHeight / 2,
			drawWidth,
			drawHeight
		);
		ctx.restore();
	});
}

function showPage(pageId) {
	document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
	document.getElementById(pageId).classList.remove('hidden');

	if (pageId === 'birthday') {
		const canvas = document.createElement('canvas');
		canvas.id = 'canvas';
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.body.appendChild(canvas);
		ctx = canvas.getContext('2d');

		const audio = document.querySelector('audio');
		audio.play();

		animate();
	}
}
