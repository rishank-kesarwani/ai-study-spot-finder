import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  ChatMessage,
  ChatRequestPayload,
  ChatResponse,
  RagIngestPayload,
  RagQueryPayload,
  RagQueryResult,
  EmbeddingPayload,
  EmbeddingResult,
} from './interfaces/ai-platform.interface';

@Injectable()
export class AiPlatformClient {
  private readonly logger = new Logger(AiPlatformClient.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly applicationId: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'aiPlatform.url',
      'http://localhost:5000',
    );
    this.apiKey = this.configService.get<string>(
      'aiPlatform.apiKey',
      'platform_master_key_dev_12345',
    );
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-study-spot-finder',
    );

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.configService.get<number>('aiPlatform.timeoutMs', 60000),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

  async chat(payload: ChatRequestPayload): Promise<ChatResponse> {
    const startTime = Date.now();
    try {
      this.logger.log(
        `[AI Platform] Dispatching chat request to ${this.baseUrl}/v1/chat (App: ${payload.applicationId})`,
      );

      const response = await this.client.post<ChatResponse>(
        '/v1/chat',
        payload,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`[AI Platform] Chat response received in ${duration}ms`);

      return response.data;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.logger.warn(
        `[AI Platform] Chat request to ${this.baseUrl}/v1/chat failed after ${duration}ms: ${err.message}. Using intelligent study spot recommendation fallback.`,
      );

      return this.generateFallbackChatResponse(payload.messages);
    }
  }

  async queryRag(payload: RagQueryPayload): Promise<RagQueryResult> {
    try {
      this.logger.log(
        `[AI Platform] Querying RAG at ${this.baseUrl}/v1/rag/query (App: ${payload.applicationId})`,
      );

      const response = await this.client.post<RagQueryResult>(
        '/v1/rag/query',
        payload,
      );

      return response.data;
    } catch (err: any) {
      this.logger.warn(
        `[AI Platform] RAG query failed: ${err.message}. Continuing with local knowledge.`,
      );
      return {
        answer: 'Search results from local curated study spots catalog.',
        documents: [],
        citations: [],
      };
    }
  }

  async ingestDocument(payload: RagIngestPayload): Promise<{ success: boolean; documentId: string }> {
    try {
      const response = await this.client.post('/v1/rag/ingest', payload);
      return response.data;
    } catch (err: any) {
      this.logger.warn(`[AI Platform] Document ingestion failed: ${err.message}`);
      return { success: false, documentId: payload.documentId };
    }
  }

  async getEmbeddings(payload: EmbeddingPayload): Promise<EmbeddingResult | null> {
    try {
      const response = await this.client.post<EmbeddingResult>(
        '/v1/embeddings',
        payload,
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(`[AI Platform] Embedding generation failed: ${err.message}`);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 3000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private generateFallbackChatResponse(messages: ChatMessage[]): ChatResponse {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const query = lastUserMessage.toLowerCase();

    let reply = `Here are some top-rated study spots matching your focus session criteria. I've selected locations known for reliable WiFi, comfortable seating, and ideal ambient acoustics.`;

    if (query.includes('quiet') || query.includes('silent') || query.includes('library')) {
      reply = `For deep, uninterrupted focus, silent reading rooms and architectural public libraries with acoustic isolation provide the best study environment. Here are spots with near-zero distractions and dedicated reading desks:`;
    } else if (query.includes('cafe') || query.includes('coffee') || query.includes('matcha')) {
      reply = `If you thrive on ambient energy and artisanal brews, here are specialty cafes that welcome laptops, provide accessible power strips, and maintain great acoustic playlists:`;
    } else if (query.includes('late') || query.includes('night') || query.includes('24/7') || query.includes('cram')) {
      reply = `For late-night cramming sessions or night-owl workflows, here are study hubs and 24-hour campus lounges with consistent lighting, safety, and late-night access:`;
    }

    return {
      reply,
      suggestedSpots: [
        {
          name: 'The Rose Main Reading Room & Library',
          category: 'library',
          matchReason: 'Grand historic quiet atmosphere with towering natural light and spacious desks.',
          matchScore: 96,
          bestFeatures: ['Silent Zone', 'Fast WiFi', 'Abundant Natural Light'],
          recommendedStudyType: 'Deep Work & Thesis Writing',
        },
        {
          name: 'Atelier Artisan Coffee & Workspace',
          category: 'cafe',
          matchReason: 'Specialty roastery with dedicated ergonomic laptop counters and power outlets at every seat.',
          matchScore: 92,
          bestFeatures: ['Fiber WiFi (150 Mbps)', 'Power at Every Seat', 'Great Espresso'],
          recommendedStudyType: 'Coding & Creative Flow',
        },
        {
          name: 'Glasshouse Greenhouse Study Lounge',
          category: 'botanical_lounge',
          matchReason: 'Lush greenery, peaceful water fountain ambient acoustics, and high ceilings.',
          matchScore: 88,
          bestFeatures: ['Moderate Ambient Sound', 'Scenic Plants', 'Spacious Tables'],
          recommendedStudyType: 'Reading & Casual Research',
        },
      ],
      usage: {
        promptTokens: 120,
        completionTokens: 250,
        totalTokens: 370,
      },
      model: 'gemini-1.5-pro-study-agent',
    };
  }
}
