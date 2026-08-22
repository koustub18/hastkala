const fs = require('fs');

const path = 'src/data/products.js';
let content = fs.readFileSync(path, 'utf8');

// Replace product images
const replacements = {
  "Aranmula Metal Mirror (Kannadi)": "aranmula_mirror.png",
  "Gond Painting on Canvas": "gond_painting.png",
  "Bagh Print Textile": "bagh_print.png",
  "Warli Painting": "warli_painting.png",
  "Wooden Lacquer Toys": "lacquer_toys.png",
  "Manipuri Handloom Weaving": "manipuri_handloom.png",
  "Madhubani Wall Painting": "madhubani_folk_art.jpg",
  "Bastar Dhokra Metal Craft": "dhokra_figurines.jpg",
  "Bamboo Basketry": "bamboo_baskets_colorful.jpg",
  "Odisha Ikat Saree - Traditional Blue Geometry": "odisha_saree_2.jpg",
  "Sambalpuri Ikkat Handloom Saree - Elephant Motif": "odisha_saree_1.jpg"
};

for (const [title, image] of Object.entries(replacements)) {
  const regex = new RegExp(`title:\\s*"${title.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")}",[\\s\\S]*?image:\\s*"[^"]*",\\s*image2:\\s*"[^"]*"`, 'g');
  
  content = content.replace(regex, (match) => {
    return match
      .replace(/image:\s*"[^"]*"/, `image: "/images/products/${image}"`)
      .replace(/image2:\s*"[^"]*"/, `image2: "/images/products/${image}"`);
  });
}

// Replace all artisanImages with local placeholder
content = content.replace(/artisanImage:\s*"https:\/\/images\.unsplash\.com[^"]*"/g, `artisanImage: "/images/artisan_placeholder.svg"`);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed products.js');
