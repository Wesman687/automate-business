const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createSocialBanner(filename) {
    // Create canvas with correct dimensions for social media (1200x630)
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#0088CC');
    gradient.addColorStop(1, '#00CC44');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add geometric shapes for visual interest
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    // Circle 1 (top left)
    ctx.beginPath();
    ctx.arc(-50, 50, 150, 0, 2 * Math.PI);
    ctx.fill();
    
    // Circle 2 (bottom right)
    ctx.beginPath();
    ctx.arc(1150, 580, 100, 0, 2 * Math.PI);
    ctx.fill();
    
    // Circle 3 (top right)
    ctx.beginPath();
    ctx.arc(1050, 150, 75, 0, 2 * Math.PI);
    ctx.fill();

    // Text styling
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Main logo/title
    ctx.font = 'bold 72px Arial';
    ctx.fillText('Streamline AI', 600, 250);

    // Tagline
    ctx.font = '36px Arial';
    ctx.fillText('Business Automation Experts', 600, 320);

    // Description
    ctx.font = '24px Arial';
    ctx.fillText('AI-powered tools, websites & mobile apps', 600, 370);
    ctx.fillText('to streamline your business', 600, 410);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(__dirname, 'public', filename);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Created ${filename}`);
}

// Generate both banner images
createSocialBanner('og-banner-desktop.png');
createSocialBanner('og-banner-mobile.png');

console.log('🎉 Social media banners created successfully!');
console.log('📂 Files saved to: frontend/public/');
console.log('🔄 Deploy your site to see the new banners on social media');
