from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from dotenv import load_dotenv
import os

# Cargar variables del archivo .env
load_dotenv()

# Obtener el token de Hugging Face desde el archivo .env
from huggingface_hub import login
hf_token = os.getenv("HF_TOKEN")  # Cargar el token desde el archivo .env
login(token=hf_token)  # Autenticación en Hugging Face

# Cargar el modelo y el tokenizador de GPT-2 desde Hugging Face
model_name = "gpt2"  # Puedes elegir el tamaño del modelo (GPT-2 pequeño, mediano, grande, etc.)

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Configurar el pad_token como eos_token
tokenizer.pad_token = tokenizer.eos_token

# Crear un prompt más específico para el modelo
prompt = """Interpret the following dream from the perspective of Jungian psychology, considering the archetypes of the mind, such as the Anima, the Animus, the Hero, the Shadow, and other symbolic elements. Respond coherently and based on the principles of Carl Jung's psychology.
"""

# Tokenizar el texto de entrada
inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)

# Generar una respuesta con parámetros adicionales para control
with torch.no_grad():
    outputs = model.generate(
        inputs["input_ids"], 
        max_length=150,  # Límite de longitud de la respuesta
        num_return_sequences=1,  # Generar solo una respuesta
        top_p=0.9,  # Top-p sampling (para controlar la diversidad, valor más bajo para menos aleatoriedad)
        top_k=50,   # Top-k sampling (menos candidatos a considerar)
        temperature=0.7,  # Controla la aleatoriedad (valores bajos para respuestas más coherentes)
        do_sample=True,  # Habilitar muestreo para mayor diversidad
        no_repeat_ngram_size=2  # Evita repetir n-gramas (frases repetidas)
    )

# Decodificar la respuesta
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

# Mostrar la respuesta generada
print(response)
