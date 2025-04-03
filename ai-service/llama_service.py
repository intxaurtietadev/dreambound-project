@app.route('/interpret-dream', methods=['POST'])
def interpret_dream():
    data = request.get_json()
    dream_text = data.get('dream_text', '')
    relevant_archetypes = data.get('relevant_archetypes', [])
    
    if not dream_text:
        return jsonify({"error": "No dream text provided"}), 400
    
    # Construir prompt con arquetipos
    archetypes_info = ""
    if relevant_archetypes:
        archetypes_info = "\nRelevant Archetypes Found:\n"
        for archetype in relevant_archetypes:
            archetypes_info += f"- {archetype.get('archetype')}: {archetype.get('description')}\n"
    
    prompt = f"""Interpret the following dream from the perspective of Jungian psychology, 
considering these specific archetypes and providing a detailed analysis.

Dream: {dream_text}
{archetypes_info}

Jungian Interpretation:"""
    
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    
    with torch.no_grad():
        outputs = model.generate(
            inputs["input_ids"],
            max_length=MAX_LENGTH,
            temperature=TEMPERATURE,
            top_p=0.9,
            do_sample=True,
            no_repeat_ngram_size=2
        )
    
    interpretation = tokenizer.decode(outputs[0], skip_special_tokens=True)
    interpretation = interpretation.replace(prompt, "").strip()
    
    return jsonify({
        "interpretation": interpretation,
        "archetypes_used": [a.get('archetype') for a in relevant_archetypes],
        "status": "success"
    })