let todosLosPokemons = []
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || []  // Carga los favoritos desde localStorage o inicia un array vacío
let modo = "todos" 

const boton = document.querySelector("#boton-favoritos")
boton.addEventListener("click", () => {
    if (modo === "todos") {
        mostrarPokemons(todosLosPokemons.filter(pokemon => favoritos.includes(pokemon.nombre)))
        boton.textContent = ""
        modo = "favoritos"
    } else {
        mostrarPokemons(todosLosPokemons)
        boton.textContent = ""
        modo = "todos"
    }
})

const obtenerPokemon = async () => {
    try {
        // Muestra el spinner antes de empezar a cargar
        document.querySelector("#loading").style.display = "flex"

        const pokemons = await fetch("https://pokeapi.co/api/v2/pokemon?limit=500")
        const data = await pokemons.json()
        const listaPokemons = data.results
        const detallesPokemons = await Promise.all(
            listaPokemons.map(pokemon => obtenerDetalle(pokemon.url))
        )
        todosLosPokemons = detallesPokemons

        // Oculta el spinner cuando ya cargaron todos
        document.querySelector("#loading").style.display = "none"

        mostrarPokemons(detallesPokemons)
    } catch (error) {
        console.error(error)
    }
}

const obtenerDetalle = async (url) => {
    const respuesta = await fetch(url)
    const pokemon = await respuesta.json()
    return {
        nombre: pokemon.name,
        imagen: pokemon.sprites.front_default,
        tipos: pokemon.types.map(t => t.type.name),
        experiencia: pokemon.base_experience,  // guardamos la experiencia para el modal
        altura: pokemon.height,  // guardamos la altura para el modal
        peso: pokemon.weight,  // guardamos el peso para el modal
        hp: pokemon.stats[0].base_stat,  // guardamos las estadísticas para el modal
        ataque: pokemon.stats[1].base_stat,
        defensa: pokemon.stats[2].base_stat,
        velocidad: pokemon.stats[5].base_stat,
        numero: pokemon.id,  // guardamos el número para mostrarlo en la tarjeta
        shiny: pokemon.sprites.front_shiny  // guardamos la imagen shiny para el modal
    }
}

const mostrarPokemons = (pokemons) => {
    const contenedor = document.querySelector("#pokemon-container")

    if (pokemons.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron Pokémon</p>"
        return
    }

    contenedor.innerHTML = ""

    pokemons.forEach(pokemon => {
        const numero = pokemon.numero.toString().padStart(3, "0")
        const esFavorito = favoritos.includes(pokemon.nombre)
        const tiposHTML = pokemon.tipos.map(tipo =>
            `<span class="${tipo}">${tipo}</span>`).join("")
        const tarjeta = document.createElement("div")

        tarjeta.classList.add("tarjeta")
        tarjeta.innerHTML =`
            <span class="numero">#${numero}</span>
            <span class="estrella">${esFavorito ? "★" : "☆"}</span>
            <img src="${pokemon.imagen}" alt="${pokemon.nombre}">
            <h3>${pokemon.nombre}</h3>
            <div class="tipos">${tiposHTML}</div>
        `
        const estrella = tarjeta.querySelector(".estrella")
        estrella.addEventListener("click", (e) => {
            e.stopPropagation()  // Evita que se abra el modal al clickear la estrella
            
            if (favoritos.includes(pokemon.nombre)) {
                favoritos = favoritos.filter(nombre => nombre !== pokemon.nombre)
            } else {
                favoritos.push(pokemon.nombre)
            }

    localStorage.setItem("favoritos", JSON.stringify(favoritos))

    mostrarPokemons(todosLosPokemons)
        })

        // Al clickear la tarjeta abre el modal con los datos del pokémon
        tarjeta.addEventListener("click", () => abrirModal(pokemon))

        contenedor.appendChild(tarjeta)
    })
}

const colores = {
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    poison: "#A040A0",
    normal: "#A8A878",
    bug: "#A8B820",
    flying: "#A890F0",
    electric: "#F8D030",
    ground: "#E0C068",
    fairy: "#EE99AC",
    psychic: "#F85888",
    rock: "#B8A038",
    ice: "#98D8D8",
    ghost: "#705898",
    dragon: "#7038F8",
    fighting: "#C03028",
    dark: "#705848"
}

