export interface AiChatResponse {
  text: string;
  recommendedProductIds?: string[];
  matchedRuleId?: string;
}

export async function chatAboutProducts(
  message: string, 
  chatHistory: { role: 'user' | 'model', text: string }[], 
  customInstructions?: string,
  trainingRules?: any[],
  productsList?: any[]
): Promise<AiChatResponse> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        chatHistory,
        customInstructions,
        trainingRules,
        productsList
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        return {
          text: data.text,
          recommendedProductIds: data.recommendedProductIds || [],
          matchedRuleId: data.matchedRuleId
        };
      }
    }
  } catch (error) {
    console.warn("AI service client notice:", error);
  }

  // Graceful fallback
  return {
    text: "أهلاً بكِ في «ود» 🌸 نوفر لكِ أفضل مستحضرات العناية بالبشرة وباقات النضارة والترطيب. يمكنكِ أيضاً التواصل مع فريق العناية عبر واتساب لمساعدتكِ فوراً.",
    recommendedProductIds: []
  };
}


