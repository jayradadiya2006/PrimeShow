const { GoogleGenAI } = require('@google/genai');

/**
 * PrimeShow Gemini AI Support Assistant Module
 * Uses Google Gemini API (@google/genai) to generate natural, dynamic,
 * non-repetitive support replies for Live Support Chat.
 */

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('⚠️ GoogleGenAI initialization warning:', err.message);
    return null;
  }
}

/**
 * Generates dynamic, natural support response using Gemini 2.5/2.0 Flash model.
 * Includes fallbacks if API Key is missing or rate limited.
 */
async function generateGeminiSupportReply(userPrompt, context = {}) {
  const ai = getGeminiClient();

  const systemInstruction = `You are PrimeBot, the friendly, super-helpful, and professional AI Live Support Assistant for PrimeShow (India's premier movie, private theatre, live concert, play, and activity booking platform).

Guidelines:
1. Answer customer queries warmly and accurately regarding tickets, showtimes, VIP recliners, IMAX 3D, snack combos, private screen rentals, and payment methods (UPI, Cards, Wallets).
2. Keep responses concise, clear, and natural (between 1 to 3 sentences).
3. Vary your language dynamically to avoid sounding repetitive or like static pre-written templates.
4. If asked about ticket cancellations, note that cancellations 2+ hours before showtime get a 75% refund.
5. Always maintain a polite, premium VIP customer service tone.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.75, // Adjust temperature for dynamic, natural, non-repetitive responses
          topP: 0.95,
          maxOutputTokens: 300
        }
      });

      if (response && response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('⚠️ Gemini 2.5 Flash request failed, trying Gemini 2.0 Flash fallback:', err.message);
      try {
        const fallbackResp = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.75,
            maxOutputTokens: 300
          }
        });
        if (fallbackResp && fallbackResp.text && fallbackResp.text.trim()) {
          return fallbackResp.text.trim();
        }
      } catch (err2) {
        console.warn('⚠️ Gemini API fallback failed:', err2.message);
      }
    }
  }

  // Dynamic Rule-Based Fallback Engine if API Key is not set or network fails
  return getFallbackSupportReply(userPrompt, context);
}

/**
 * Smart contextual fallback reply engine (ensures zero server failures)
 */
function getFallbackSupportReply(userPrompt = '', context = {}) {
  const text = userPrompt.toLowerCase();
  
  if (text.includes('cancel') || text.includes('refund')) {
    const variations = [
      "Showtime cancellations requested 2+ hours in advance receive a 75% instant refund to your original payment source!",
      "You can easily cancel your booking up to 2 hours before the movie starts for a 75% refund settlement.",
      "Refunds are processed automatically! Cancel at least 2 hours before showtime to get 75% of your ticket amount back."
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  if (text.includes('food') || text.includes('snack') || text.includes('popcorn') || text.includes('combo')) {
    const variations = [
      "You can pre-order hot popcorn, snacks, and gourmet beverages right along with your seat selection for up to 20% off!",
      "Pre-ordering concession combos with your tickets unlocks exclusive discount vouchers at the theatre snack counter.",
      "Enjoy in-seat gourmet dining! Add snacks during ticket checkout for priority service upon arrival."
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  if (text.includes('private') || text.includes('screen') || text.includes('party') || text.includes('birthday')) {
    return "Our Private Theatre experiences let you book an entire screen for up to 30 guests with custom projection, recliner seating, and catering!";
  }

  if (text.includes('upi') || text.includes('pay') || text.includes('discount') || text.includes('offer')) {
    return "We support all major payment modes including GPay, PhonePe, Paytm UPI, HDFC/ICICI NetBanking, and credit card discount vouchers!";
  }

  const generalVariations = [
    `Hello ${context.userName || 'VIP Guest'}! Thanks for contacting PrimeShow Support. Our team has received your query regarding "${userPrompt.slice(0, 30)}..." and we're here to ensure a seamless experience!`,
    `Welcome to PrimeShow VIP Support! We're processing your query now. How else can we assist with your showtime or seat selection today?`,
    `Hi there! Thank you for reaching out. We are glad to help with all your cinema, event pass, and private theatre booking questions.`
  ];
  return generalVariations[Math.floor(Math.random() * generalVariations.length)];
}

module.exports = {
  generateGeminiSupportReply,
  getFallbackSupportReply
};