const getColor = (tipo) => colores[tipo] || "#ccc"  // color por defecto si el tipo no está en el objeto

const abrirModal = (pokemon) => {
    document.body.style.overflow = "hidden"  // Evita que el fondo se pueda scrollear cuando el modal está abierto
    const modal = document.querySelector("#modal")
    const tipo1 = pokemon.tipos[0]
    const tipo2 = pokemon.tipos[1]
    const imagen = document.querySelector("#modal-imagen")
    const botonShiny = document.querySelector("#toggle-shiny")

    if (pokemon.tipos.length === 1) {
        modal.style.background = getColor(tipo1)
    } else {
        modal.style.background = `linear-gradient(135deg, ${getColor(tipo1)}, ${getColor(tipo2)})`
    }

    // Rellena el modal con los datos del pokémon clickeado
    imagen.src = pokemon.imagen
    let esShiny = false
    botonShiny.textContent = "✨"
    botonShiny.onclick = () => {
    esShiny = !esShiny

    imagen.style.opacity = 0

    setTimeout(() => {
        imagen.src = esShiny ? pokemon.shiny : pokemon.imagen
        imagen.style.opacity = 1
    }, 150)

    botonShiny.textContent = esShiny ? "" : "✨"
}
    
    document.querySelector("#modal-nombre").textContent = pokemon.nombre
    document.querySelector("#modal-tipo").textContent = `Tipo: ${pokemon.tipos.join(" & ")}`
    document.querySelector("#modal-experiencia").textContent = `Experiencia base: ${pokemon.experiencia}`
    document.querySelector("#modal-altura").textContent = `Altura: ${pokemon.altura / 10}m`
    document.querySelector("#modal-peso").textContent = `Peso: ${pokemon.peso / 10}kg`
    document.querySelector("#modal-hp").innerHTML = `
        <span>HP: ${pokemon.hp}</span>
        <div class="stat-barra-fondo">
            <div class="stat-barra-relleno-hp" style="width: ${(pokemon.hp / 200) * 100}%"></div>
        </div>
    `
    document.querySelector("#modal-ataque").innerHTML = `
        <span>Ataque: ${pokemon.ataque}</span>
        <div class="stat-barra-fondo">
            <div class="stat-barra-relleno" style="width: ${(pokemon.ataque / 200) * 100}%"></div>
        </div>
    `
    document.querySelector("#modal-defensa").innerHTML = `
        <span>Defensa: ${pokemon.defensa}</span>
        <div class="stat-barra-fondo">
            <div class="stat-barra-relleno-defensa" style="width: ${(pokemon.defensa / 200) * 100}%"></div>
        </div>
    `
    document.querySelector("#modal-velocidad").innerHTML = `
        <span>Velocidad: ${pokemon.velocidad}</span>
        <div class="stat-barra-fondo">
            <div class="stat-barra-relleno-velocidad" style="width: ${(pokemon.velocidad / 200) * 100}%"></div>
        </div>
    `

    // Muestra el modal cambiando su clase
    modal.classList.remove("modal-oculto")
    modal.classList.add("modal-visible")
}

// Cierra el modal al clickear el botón ✕
document.querySelector("#cerrar-modal").addEventListener("click", () => {
    document.body.style.overflow = "auto"  // Vuelve a permitir el scroll del fondo
    const modal = document.querySelector("#modal")
    modal.classList.remove("modal-visible")
    modal.classList.add("modal-oculto")
})

// También cierra el modal al clickear fuera del contenido
document.querySelector("#modal").addEventListener("click", (e) => {
    document.body.style.overflow = "auto"  // Vuelve a permitir el scroll del fondo
    if (e.target.id === "modal") {  // solo si clickeas el fondo oscuro
        const modal = document.querySelector("#modal")
        modal.classList.remove("modal-visible")
        modal.classList.add("modal-oculto")
    }
})

const buscador = document.querySelector("#buscador")
buscador.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase().trim()
    const pokemonsFiltrados = todosLosPokemons.filter(pokemon => {
    const coincideTexto = pokemon.nombre.includes(texto)
    const esFavorito = favoritos.includes(pokemon.nombre)

    if (modo === "favoritos") {
        return coincideTexto && esFavorito
    }

    return coincideTexto
    })
    mostrarPokemons(pokemonsFiltrados)
})

obtenerPokemon()