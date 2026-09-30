import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiPlatformClient } from './ai-platform.client';
import { AiCostTrackerService } from './ai-cost-tracker.service';
import { ChatMessage, ChatResponse } from './interfaces/ai-platform.interface';
import { SpotsService } from '../spots/spots.service';
import { UsersService } from '../users/users.service';

export interface ConciergeChatDto {
  messages: ChatMessage[];
  useRag?: boolean;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class AiStudyConciergeService {
  private readonly logger = new Logger(AiStudyConciergeService.name);
  private readonly applicationId: string;

  constructor(
    private readonly aiClient: AiPlatformClient,
    private readonly costTracker: AiCostTrackerService,
    private readonly spotsService: SpotsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-study-spot-finder',
    );
  }

  async chat(
    userId?: string,
    dto?: ConciergeChatDto,
  ): Promise<ChatResponse & { enrichedSpots?: any[] }> {
    const startTime = Date.now();
    const messages = dto?.messages || [];

    // Retrieve user study persona and preferences if authenticated
    let userContextPrompt = '';
    if (userId) {
      try {
        const user = await this.usersService.findById(userId);
        if (user && user.studyPreferences) {
          const pref = user.studyPreferences;
          userContextPrompt = `\n[User Profile Context]: Name: ${user.name}, Persona: ${pref.studyPersona || 'Focus Scholar'}, Preferred Noise: ${pref.preferredNoiseLevels?.join(', ') || 'Quiet'}, Preferred Categories: ${pref.preferredCategories?.join(', ') || 'Libraries, Cafes'}, Min WiFi: ${pref.minWifiSpeedMbps || 50} Mbps, Requires Outlets: ${pref.requiresOutlets ? 'Yes' : 'No'}, Favorite Drink: ${pref.favoriteDrink || 'Matcha/Coffee'}. Tailor recommendations accordingly.`;
        }
      } catch (err: any) {
        this.logger.warn(`Could not load user study preferences for AI context: ${err.message}`);
      }
    }

    // Fetch sample candidates from local DB to ground the LLM
    const candidateSpots = await this.spotsService.findAll({
      limit: 15,
      lat: dto?.latitude,
      lng: dto?.longitude,
      radiusKm: 25,
      sortBy: 'popularity',
    });

    const candidateSummary = candidateSpots.items
      .map(
        (s) =>
          `- ID: "${s._id}", Name: "${s.name}", Category: "${s.category}", City: "${s.city}", Noise: "${s.noiseLevel}", WiFi: "${s.wifiSpeed}" (${s.wifiSpeedMbps} Mbps), Outlets: "${s.outletDensity}", Rating: ${s.rating} (${s.reviewCount} reviews), Best For: "${s.bestFor}", AI Highlights: "${s.aiSummary}"`,
      )
      .join('\n');

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are "StudySphere AI", an elite, empathetic, and hyper-knowledgeable AI Study Spot Concierge.
Your mission:
1. Understand the user's specific focus needs: noise tolerance (silent vs. cafe buzz), desk comfort, power outlet availability, WiFi speed, natural light, late-night hours, and group vs solo workflow.
2. Recommend 2 to 4 ideal study spots from the verified database below or your deep domain intelligence.
3. For each recommended spot, explain *precisely* why it matches their study goals, highlight the standout amenities, and suggest the ideal study activity (e.g. Thesis Writing, Coding Sprints, Reading & Reflection, Group Presentation Prep).
4. Be enthusiastic, clear, well-structured, and provide actionable tips (e.g. best time of day to grab an outlet table, best drink pairing).${userContextPrompt}

Available Curated Spots Database:
${candidateSummary}`,
    };

    const messagesWithSystem: ChatMessage[] = [
      systemPrompt,
      ...messages.filter((m) => m.role !== 'system'),
    ];

    const response = await this.aiClient.chat({
      applicationId: this.applicationId,
      userId,
      messages: messagesWithSystem,
      useRag: dto?.useRag ?? true,
      temperature: 0.7,
      maxTokens: 1200,
      metadata: {
        totalCandidates: candidateSpots.total,
        userLocation: dto?.latitude ? `${dto.latitude},${dto.longitude}` : undefined,
      },
    });

    const duration = Date.now() - startTime;

    // Track usage telemetry
    this.costTracker.trackUsage({
      userId,
      applicationId: this.applicationId,
      promptTokens: response.usage?.promptTokens || 150,
      completionTokens: response.usage?.completionTokens || 280,
      model: response.model || 'gemini-1.5-pro',
      durationMs: duration,
    });

    // Enrich spot cards with actual DB data if matched
    let enrichedSpots: any[] = [];
    if (response.suggestedSpots && response.suggestedSpots.length > 0) {
      enrichedSpots = await Promise.all(
        response.suggestedSpots.map(async (suggested) => {
          let spotDoc: any = null;
          if (suggested.spotId) {
            spotDoc = await this.spotsService.findById(suggested.spotId).catch(() => null);
          }
          if (!spotDoc) {
            const found = candidateSpots.items.find(
              (c) =>
                c.name.toLowerCase().includes(suggested.name.toLowerCase()) ||
                suggested.name.toLowerCase().includes(c.name.toLowerCase()),
            );
            spotDoc = found || null;
          }

          return {
            ...suggested,
            spot: spotDoc,
          };
        }),
      );
    }

    return {
      ...response,
      enrichedSpots,
    };
  }

  getCostTelemetry() {
    return this.costTracker.getSummary();
  }
}
