export function getAvatarUrl(seed, avatarSeed = null, style = 'adventurer') {
  // Usar DiceBear Avatars con el estilo seleccionado
  // Si hay un avatar_seed guardado, usarlo; si no, usar el nombre
  const finalSeed = avatarSeed || seed || 'default'
  const encodedSeed = encodeURIComponent(finalSeed)
  const avatarStyle = style || 'adventurer'
  
  // Colores de fondo según el estilo
  const backgroundColors = {
    'adventurer': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'avataaars': 'b6e3f4,c0aede,ffd5dc,ffdfbf',
    'big-smile': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'bottts': 'b6e3f4,c0aede,ffd5dc',
    'fun-emoji': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'icons': 'b6e3f4,c0aede,ffd5dc',
    'identicon': 'b6e3f4,c0aede,ffd5dc',
    'lorelei': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'micah': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'miniavs': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'open-peeps': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'personas': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'pixel-art': 'b6e3f4,c0aede,ffd5dc',
    'rings': 'b6e3f4,c0aede,ffd5dc',
    'shapes': 'b6e3f4,c0aede,ffd5dc',
    'thumbs': 'b6e3f4,c0aede,ffd5dc'
  }
  
  const bgColors = backgroundColors[avatarStyle] || backgroundColors['adventurer']
  
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodedSeed}&backgroundColor=${bgColors}`
}

