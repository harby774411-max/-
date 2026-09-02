const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const optimizedUrl = await optimizeImageFile\(file, { maxWidth: 900, maxHeight: 900, quality: 0.85 }\);/,
  `const optimizedData = await optimizeImageFile(file, { maxWidth: 900, maxHeight: 900, quality: 0.85 });
      const optimizedUrl = await uploadOptimizedImage(optimizedData, 'products');`
);

code = code.replace(
  /const optimized = await optimizeImageFile\(file, \{\s*maxWidth: 500,\s*maxHeight: 500,\s*quality: 0\.9,\s*mimeType: file\.type === 'image\/png' \? 'image\/png' : 'image\/jpeg'\s*\}\);/,
  `const optimizedData = await optimizeImageFile(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.9,
        mimeType: file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      });
      const optimized = await uploadOptimizedImage(optimizedData, 'settings');`
);

code = code.replace(
  /const optimized = await optimizeImageFile\(file, \{\s*maxWidth: 1600,\s*maxHeight: 900,\s*quality: 0\.85,\s*mimeType: 'image\/jpeg'\s*\}\);/,
  `const optimizedData = await optimizeImageFile(file, {
        maxWidth: 1600,
        maxHeight: 900,
        quality: 0.85,
        mimeType: 'image/jpeg'
      });
      const optimized = await uploadOptimizedImage(optimizedData, 'settings');`
);

code = code.replace(
  /const optimized = await optimizeImageFile\(file, \{\s*maxWidth: 400,\s*maxHeight: 400,\s*quality: 0\.85\s*\}\);/,
  `const optimizedData = await optimizeImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85
      });
      const optimized = await uploadOptimizedImage(optimizedData, 'categories');`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
