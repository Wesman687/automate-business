const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createFavicon(size, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#0088CC');
    gradient.addColorStop(1, '#00CC44');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add rounded corners
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const radius = size * 0.1;
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Draw letter S
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = size * 0.05;
    ctx.shadowOffsetX = size * 0.02;
    ctx.shadowOffsetY = size * 0.02;
    ctx.fillText('S', size / 2, size / 2);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(__dirname, 'public', filename);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Created ${filename}`);
}

// Polyfill for roundRect
if (!createCanvas(1, 1).getContext('2d').roundRect) {
    const CanvasRenderingContext2D = createCanvas(1, 1).getContext('2d').constructor;
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Generate required favicon sizes
createFavicon(16, 'favicon-16x16.png');
createFavicon(32, 'favicon-32x32.png');
createFavicon(180, 'apple-touch-icon.png');

console.log('🎉 All favicons created successfully!');
console.log('📂 Files saved to: frontend/public/');
console.log('🔄 Deploy your site to fix the missing icon errors');
