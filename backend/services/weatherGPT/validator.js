/**
 * WeatherGPT 2.0 Response Validator & Anti-Hallucination Guard
 * Inspects AI outputs before rendering to ensure data grounding,
 * factual consistency, safety bounds, and proper qualification of unverified claims.
 */

function validateResponse(response, weatherContext, intentObj) {
  let content = String(response.content || '');
  const warnings = [];
  const { operational, current } = weatherContext;

  // 1. Check for fabricated official alerts / government mandates
  const officialClaimPattern = /(official government alert|statutory evacuation order|mandated curfew|red warning declared by imd|government issued evacuation)/i;
  if (officialClaimPattern.test(content)) {
    const hasRealAlert = operational?.alerts && operational.alerts.length > 0;
    if (!hasRealAlert) {
      warnings.push('REMOVED_FABRICATED_OFFICIAL_ALERT');
      content = content.replace(
        officialClaimPattern,
        'local safety guidance (no official statutory evacuation alert is logged in active feeds)'
      );
    }
  }

  // 2. Check for fabricated road closures without verified live traffic feeds
  const roadClosurePattern = /\b(road is closed|highways are shut|all traffic stopped|flyover is closed)\b/i;
  if (roadClosurePattern.test(content)) {
    warnings.push('QUALIFIED_ROAD_CLOSURE');
    content = content.replace(
      roadClosurePattern,
      'potential localized traffic disruptions or water accumulation may occur (note: DisasterChain does not maintain live municipal road-closure feeds)'
    );
  }

  // 3. Check for fabricated lightning strikes / casualty figures
  const lightningClaimPattern = /\b(\d+\s*lightning strikes recorded|people injured by lightning)\b/i;
  if (lightningClaimPattern.test(content)) {
    warnings.push('REMOVED_FABRICATED_LIGHTNING_COUNTS');
    content = content.replace(
      lightningClaimPattern,
      'atmospheric conditions favorable for convective lightning'
    );
  }

  // 4. Ensure temperature and metrics in text don't wildly contradict context
  // If the model claims 45°C when context has 22°C:
  if (typeof current.temperature === 'number') {
    const tempMatch = content.match(/(\d{1,2}(?:\.\d)?)\s*°\s*C/);
    if (tempMatch) {
      const citedTemp = parseFloat(tempMatch[1]);
      if (Math.abs(citedTemp - current.temperature) > 15 && intentObj.primaryIntent === 'WEATHER_CURRENT') {
        warnings.push('CORRECTED_TEMPERATURE_DRIFT');
        content = content.replace(tempMatch[0], `${current.temperature}°C`);
      }
    }
  }

  // 5. Ensure location presence in conversational responses
  if (weatherContext.locationName && !content.includes(weatherContext.locationName)) {
    // Non-blocking, but can prepend or annotate
  }

  // 6. Ensure emergency disclaimer on high-risk intents
  if (intentObj.isEmergency && !content.includes('112')) {
    content = `⚠️ **Emergency Notice**: Call national emergency services (**112**) or local rescue teams immediately if in danger.\n\n` + content;
  }

  // 7. Section 3: Time-Binding & Forecast Context Integrity
  // If the user's inquiry asks about a future forecast time window (e.g., TOMORROW):
  // Enforce that responses do not substitute current weather or say "today"
  const requestedScope = intentObj?.timeScope || 'CURRENT';
  if (requestedScope === 'TOMORROW') {
    // Automatically correct phrasing drift
    content = content.replace(/\b(umbrella|jacket|coat|raincoat|poncho)\s+today\b/gi, '$1 tomorrow');
    content = content.replace(/\b(carry|bring)\s+an\s+umbrella\s+today\b/gi, '$1 an umbrella tomorrow');
    content = content.replace(/\btraveling\s+today\b/gi, 'traveling tomorrow');
    content = content.replace(/\boutdoors?\s+today\b/gi, 'outdoors tomorrow');
    content = content.replace(/\bcommute\s+today\b/gi, 'commute tomorrow');

    // If an external LLM attempts to answer with ONLY current conditions and ignores tomorrow:
    const startsWithCurrent = /^(right now|currently|current conditions?|at present)\b/i.test(content.trim());
    const lacksTomorrow = !/\btomorrow\b/i.test(content);
    if (startsWithCurrent && lacksTomorrow) {
      warnings.push('REJECTED_CURRENT_SUBSTITUTION_FOR_FORECAST');
      return {
        ...response,
        content,
        needsFallback: true,
        validation: {
          isValid: false,
          warnings,
          reason: 'Attempted to substitute current weather for tomorrow forecast query',
          checkedAt: new Date().toISOString(),
        },
      };
    }
  }

  return {
    ...response,
    content,
    validation: {
      isValid: true,
      warnings,
      checkedAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  validateResponse,
};
