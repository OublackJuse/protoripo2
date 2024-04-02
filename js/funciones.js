$(document).ready(function() {
    // Evento clic para buscar Pokémon
    $('#buscar').click(function() {
        var pokemonName = $('#txt_buscador').val().toLowerCase();
        if (pokemonName.trim() !== '') {
            buscarPokemon(pokemonName);
        }
    });

    // Evento clic para limpiar el buscador y la carta
    $('#limpiar').click(function() {
        limpiarBuscadorYCarta();
    });

    // Evento clic para ver la Mega Evolución X
    $('#btnMegaX').click(function() {
        var pokemonName = $('.nombre').text().split(': ')[1];
        obtenerPokemonVariantes(pokemonName, 'mega-x');
    });

    // Evento clic para ver la Mega Evolución Y
    $('#btnMegaY').click(function() {
        var pokemonName = $('.nombre').text().split(': ')[1];
        obtenerPokemonVariantes(pokemonName, 'mega-y');
    });

    // Evento clic para ver las evoluciones y estadísticas
    $('#btnEvoluciones').click(function() {
        var pokemonName = $('.nombre').text().split(': ')[1];
        mostrarEvolucionesYPokemon(pokemonName);
    });

    // Función para buscar Pokémon
    function buscarPokemon(nombrePokemon) {
        $.get(`https://pokeapi.co/api/v2/pokemon/${nombrePokemon}`, function(data) {
            mostrarPokemon(data);
            obtenerDebilidades(data.types);
            mostrarBotones();
        }).fail(function() {
            mostrarError404();
        });
    }

    // Función para mostrar los datos del Pokémon
    function mostrarPokemon(pokemonData) {
        $('#pokemon-card').show();
        $('.error-404').hide();
        $('.nombre').text(`Nombre: ${pokemonData.name}`);
        $('.tipo').text(`Tipo: ${traducirTipo(pokemonData.types.map(type => type.type.name).join(', '))}`);
        $('.imagen').html(`<img src="${pokemonData.sprites.other['official-artwork'].front_default}" alt="${pokemonData.name}" class="pokemon-img"/>`);
        mostrarEstadisticas(pokemonData.stats);
    }

    // Función para obtener Mega Evoluciones y otras variantes
    function obtenerPokemonVariantes(nombrePokemon, variante) {
        var baseUrl = `https://pokeapi.co/api/v2/pokemon/${nombrePokemon}`;

        // URL para mega evolución X o Y
        var variantUrl;
        switch (variante) {
            case 'mega-x':
            case 'mega-y':
                variantUrl = `${baseUrl}-mega-${variante.substring(5)}`;
                break;
        }

        // Realizar solicitud a la API
        $.get(variantUrl, function(data) {
            mostrarPokemon(data);
        }).fail(function() {
            mostrarError404();
        });
    }

    // Función para mostrar las estadísticas del Pokémon
    function mostrarEstadisticas(stats) {
        var estadisticasHTML = '';
        stats.forEach(function(stat) {
            var nombreStat = traducirNombreStat(stat.stat.name);
            estadisticasHTML += `
                <div class="mb-3">
                    <p>${nombreStat}: ${stat.base_stat}</p>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${stat.base_stat}%"></div>
                    </div>
                </div>`;
        });
        $('.contenedor-estadisticas').html(estadisticasHTML);
    }

    // Función para obtener las debilidades del Pokémon
    function obtenerDebilidades(types) {
        var tipos = types.map(type => type.type.name);
        var debilidades = [];

        // Función auxiliar para verificar debilidades
        function verificarDebilidad(tipo) {
            $.get(`https://pokeapi.co/api/v2/type/${tipo}`, function(data) {
                data.damage_relations.double_damage_from.forEach(function(weakness) {
                    if (!tipos.includes(weakness.name)) {
                        debilidades.push(weakness.name);
                    }
                });
                mostrarDebilidades(debilidades);
            });
        }

        tipos.forEach(verificarDebilidad);
    }

    // Función para mostrar las debilidades del Pokémon
    function mostrarDebilidades(debilidades) {
        if (debilidades.length > 0) {
            var debilidadesTraducidas = debilidades.map(tipo => traducirTipo(tipo));
            $('.debilidades').text(`Debilidades: ${debilidadesTraducidas.join(', ')}`);
        } else {
            $('.debilidades').text('El Pokémon no tiene debilidades conocidas.');
        }
    }

    // Función para mostrar botones
    function mostrarBotones() {
        $('#botones-pokemon').show();
    }

    // Función para mostrar error 404 o mensaje de no encontrado
    function mostrarError404() {
        $('#pokemon-card').hide();
        if (!$('#btnMegaX').is(':visible')) {
            mostrarMensajeEmergente('No se encontró la Mega Evolución X.');
        } else if (!$('#btnMegaY').is(':visible')) {
            mostrarMensajeEmergente('No se encontró la Mega Evolución Y.');
        } else if (!$('#btnEvoluciones').is(':visible')) {
            mostrarMensajeEmergente('No se encontraron Evoluciones para este Pokémon.');
        } else {
            $('.error-404').show().text('No se encontró el Pokémon. Por favor, intenta con otro nombre.');
        }
    }

    // Función para mostrar un mensaje emergente
    function mostrarMensajeEmergente(mensaje) {
        $('#popup-message').text(mensaje);
        $('#custom-popup').show();
    }

    // Evento clic para cerrar la ventana emergente
    $('#close-popup').click(function() {
        $('#custom-popup').hide();
    });

    // Función para limpiar el buscador y la carta
    function limpiarBuscadorYCarta() {
        $('#txt_buscador').val('');
        $('#pokemon-card').hide();
        $('.error-404').hide();
        $('.nombre, .tipo, .imagen, .contenedor-estadisticas, .debilidades').empty();
        $('#botones-pokemon').hide();
    }

    // Función para traducir el nombre de las estadísticas
    function traducirNombreStat(statName) {
        switch (statName) {
            case 'speed':
                return 'Velocidad';
            case 'special-defense':
                return 'Defensa Especial';
            case 'special-attack':
                return 'Ataque Especial';
            case 'defense':
                return 'Defensa';
            case 'attack':
                return 'Ataque';
            case 'hp':
                return 'Puntos de Salud';
            default:
                return statName;
        }
    }

    // Función para traducir el tipo del Pokémon
    function traducirTipo(tipo) {
        var tiposTraducidos = {
            normal: 'Normal',
            fighting: 'Lucha',
            flying: 'Volador',
            poison: 'Veneno',
            ground: 'Tierra',
            rock: 'Roca',
            bug: 'Bicho',
            ghost: 'Fantasma',
            steel: 'Acero',
            fire: 'Fuego',
            water: 'Agua',
            grass: 'Planta',
            electric: 'Eléctrico',
            psychic: 'Psíquico',
            ice: 'Hielo',
            dragon: 'Dragón',
            dark: 'Siniestro',
            fairy: 'Hada'
        };

        return tiposTraducidos[tipo.toLowerCase()] || tipo;
    }

    // Función para mostrar las evoluciones y estadísticas
    function mostrarEvolucionesYPokemon(nombrePokemon) {
        $.get(`https://pokeapi.co/api/v2/pokemon-species/${nombrePokemon}`, function(data) {
            var evolutionChainUrl = data.evolution_chain.url;
            $.get(evolutionChainUrl, function(data) {
                var evolutionChain = obtenerEvoluciones(data.chain, []);
                mostrarEvolucionesYEstadisticas(evolutionChain);
            });
        }).fail(function() {
            mostrarError404();
        });
    }

    // Función auxiliar para obtener evoluciones
    function obtenerEvoluciones(chain, evolutions) {
        if (!chain) {
            return evolutions;
        }
        
        var speciesName = chain.species.name;
        evolutions.push(speciesName);
        
        if (chain.evolves_to.length > 0) {
            obtenerEvoluciones(chain.evolves_to[0], evolutions); // Solo mostraremos la primera evolución
        }
        
        return evolutions;
    }

    // Función auxiliar para mostrar evoluciones y estadísticas
    function mostrarEvolucionesYEstadisticas(evolutionChain) {
        evolutionChain.forEach(function(evolution, index) {
            setTimeout(function() {
                $.get(`https://pokeapi.co/api/v2/pokemon/${evolution}`, function(data) {
                    mostrarPokemon(data);
                    mostrarEstadisticas(data.stats);
                }).fail(function() {
                    mostrarError404();
                });
            }, index * 2000); // Mostramos cada evolución cada 2 segundos
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const botonBuscarVoz = document.getElementById("btnBuscarVoz");

    // Verificar qué objeto de reconocimiento de voz está disponible
    const reconocervoz = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!reconocervoz) {
        console.error("El navegador no es compatible con la API de reconocimiento de voz.");
    } else {
        const reconocimiento = new reconocervoz();
        reconocimiento.lang = 'es-ES'; // Establece el idioma del reconocimiento de voz a español

        reconocimiento.onstart = function () {
            console.log("El micrófono está activado");
        }

        reconocimiento.onresult = function (event) {
            const current = event.resultIndex;
            const transcripcion = event.results[current][0].transcript;
            document.getElementById("txt_buscador").value = transcripcion;
        }

        botonBuscarVoz.addEventListener('click', () => {
            reconocimiento.start();
        });

        reconocimiento.onend = function () {
            buscarPokemon();
        };

        function buscarPokemon() {
            const transcripcion = document.getElementById("txt_buscador").value;
            if (transcripcion.trim() !== '') {
                $("#buscar").click();
            }
        }
    }
});
