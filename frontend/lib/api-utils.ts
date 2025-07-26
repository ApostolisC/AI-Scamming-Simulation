// Example usage of the classification API
import { API_CONFIG, getAuthHeaders, createApiUrl } from "@/lib/api-config";

export async function classifyEmail(emailText: string) {
  try {
    const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.CLASSIFY), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        text: emailText
      }),
    });

    if (!response.ok) {
      throw new Error(`Classification failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      label: data.label,
      tags: data.tags,
      justification: data.justification
    };
  } catch (error) {
    console.error("Error classifying email:", error);
    throw error;
  }
}

// Example usage:
// const result = await classifyEmail("This is a suspicious email...");
// console.log(result.label, result.tags, result.justification);
