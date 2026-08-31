import { GoogleGenAI } from '@google/genai';

/**
 * PrimeShow Gemini AI Support Assistant Module
 * Uses Google Gemini API (@google/genai) to generate natural, dynamic,
 * non-repetitive support replies for Live Support Chat & WhatsApp AI Bot.
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

const SYSTEM_INSTRUCTION = `You are PrimeBot, the intelligent customer support assistant for PrimeShow - India's Ultra Luxury Cinema & Event Booking Platform.

YOUR RULES:
1. Language Awareness: ALWAYS detect the user's language (Gujarati, Hindi, English, Gujarati-English mix) and respond naturally in the EXACT same language and script used by the user.
2. Context Awareness: You handle queries about Movie Bookings, Theatre Shows, Event Tickets, Screen Formats (IMAX 3D, Dolby Atmos), Seat Availability, VIP Recliners, Cancellation/Refunds, and Payment Issues.
3. Dynamic Responses: Avoid copy-pasting standard text. Provide helpful, conversational, and direct answers specific to PrimeShow.
4. Admin Handover: If a query requires personal account changes, refund processing, or direct human intervention, state politely that the PrimeShow Admin will respond shortly when online.`;

/**
 * Helper to build contents array with optional conversation history (last 5-10 messages)
 */
function buildGeminiContents(userPrompt, history = []) {
  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    // Keep last 10 messages max
    const recentHistory = history.slice(-10);
    recentHistory.forEach(item => {
      if (item && (item.message || item.text || item.content)) {
        const msgText = item.message || item.text || item.content;
        contents.push({
          role: 'user',
          parts: [{ text: String(msgText) }]
        });
      }
      if (item && item.reply) {
        // Strip 🤖 [AI Assistant]: prefix if present
        const cleanReply = String(item.reply).replace(/^🤖\s*\[.*?\]:\s*/, '');
        contents.push({
          role: 'model',
          parts: [{ text: cleanReply }]
        });
      }
    });
  }

  // Append current user prompt
  contents.push({
    role: 'user',
    parts: [{ text: String(userPrompt) }]
  });

  return contents;
}

/**
 * Generates dynamic, natural support response using Gemini 2.5/2.0 Flash model.
 * Includes fallbacks if API Key is missing or rate limited.
 */
async function generateGeminiSupportReply(userPrompt, context = {}) {
  const ai = getGeminiClient();
  const history = context.history || context.previousMessages || [];
  const contents = buildGeminiContents(userPrompt, history);

  const generationConfig = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.7, // Increases answer variety & reduces repetitive loops
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 350
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: generationConfig
      });

      if (response && response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('⚠️ Gemini 2.5 Flash request failed, trying Gemini 2.0 Flash fallback:', err.message);
      try {
        const fallbackResp = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: contents,
          config: generationConfig
        });
        if (fallbackResp && fallbackResp.text && fallbackResp.text.trim()) {
          return fallbackResp.text.trim();
        }
      } catch (err2) {
        console.warn('⚠️ Gemini API fallback failed:', err2.message);
      }
    }
  }

  // Dynamic Multilingual Rule-Based Fallback Engine if API Key is not set or network fails
  return getFallbackSupportReply(userPrompt, context);
}

/**
 * Smart multilingual contextual fallback reply engine (ensures zero server failures)
 */
