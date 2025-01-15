const descriptionTemplates = [
  // Vision and future templates
  '${projectName} represents the future of urban living, strategically positioned in ${area}\'s thriving district.',
  'In the heart of ${area}, ${projectName} emerges as a landmark development shaping ${city}\'s skyline.',
  'Setting new standards in ${city}, ${projectName} combines innovation with luxury in ${area}\'s premium locale.',
  '${projectName} stands as a beacon of innovation, defining the next chapter of ${area}\'s urban evolution.',
  'Welcome to the future at ${projectName}, where tomorrow\'s living standards meet ${area}\'s vibrant present.',
  '${projectName} pioneers a new era of development, transforming the landscape of ${area}.',
  'Experience tomorrow\'s lifestyle today at ${projectName}, the visionary development in ${area}.',

  // Lifestyle and community templates
  'Experience exceptional living at ${projectName}, where modern lifestyle meets the vibrant spirit of ${area}.',
  '${projectName} creates a harmonious blend of community and luxury in the prestigious ${area} district.',
  'Nestled in ${area}, ${projectName} offers a sophisticated lifestyle in one of the most sought-after locations.',
  '${projectName} fosters a vibrant community spirit, setting new lifestyle standards in ${area}.',
  'Discover a life of distinction at ${projectName}, where community meets luxury in the heart of ${area}.',
  'At ${projectName}, every detail is crafted to enhance your lifestyle in the prestigious ${area}.',
  '${projectName} embodies the perfect balance of community living and personal space in ${area}.',

  // Architecture and design templates
  '${projectName} stands as an architectural masterpiece in ${area}, redefining contemporary living.',
  'Commanding presence meets elegant design at ${projectName}, a premium development in ${area}\'s exclusive enclave.',
  '${projectName} introduces a new chapter in residential excellence to ${area}\'s evolving landscape.',
  'Witness architectural brilliance at ${projectName}, where design meets purpose in ${area}.',
  '${projectName} showcases unprecedented architectural innovation in the heart of ${area}.',
  'Bold design meets timeless elegance at ${projectName}, ${area}\'s newest architectural landmark.',
  '${projectName} sets new standards in architectural excellence, enriching ${area}\'s skyline.',

  // Location and connectivity templates
  'Strategically located in ${area}, ${projectName} offers unparalleled connectivity to key destinations.',
  '${projectName} brings world-class living to ${area}, embracing dynamic energy.',
  'In the prestigious ${area} district, ${projectName} represents the pinnacle of urban sophistication.',
  '${projectName} combines prime location with exceptional amenities in the heart of ${area}.',
  'Experience seamless connectivity at ${projectName}, strategically positioned in ${area}.',
  '${projectName} offers the perfect balance of accessibility and exclusivity in ${area}.',
  'Located in the dynamic hub of ${area}, ${projectName} connects you to the best of urban living.',

  // Investment and value templates
  '${projectName} emerges as ${area}\'s premier investment destination, setting new benchmarks in luxury living.',
  'Discover exceptional value at ${projectName}, where location meets lifestyle in the heart of ${area}.',
  '${projectName} presents an unprecedented opportunity in ${area}\'s fastest-growing district.',
  'Invest in excellence at ${projectName}, where value appreciation meets luxury living in ${area}.',
  '${projectName} stands as a testament to value creation in ${area}\'s thriving real estate landscape.',
  'Secure your future at ${projectName}, the most promising investment opportunity in ${area}.',
  '${projectName} offers unmatched investment potential in ${area}\'s rapidly evolving market.',
  // Luxury and exclusivity templates
  'Experience unparalleled luxury at ${projectName}, the crown jewel of ${area}\'s residential offerings.',
  '${projectName} sets new standards in premium living within ${area}\'s most exclusive neighborhood.',
  'Discover the epitome of luxury at ${projectName}, where excellence meets elegance in ${area}.',
  '${projectName} represents the pinnacle of refined living in ${area}\'s prestigious community.',
  'Welcome to exceptional living at ${projectName}, where luxury finds its home in ${area}.',
  '${projectName} defines exclusive living in the heart of ${area}\'s most coveted district.',
  'Experience the height of sophistication at ${projectName}, ${area}\'s most prestigious address.',

  // Amenities and lifestyle features
  '${projectName} offers world-class amenities that redefine the art of living in ${area}.',
  'Live life to the fullest at ${projectName}, where premium amenities meet ${area}\'s vibrant lifestyle.',
  '${projectName} presents an unmatched array of lifestyle features in the heart of ${area}.',
  'Discover a world of convenience at ${projectName}, ${area}\'s most amenity-rich development.',
  '${projectName} combines luxury amenities with strategic location in ${area}\'s prime district.',
  'Experience resort-style living at ${projectName}, the new benchmark for luxury in ${area}.',
  '${projectName} offers a comprehensive suite of amenities that enhance life in ${area}.'
]

export function generateProjectDescription(projectName, location) {
  const randomIndex = Math.floor(Math.random() * descriptionTemplates.length)
  const template = descriptionTemplates[randomIndex]
  
  // Replace the template variables directly using replace
  return template
    .replace(/\${projectName}/g, projectName)
    .replace(/\${area}/g, location)
    .replace(/\${city}/g, location) // Also replacing city with location since it's used in some templates
}