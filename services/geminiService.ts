
import { GoogleGenAI, Type } from "@google/genai";
import { BehaviorMetrics, UXAnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    structuralAnalysis: { type: Type.STRING, description: 'Analysis of the website structure, navigation patterns, and discovered pages.' },
    visualAnalysis: { type: Type.STRING, description: 'Analysis of UI/UX visual elements and layout efficiency.' },
    behavioralAnalysis: { type: Type.STRING, description: 'Interpretation of user behavior based on GA4 data and search benchmarks.' },
    overallScore: { type: Type.NUMBER, description: 'A UX efficiency score out of 100.' },
    diagnosticAgent: {
      type: Type.OBJECT,
      properties: {
        agentName: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.ARRAY, items: { type: Type.STRING } },
        severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
      },
      required: ['agentName', 'title', 'content', 'severity']
    },
    validationAgent: {
      type: Type.OBJECT,
      properties: {
        agentName: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.ARRAY, items: { type: Type.STRING } },
        severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
      },
      required: ['agentName', 'title', 'content', 'severity']
    },
    solutionAgent: {
      type: Type.OBJECT,
      properties: {
        agentName: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.ARRAY, items: { type: Type.STRING } },
        severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
      },
      required: ['agentName', 'title', 'content', 'severity']
    },
    technicalAgent: {
      type: Type.OBJECT,
      properties: {
        agentName: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.ARRAY, items: { type: Type.STRING } },
        severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
      },
      required: ['agentName', 'title', 'content', 'severity']
    },
    abTests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          recommendation: { type: Type.STRING },
          variantA: { type: Type.STRING },
          variantB: { type: Type.STRING },
          metricToTrack: { type: Type.STRING }
        },
        required: ['recommendation', 'variantA', 'variantB', 'metricToTrack']
      }
    }
  },
  required: ['structuralAnalysis', 'visualAnalysis', 'behavioralAnalysis', 'overallScore', 'diagnosticAgent', 'validationAgent', 'solutionAgent', 'technicalAgent', 'abTests'],
  propertyOrdering: ['overallScore', 'structuralAnalysis', 'visualAnalysis', 'behavioralAnalysis', 'diagnosticAgent', 'validationAgent', 'solutionAgent', 'technicalAgent', 'abTests']
};

export async function performUXAnalysis(
  url: string,
  screenshotBase64: string | null,
  metrics: BehaviorMetrics
): Promise<UXAnalysisResponse> {
  const prompt = `You are a World-Class UX & Analytics Swarm. 
    Task: Audit URL: ${url}. 
    
    1. AUTOMATED CRAWL: Use Google Search to find the sitemap, common pages, and public performance benchmarks (SimilarWeb estimates, Core Web Vitals) for this domain. 
    2. GA4 SYNC: Metrics provided (from Property ${metrics.ga4PropertyId || 'Direct Input'}):
       - CTR: ${metrics.ctr}%
       - Bounce Rate: ${metrics.bounceRate}%
       - Session Duration: ${metrics.sessionDuration}s
       - Scroll Depth: ${metrics.scrollDepth}%
       - Page Views: ${metrics.pageViews}
    
    Depth Level: ${metrics.crawlingDepth}.
    
    Workflow:
    - Diagnostic: Identify friction based on GA4 data vs. discovered structure.
    - Solution: Suggest layout redesigns to improve specific metrics.
    - Experiments: Generate A/B test variants.
    
    Always include a list of your grounding sources in the structural analysis.`;

  const parts: any[] = [{ text: prompt }];

  if (screenshotBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: screenshotBase64.split(',')[1] || screenshotBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  try {
    const textResult = response.text || "{}";
    const data = JSON.parse(textResult);
    
    // Extract grounding URLs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks.map((c: any) => c.web?.uri).filter(Boolean);
    
    return { ...data, groundingLinks: links };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Analysis failed. Check your API configuration.");
  }
}