function getFallbackSupportReply(userPrompt = '', context = {}) {
  const text = String(userPrompt).trim();
  const lowerText = text.toLowerCase();

  const isGujarati = /[\u0A80-\u0AFF]/.test(text) || lowerText.includes('kem chho') || lowerText.includes('kem cho') || lowerText.includes('su chhe') || lowerText.includes('mate');
  const isHindi = /[\u0900-\u097F]/.test(text) || lowerText.includes('kaise') || lowerText.includes('kare') || lowerText.includes('chahiye');

  // 1. GUJARATI LANGUAGE RESPONSES
  if (isGujarati) {
    if (lowerText.includes('બુક') || lowerText.includes('ટિકિટ') || lowerText.includes('મુવી') || lowerText.includes('સીટ') || lowerText.includes('કઈ રીતે') || lowerText.includes('રીતે')) {
      const gujBookingVariations = [
        "નમસ્તે! પ્રાઇમશો (PrimeShow) પર ટિકિટ બુક કરવા માટે તમારી મનપસંદ મુવી કે ઇવેન્ટ સિલેક્ટ કરો, શો ટાઇમ અને VIP સીટ પસંદ કરો અને UPI વડે ત્વરિત ચૂકવણી કરો!",
        "હેલો! PrimeShow પર બુકિંગ કરવું ખૂબ જ સરળ છે. હોમપેજ અથવા Events ટેબ પર જઈને ડાયરેક્ટ શો સેગમેન્ટ પસંદ કરીને તમારી ટિકિટ્સ કન્ફર્મ કરી શકો છો."
      ];
      return gujBookingVariations[Math.floor(Math.random() * gujBookingVariations.length)];
    }

    if (lowerText.includes('કેન્સલ') || lowerText.includes('રીફંડ') || lowerText.includes('પાછા')) {
      return "શો શરૂ થવાના 2 કલાક પહેલા ટિકિટ કેન્સલ કરવાથી 75% ઇન્સ્ટન્ટ રીફંડ મળી જાય છે. વધુ મદદ કે એકાઉન્ટ ચેન્જ માટે પ્રાઇમશો એડમિન ઓનલાઇન થતાં જ તમારો સંપર્ક કરશે.";
    }

    return `નમસ્તે ${context.userName || 'ગ્રાહક'}! પ્રાઇમશો (PrimeShow) વીઆઇપી સપોર્ટમાં તમારું સ્વાગત છે. મુવી ટિકિટ, થિયેટર શો, IMAX 3D અને ઇવેન્ટ્સ સંબંધિત મદદ માટે અમે હાજર છીએ.`;
  }

  // 2. HINDI LANGUAGE RESPONSES
  if (isHindi) {
    if (lowerText.includes('बुक') || lowerText.includes('टिकट') || lowerText.includes('मूवी') || lowerText.includes('सीट') || lowerText.includes('कैसे')) {
      return "नमस्ते! PrimeShow पर टिकट बुक करने के लिए अपनी मनपसंद मूवी या इवेंट चुनें, शो टाइमिंग और VIP सीट सेलेक्ट करें और UPI से तुरंत पेमेंट करें!";
    }

    if (lowerText.includes('कैंसल') || lowerText.includes('रिफंड')) {
      return "शो टाइम से 2 घंटे पहले टिकट कैंसिल करने पर 75% इंस्टेंट रिफंड मिलता है। अकाउंट संबंधित सहायता के लिए PrimeShow एडमिन जल्द ही ऑनलाइन आपसे कनेक्ट करेंगे।";
    }

    return `नमस्ते ${context.userName || 'ग्राहक'}! PrimeShow VIP सपोर्ट में आपका स्वागत है। मूवी बुकिंग, IMAX 3D, और इवेंट पास से जुड़ी किसी भी सहायता के लिए हम तैयार हैं।`;
  }

  // 3. ENGLISH / HINGLISH RESPONSES
  if (lowerText.includes('cancel') || lowerText.includes('refund')) {
    const variations = [
      "Showtime cancellations requested 2+ hours in advance receive a 75% instant refund to your original payment source! For personal account changes, the PrimeShow Admin will assist shortly.",
      "You can easily cancel your booking up to 2 hours before the movie starts for a 75% refund settlement. If you need direct human intervention, the PrimeShow Admin will respond when online."
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  if (lowerText.includes('book') || lowerText.includes('ticket') || lowerText.includes('seat') || lowerText.includes('imax') || lowerText.includes('show')) {
    const variations = [
      "To book tickets on PrimeShow, select your movie or event, choose your preferred showtime and seats (IMAX 3D, Dolby Atmos, VIP Recliners), and pay instantly via UPI, Cards, or NetBanking!",
      "Booking on PrimeShow is quick and easy! Explore our Movies or Events tabs, choose your city, select your seats, and complete your reservation via UPI or NetBanking."
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  if (lowerText.includes('food') || lowerText.includes('snack') || lowerText.includes('popcorn') || lowerText.includes('combo')) {
    return "You can pre-order hot popcorn, snacks, and gourmet beverages right along with your seat selection for up to 20% off!";
  }

  if (lowerText.includes('private') || lowerText.includes('party') || lowerText.includes('birthday')) {
    return "Our Private Theatre experiences let you book an entire screen for up to 30 guests with custom projection, recliner seating, and catering!";
  }

  const generalVariations = [
    `Hello ${context.userName || 'VIP Guest'}! Welcome to PrimeShow Support. How can I assist you with your movie, event pass, or theatre showtimes today?`,
    `Hi there! I am PrimeBot, your assistant for PrimeShow. Feel free to ask about showtimes, VIP seats, IMAX 3D, or event tickets!`,
    `Welcome to PrimeShow VIP Support! We're glad to help with all your cinema, event pass, and private theatre booking questions.`
  ];
  return generalVariations[Math.floor(Math.random() * generalVariations.length)];
}

export {
  generateGeminiSupportReply,
  getFallbackSupportReply
};

export default {
  generateGeminiSupportReply,
  getFallbackSupportReply
};
