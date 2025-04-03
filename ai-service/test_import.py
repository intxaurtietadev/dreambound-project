import pinecone
import sys

try:
    from pinecone import Pinecone, ServerlessSpec
    print("Importación de Pinecone y ServerlessSpec ¡EXITOSA!")
    print(f"Versión de Pinecone: {pinecone.__version__}")
    pc = Pinecone(api_key="dummy") # Solo para ver si la clase existe
    print("Instancia de Pinecone creada (dummy).")
except ImportError as e:
    print(f"Error de importación: {e}")
except Exception as e_other:
    print(f"Otro error: {e_other}")

print("\nRuta de búsqueda de Python (sys.path):")
for p in sys.path:
    print(p)

print(f"\nUbicación del módulo pinecone encontrado: {pinecone.__file__}")