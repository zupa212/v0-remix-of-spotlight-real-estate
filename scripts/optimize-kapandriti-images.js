const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
    'public/kapandriti/after',
    'public/kapandriti/before'
];

async function optimizeImages() {
    for (const dir of DIRECTORIES) {
        const fullDir = path.join(process.cwd(), dir);
        if (!fs.existsSync(fullDir)) {
            console.log(`Directory not found: ${fullDir}`);
            continue;
        }

        const files = fs.readdirSync(fullDir);

        for (const file of files) {
            if (file.match(/\.(png|jpg|jpeg)$/i)) {
                const filePath = path.join(fullDir, file);
                const fileName = path.parse(file).name;
                // Output as jpg for better compression of photos
                const outPath = path.join(fullDir, `${fileName}.optimized.jpg`);

                console.log(`Optimizing ${file}...`);

                try {
                    const image = sharp(filePath);
                    const metadata = await image.metadata();

                    // Resize if too huge (e.g. > 1920 width)
                    // Since these are vertical (mostly), check width.
                    // Before/After usually 9:16. Let's limit width to 1080px (plenty for high density mobile or half-desktop)
                    if (metadata.width > 1200) {
                        image.resize({ width: 1200 });
                    }

                    await image
                        .jpeg({ quality: 80, mozjpeg: true })
                        .toFile(outPath);

                    // Get stats
                    const oldStats = fs.statSync(filePath);
                    const newStats = fs.statSync(outPath);

                    console.log(`Saved ${outPath}`);
                    console.log(`Size: ${(oldStats.size / 1024 / 1024).toFixed(2)}MB -> ${(newStats.size / 1024 / 1024).toFixed(2)}MB`);

                    // Replace original with optimized version (rename optimized to original name, but enforce .jpg extension)
                    // We will delete the original file and rename the new one to [name].jpg
                    // If the original was .png, it is now .jpg. We must account for this in the code.

                    fs.unlinkSync(filePath);
                    fs.renameSync(outPath, path.join(fullDir, `${fileName}.jpg`));

                    if (path.extname(file).toLowerCase() !== '.jpg') {
                        console.log(`Converted ${file} to ${fileName}.jpg`);
                    }

                } catch (err) {
                    console.error(`Error processing ${file}:`, err);
                }
            }
        }
    }
}

optimizeImages();
