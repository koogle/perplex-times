interface Message {
  role: string;
  content: string;
}

interface CompletionOptions {
  messages: Message[];
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
    param: string;
    code: string;
  };
}

export class Perplexity {
  private apiKey: string;
  private baseUrl: string = "https://api.perplexity.ai";
  private modelName = "llama-3.1-sonar-large-128k-online";

  constructor() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY environment variable is not set");
    }
    this.apiKey = apiKey;
  }

  async completion({ messages }: CompletionOptions): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API error response
        const errorMessage =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Type check the response
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from Perplexity API");
      }

      // Check for API-level errors
      if (data.error) {
        const errorMessage =
          typeof data.error === "string"
            ? data.error
            : data.error.message || "Unknown API error";
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!Array.isArray(data.choices) || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from Perplexity API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Perplexity API Error: ${error.message}`);
      }
      throw new Error(
        "An unexpected error occurred while calling Perplexity API"
      );
    }
  }
}
