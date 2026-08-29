import { NextResponse } from 'next/server';

// Fallback veterinary responder logic
function getFallbackResponse(query: string, petName: string, species: string): string {
  const q = query.toLowerCase();
  if (q.includes('vomit') || q.includes('throw up') || q.includes('puke')) {
    return `⚠️ High Alert for ${petName}: If vomiting persists for more than 24 hours, contains blood, or is accompanied by lethargy, please contact your veterinarian immediately. Withhold food for 6-8 hours while offering small amounts of water.`;
  }
  if (q.includes('food') || q.includes('eat') || q.includes('diet') || q.includes('feeding')) {
    return `🍖 Feeding Guidance for ${petName} (${species}): Ensure meals are served at consistent times daily according to your feeding schedule. Keep fresh water available at all times, and avoid toxic foods like chocolate, onions, grapes, and xylitol.`;
  }
  if (q.includes('fever') || q.includes('sick') || q.includes('lethargic') || q.includes('pain')) {
    return `🩺 Health Notice for ${petName}: Signs of lethargy or sudden behavioral changes warrant a vet checkup. Normal body temperature for ${species}s is between 101.0°F and 102.5°F (38.3°C – 39.2°C).`;
  }
  if (q.includes('vaccine') || q.includes('vaccination') || q.includes('shot')) {
    return `💉 Vaccination Reminder: ${petName}'s core vaccinations keep them protected against high-risk diseases. Check your Health Records section to review upcoming due dates!`;
  }
  return `🐾 PetCare AI Assistant: ${petName} is a wonderful ${species}! For general care, maintain a daily routine of regular feeding, exercise, clean water, and weight monitoring. Feel free to ask about diet, exercise, or health symptoms!`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, pet } = body;

    const petName = pet?.name || 'your pet';
    const species = pet?.species || pet?.type || 'dog';
    const breed = pet?.breed || 'Pet';
    const age = pet?.age || 'Unknown age';
    const weight = pet?.weight || 'Unknown weight';
    const allergies = pet?.allergies?.length ? pet.allergies.join(', ') : 'None';
    const conditions = pet?.conditions?.length ? pet.conditions.join(', ') : 'None';

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return intelligent rule-based response
      const reply = getFallbackResponse(prompt, petName, species);
      return NextResponse.json({ success: true, reply, source: 'rule-engine' });
    }

    const systemContext = `You are PetCare AI, an expert veterinary assistant.
Pet Context: Name: ${petName}, Species: ${species}, Breed: ${breed}, Age: ${age}, Weight: ${weight}, Allergies: ${allergies}, Medical Conditions: ${conditions}.
Provide clear, empathetic, and accurate advice tailored specifically to this ${species}. Always include a safety reminder to consult a licensed veterinarian for severe symptoms.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const reply = getFallbackResponse(prompt, petName, species);
      return NextResponse.json({ success: true, reply, source: 'fallback-on-error' });
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      getFallbackResponse(prompt, petName, species);

    return NextResponse.json({ success: true, reply, source: 'gemini' });
  } catch (error: any) {
    return NextResponse.json({ success: true, reply: getFallbackResponse('care', 'Pet', 'dog'), source: 'error-fallback' });
  }
}
