const API_KEY = "AIzaSyCjHyTj9LrrvNJb7Ksu3nb6eYPO4fM9NXE";
const MODEL = "gemini-2.5-flash";
const tema = "One Piece";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

let correctas = 0;
let incorrectas = 0;
let preguntaActual = null;

/**
 * Obtiene una pregunta de trivia desde la API de Gemini
 */
async function obtenerPregunta() {
    const prompt = `Genera una pregunta de opción múltiple sobre ${tema}. Proporciona cuatro opciones de respuesta y señala cuál es la correcta.
Genera la pregunta y sus posibles respuestas en formato JSON como el siguiente ejemplo:
{
    "question": "¿Cuál es el nombre del barco de los Piratas de Sombrero de Paja?",
    "options": [
        "a) Thousand Sunny",
        "b) Going Merry",
        "c) Red Force",
        "d) Moby Dick"
    ],
    "correct_answer": "a) Thousand Sunny",
    "explanation": "El Thousand Sunny es el segundo barco de los Piratas de Sombrero de Paja, construido por Franky después de que el Going Merry fuera destruido."
}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                },
            }),
        });

        // Manejo de errores de HTTP
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Respuesta de Gemini:", data);

        // Extracción simple del texto de la respuesta, asumiendo que la respuesta tiene al menos una 'candidate' y 'part'     
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResult) {
            const textResultTrimmed = textResult.trim();
            const firstBraceIndex = textResultTrimmed.indexOf('{');
            const lastBraceIndex = textResultTrimmed.lastIndexOf('}');
            const jsonString = textResultTrimmed.substring(firstBraceIndex, lastBraceIndex + 1);
            
            const questionData = JSON.parse(jsonString);
            console.log("Pregunta procesada:", questionData);
            return questionData;
        } else {
            console.error("No se pudo extraer el texto de la respuesta.");
            return null;
        }

    } catch (error) {
        console.error("Error al obtener pregunta:", error);
        document.getElementById('question').textContent = 'Error al cargar la pregunta. Verifica tu conexión o la API key.';
        return null;
    }
}

/**
 * Carga una nueva pregunta y resetea la interfaz
 */
async function cargarPregunta() {
    // Resetear interfaz
    document.getElementById('question').textContent = 'Cargando pregunta de Gemini...';
    document.getElementById('question').className = 'text-center text-muted';
    document.getElementById('options').innerHTML = '';
    document.getElementById('feedback-container').style.display = 'none';
    document.getElementById('next-button').style.display = 'none';

    preguntaActual = await obtenerPregunta();

    if (preguntaActual) {
        desplegarPregunta(preguntaActual);
    }
}

/**
 * Despliega la pregunta y las opciones en la interfaz
 */
function desplegarPregunta(datosPregunta) {
    // Mostrar pregunta
    document.getElementById('question').textContent = datosPregunta.question;
    document.getElementById('question').className = 'text-dark';

    // Crear botones de opciones
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    datosPregunta.options.forEach((opcion) => {
        const button = document.createElement('button');
        button.className = 'btn option-button';
        button.textContent = opcion;
        button.onclick = () => verificarRespuesta(opcion, datosPregunta.correct_answer, datosPregunta.explanation);
        optionsContainer.appendChild(button);
    });
}

/**
 * Verifica si la respuesta seleccionada es correcta
 */
function verificarRespuesta(respuestaSeleccionada, respuestaCorrecta, explicacion) {
    const buttons = document.querySelectorAll('.option-button');
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const explanationText = document.getElementById('explanation-text');

    // Deshabilitar todos los botones
    buttons.forEach(btn => {
        btn.disabled = true;
        
        // Marcar la respuesta correcta en verde
        if (btn.textContent === respuestaCorrecta) {
            btn.classList.add('correct');
        }
        
        // Marcar la respuesta incorrecta seleccionada en rojo
        if (btn.textContent === respuestaSeleccionada && respuestaSeleccionada !== respuestaCorrecta) {
            btn.classList.add('incorrect');
        }
    });

    // Actualizar contadores y feedback
    if (respuestaSeleccionada === respuestaCorrecta) {
        correctas++;
        feedbackContainer.className = 'correct';
        feedbackMessage.textContent = '¡Correcto! 🎉';
        document.getElementById('correctas').textContent = correctas;
    } else {
        incorrectas++;
        feedbackContainer.className = 'incorrect';
        feedbackMessage.textContent = '❌ Incorrecto';
        document.getElementById('incorrectas').textContent = incorrectas;
    }

    // Mostrar explicación y botón de siguiente
    explanationText.textContent = explicacion;
    feedbackContainer.style.display = 'block';
    document.getElementById('next-button').style.display = 'block';
}

/**
 * Actualiza los contadores en la interfaz
 */
function desplegarContadores() {
    document.getElementById('correctas').textContent = correctas;
    document.getElementById('incorrectas').textContent = incorrectas;
}

// Event listener para el botón "Siguiente Pregunta"
document.getElementById('next-button').addEventListener('click', cargarPregunta);

// Cargar primera pregunta al iniciar la página
window.onload = () => {
    console.log("Página cargada. Iniciando trivia...");
    desplegarContadores();
    cargarPregunta();
};