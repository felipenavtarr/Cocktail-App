const API_URL_BASE = 'https://www.thecocktaildb.com/api/json/v1/1/'
const API_URL_NAME = `${API_URL_BASE}search.php?s=`
const API_URL_INDEX = `${API_URL_BASE}lookup.php?i=`

const buscarCocktails = async (filtro) => {
    try {
        const response = await fetch(`${API_URL_NAME}${filtro}`)
        
        const data = await response.json()
        
        return data.drinks
    } catch (error) {
        console.error("Error fetching cocktails:", error);
        return null;
    }
}

const pintarCocktails = (cocktails) => {
    const listado = document.querySelector('#listadoCocktails')

    // Validación por si no hay resultados
    if (!cocktails) {
        listado.innerHTML = '<li class="no-results">No se encontraron cócteles con ese nombre 😢</li>';
        return;
    }

    const listaCocktailsHtml = cocktails.map((cocktail) => {
        // Nombre envuelto en un span class="cocktail-title" para poder darle estilo
        return `<li id="${cocktail.idDrink}">
                    <span class="cocktail-title">${cocktail.strDrink}</span>
                    <img src="${cocktail.strDrinkThumb}" alt="Imagen de ${cocktail.strDrink}" loading="lazy"/>
                    <button type="button" class="btnInstructions" data-id="${cocktail.idDrink}">Instrucciones</button>
                </li>`
    })

    listado.innerHTML = listaCocktailsHtml.join('')
    addListenerBotonesInstrucciones()
}

const formulario = document.querySelector('#buscador')
formulario.addEventListener('submit', async (event) => {
    event.preventDefault()

    const cocktailABuscar = formulario.elements.filtro.value.trim()

    if (cocktailABuscar === "") return; // Evitar busquedas vacias

    const cocktails = await buscarCocktails(cocktailABuscar)
    pintarCocktails(cocktails)
})

const addListenerBotonesInstrucciones = () => {
    const botones = document.querySelectorAll(".btnInstructions")

    botones.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Añadir feedback visual al botón (opcional)
            const originalText = btn.innerText;
            btn.innerText = "Cargando...";

            try {
                const instrucciones = await buscarInstruccionesPorId(btn.dataset.id)
                mostrarInstrucciones(instrucciones)
            } catch (e) {
                mostrarInstrucciones("No se pudieron cargar las instrucciones.")
            } finally {
                btn.innerText = originalText;
            }
        })
    })
}

const buscarInstruccionesPorId = async id => {
    const response = await fetch(`${API_URL_INDEX}${id}`)
    const data = await response.json()

    // Intentar obtener instrucciones en español si existen, si no en inglés
    const drink = data.drinks[0];
    return drink.strInstructionsES || drink.strInstructions || "Sin instrucciones disponibles";
}

// MODIFICADO: Usamos un Modal personalizado en vez de alert()
const mostrarInstrucciones = instruc => {
    const modal = document.getElementById('modalInstrucciones');
    const texto = document.getElementById('textoInstrucciones');

    texto.innerText = instruc;
    modal.classList.add('active');
}

// Lógica para cerrar el modal
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('modalInstrucciones').classList.remove('active');
});

// Cerrar al hacer click fuera del contenido
document.getElementById('modalInstrucciones').addEventListener('click', (e) => {
    if (e.target.id === 'modalInstrucciones') {
        document.getElementById('modalInstrucciones').classList.remove('active');
    }
});