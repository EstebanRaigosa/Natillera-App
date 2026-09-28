/*
 * Avatares de los socios (DiceBear): la lista de semillas para elegir y la URL de cada una.
 * Los comparten el formulario de socio (SocioFormModal) y la vista Socios.
 */
// Lista de seeds para avatares predefinidos
export const avatarSeeds = [
  'Sofia', 'Luna', 'Valentina', 'Camila', 'Isabella',
  'Mariana', 'Lucia', 'Gabriela', 'Daniela', 'Paula',
  'Andrea', 'Carolina', 'Natalia', 'Alejandra', 'Victoria',
  'Fernanda', 'Catalina', 'Sara', 'Laura', 'Maria',
  'Ana', 'Elena', 'Rosa', 'Carmen', 'Julia',
  'Claudia', 'Patricia', 'Monica', 'Sandra', 'Diana',
  'Adriana', 'Gloria', 'Teresa', 'Liliana', 'Rocio',
  'Paola', 'Angelica', 'Marcela', 'Lorena', 'Viviana',
  'Johana', 'Tatiana', 'Yolanda', 'Pilar', 'Beatriz',
  'Clara', 'Marta', 'Silvia', 'Esperanza', 'Blanca',
  'Isabel', 'Cristina', 'Mercedes', 'Dolores', 'Amparo',
  'Angela', 'Cecilia', 'Elisa', 'Francisca', 'Gisela',
  'Helena', 'Ines', 'Jimena', 'Karina', 'Leticia',
  'Magdalena', 'Nora', 'Olga', 'Rebeca', 'Susana',
  'Ursula', 'Veronica', 'Wendy', 'Ximena', 'Zoe',
  'Alicia', 'Bianca', 'Carla', 'Estefania', 'Fabiola',
  'Carlos', 'Juan', 'Miguel', 'Andres', 'Luis',
  'Jorge', 'David', 'Daniel', 'Felipe', 'Santiago',
  'Sebastian', 'Alejandro', 'Ricardo', 'Fernando', 'Diego',
  'Pablo', 'Eduardo', 'Gustavo', 'Oscar', 'Sergio',
  'Roberto', 'Javier', 'Antonio', 'Manuel', 'Pedro',
  'Francisco', 'Raul', 'Mario', 'Jaime', 'Hector',
  'Alberto', 'Cesar', 'Hugo', 'Ivan', 'Rodrigo',
  'Enrique', 'Gabriel', 'Nicolas', 'Camilo', 'Fabian',
  'Leonardo', 'Cristian', 'Mauricio', 'Julian', 'Arturo',
  'Victor', 'Guillermo', 'Alfonso', 'Ernesto', 'Ramon',
  'Emilio', 'Rafael', 'Alfredo', 'Jose', 'Esteban',
  'Adrian', 'Bruno', 'Cristobal', 'Dario', 'Federico',
  'Gonzalo', 'Hernan', 'Ignacio', 'Joaquin', 'Kevin',
  'Lucas', 'Mateo', 'Orlando', 'Patricio', 'Ramiro',
  'Samuel', 'Tomas', 'Ulises', 'Valentin', 'Walter',
  'Xavier', 'Yago', 'Zacarias', 'Agustin', 'Benjamin',
  'Domingo', 'Efrain', 'Felix', 'Gerardo', 'Horacio'
]

export function getAvatarUrl(seed, avatarSeed = null, style = 'adventurer') {
  // Usar DiceBear Avatars con el estilo seleccionado
  // Si hay un avatar_seed guardado, usarlo; si no, usar el nombre
  const finalSeed = avatarSeed || seed || 'default'
  const encodedSeed = encodeURIComponent(finalSeed)
  const avatarStyle = style || 'adventurer'
  
  // Colores de fondo según el estilo
  const backgroundColors = {
    'adventurer': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'avataaars': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'big-smile': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'bottts': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'lorelei': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'micah': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'miniavs': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'open-peeps': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'personas': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf'
  }
  
  const bgColors = backgroundColors[avatarStyle] || backgroundColors['adventurer']
  // Asegurar que la URL esté correctamente formateada
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodedSeed}&backgroundColor=${bgColors}`
}
