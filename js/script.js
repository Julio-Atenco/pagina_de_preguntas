const API_KEY = "AIzaSyCjHyTj9LrrvNJb7Ksu3nb6eYPO4fM9NXE";
const MODEL = "gemini-2.5-flash"; // Modelo actualizado a 2.5

async function respuestaAPI() {
const prompt = `Genera una pregunta de opción múltiple sobre la historia de los héroes de Marvel. Proporciona cuatro opciones de respuesta y señala cuál es la correcta.
Genera la pregunta y sus posibles respuestas en formato JSON como el siguiente ejemplo:
{
"question": "¿Cuál fue el primer superhéroe de Marvel Comics en protagonizar su propia serie de cómics?",
"options": [
"a) El Capitán América",
"b) La Antorcha Humana (original)",
"c) Namor, el Submarinero",
"d) El Ángel"
],
"correct_answer": "b) La Antorcha Humana (original)",
"explanation": "La Antorcha Humana (original) fue el primer superhéroe de Marvel Comics en tener su propia serie de cómics, debutando en 'Marvel Comics' #1 en 1939."
}`;

// Llamada al API
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

try {
const response = await fetch(
url,
{
method: "POST",
headers: { "Content-Type": "application/json" },

body: JSON.stringify({
// La clave 'contents' es correcta
contents: [{
parts: [{ text: prompt }]
}],
// Opcional: añadir la configuración de generación
generationConfig: {
temperature: 0.5,
},
}),
}
);

// Manejo de errores de HTTP
if (!response.ok) {
const errorData = await response.json();
throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
}

const data = await response.json();
console.log("Respuesta cruda:", data);

// Se asume que la respuesta tiene al menos una 'candidate' y 'part'
const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;


if (textResult) {
console.log("Respuesta de Gemini:", textResult);
} else {
console.log("No se pudo extraer el texto de la respuesta.");
}


const primerllave = textResult.indexOf('{')
const ultmallave = textResult.lastIndexOf('}')
const res = JSON.parse( textResult.substring(primerllave, ultmallave + 1 ) );



console.log("jsonResponse", res);

//exito en la petición
return {
result: 1,
response: res
};

} catch (error) {
console.error("Hubo un error en la petición:", error);
return {
result: 0,
response: "Hubo un error en la petición"
}
}
}

//respuestaAPI();


const respuesta = `{
"question": "¿Qué equipo de superhéroes marcó el inicio de la 'Edad de Plata' de Marvel Comics, estableciendo las bases del Universo Marvel moderno?",
"options": [
"a) Los Vengadores",
"b) Los X-Men",
"c) Los Cuatro Fantásticos",
"d) Los Defensores"
],
"correct_answer": "c) Los Cuatro Fantásticos",
"explanation": "Los Cuatro Fantásticos, creados por Stan Lee y Jack Kirby, debutaron en 'Fantastic Four' #1 en noviembre de 1961. Su éxito es ampliamente reconocido como el inicio de la Edad de Plata de Marvel Comics, definiendo el tono y el estilo del universo compartido que conocemos hoy."
}`


function desplegar(jsontext){
const jsonObj = JSON.parse(jsontext);
console.log(jsonObj);

document.getElementById("question-text").innerHTML = jsonObj.question;

const options = document.getElementById("options-container");

jsonObj.options.forEach( (element, index) => {
console.log(index, element);

const div = document.createElement("div");
div.innerHTML = element;
div.classList.add("option-button");
//classlist add

div.addEventListener('click', (e) => {
    if(element == jsonObj.correct_answer){
        div.classList.add("correct");
    }else{
        div.classList.add("incorrect");
    }
    document.getElementById("expl")
});

options.appendChild(div);

});

}


desplegar(
respuesta
);