import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export class DisposalDecisionEngine {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Run the recommendation engine
   * @param {string} category - Detected category
   * @param {string[]} detectedObjects - Objects detected
   * @param {string} condition - Item condition ("New", "Good", "Damaged", "Broken", "Unknown")
   * @returns {Promise<{primaryAction: string, alternatives: string[], reason: string, instructions: string[], environmentalImpact: {wasteAvoidedGrams: number, co2SavedKg: number, text: string}}>}
   */
  async getRecommendation(category, detectedObjects = [], condition = "Unknown") {
    // 1. Calculate deterministic decisions based on category and condition
    const decision = this.calculateDeterministicRoute(category, detectedObjects, condition);

    // 2. Generate natural-language explanations and instructions (via Gemini if available, or fall back to templates)
    let reason = decision.defaultReason;
    let instructions = decision.defaultInstructions;
    let alternatives = decision.alternatives;

    if (this.genAI) {
      try {
        const enrichedData = await this.enrichExplanationsWithLLM(
          category,
          detectedObjects,
          condition,
          decision.primaryAction
        );
        if (enrichedData) {
          reason = enrichedData.reason;
          instructions = enrichedData.instructions;
          alternatives = enrichedData.alternatives || alternatives;
        }
      } catch (err) {
        console.error("⚠️ LLM recommendation enrichment failed. Falling back to templates:", err.message);
      }
    }

    return {
      primaryAction: decision.primaryAction,
      alternatives,
      reason,
      instructions,
      environmentalImpact: decision.environmentalImpact,
    };
  }

  /**
   * Deterministic logic for waste disposal
   */
  calculateDeterministicRoute(category, detectedObjects, condition) {
    const itemName = detectedObjects[0] || category || "item";
    let primaryAction = "RECYCLE";
    let alternatives = [];
    let defaultReason = "";
    let defaultInstructions = [];
    let wasteAvoidedGrams = 200;
    let co2SavedKg = 0.25;

    // Safety-critical classifications
    if (category === "Hazardous") {
      primaryAction = "SPECIAL_HANDLING";
      alternatives = ["DISPOSE"];
      defaultReason = `${itemName} contains materials hazardous to health and the environment. Landfill disposal triggers toxic leaks or fires.`;
      defaultInstructions = [
        "Store in a cool, dry place inside a non-conductive container.",
        "Do not place in your standard household recycling or trash bins.",
        "Take to a designated local household hazardous waste (HHW) collection facility.",
      ];
      wasteAvoidedGrams = 150;
      co2SavedKg = 0.1;
    } else if (category === "E-Waste") {
      if (condition === "New" || condition === "Good") {
        primaryAction = "DONATE";
        alternatives = ["SELL", "RECYCLE"];
        defaultReason = `Your ${itemName} is in good working order. Donating extends the product life-cycle and reduces environmental extraction of metals.`;
        defaultInstructions = [
          "Format or clear any personal profile data from the electronics.",
          "Clean the exterior surface with a soft dry cloth.",
          "Drop off at a local community center, charity store, or secondary market.",
        ];
        wasteAvoidedGrams = 1500;
        co2SavedKg = 5.5;
      } else {
        primaryAction = "RECYCLE";
        alternatives = ["SPECIAL_HANDLING", "REPAIR"];
        defaultReason = `Broken or damaged electronics contain heavy metals. E-waste recycling retrieves reusable copper, gold, and glass.`;
        defaultInstructions = [
          "Remove any batteries if possible and recycle them separately under Special Handling.",
          "Place in a clear plastic bag to keep moisture out.",
          "Locate a certified local electronics drop-off location.",
        ];
        wasteAvoidedGrams = 1200;
        co2SavedKg = 3.8;
      }
    } else if (category === "Food/Organic") {
      primaryAction = "RECYCLE"; // Composting
      alternatives = ["REUSE"];
      defaultReason = "Organic items release heavy methane gases in standard landfills. Composting returns vital nutrients to agricultural soils.";
      defaultInstructions = [
        "Remove any plastic wrappers, twist-ties, or brand stickers.",
        "Place inside your green organic waste bin or home compost pile.",
        "Avoid adding synthetic oils, meats, or dairy to standard home compost.",
      ];
      wasteAvoidedGrams = 300;
      co2SavedKg = 0.45;
    } else if (category === "Plastic") {
      if (condition === "New" || condition === "Good") {
        primaryAction = "REUSE";
        alternatives = ["RECYCLE"];
        defaultReason = `Reusing clean plastic containers avoids the energy required to melt and downcycle them into new packaging.`;
        defaultInstructions = [
          "Rinse out any remaining food or product residue.",
          "Remove adhesive labels by soaking in warm soapy water.",
          "Store dry items or use for organizers, planters, or craft supplies.",
        ];
        wasteAvoidedGrams = 50;
        co2SavedKg = 0.15;
      } else {
        primaryAction = "RECYCLE";
        alternatives = ["DISPOSE"];
        defaultReason = "Plastic items can persist for hundreds of years. Recycling preserves plastic polymers for industrial downcycling.";
        defaultInstructions = [
          "Empty the container completely.",
          "Rinse briefly to avoid contaminating other paper/cardboard recyclables.",
          "Check local rules regarding whether plastic caps should be left on or removed.",
        ];
        wasteAvoidedGrams = 40;
        co2SavedKg = 0.08;
      }
    } else if (category === "Paper" || category === "Cardboard") {
      if ((condition === "New" || condition === "Good") && category === "Cardboard") {
        primaryAction = "REUSE";
        alternatives = ["RECYCLE"];
        defaultReason = "Dry cardboard boxes are highly reusable for packaging, shipping, storage, or moving house.";
        defaultInstructions = [
          "Flatten the box carefully by slicing adhesive tape strips.",
          "Store flat in a dry area to preserve structural strength.",
          "Reuse or pass along to community members needing shipping material.",
        ];
        wasteAvoidedGrams = 400;
        co2SavedKg = 0.6;
      } else {
        primaryAction = "RECYCLE";
        alternatives = ["DISPOSE"];
        defaultReason = "Cellulose fibers can be recycled multiple times to manufacture newsprint, folders, and cartons.";
        defaultInstructions = [
          "Ensure the paper/cardboard is dry. Wet paper degrades and clogs sorting screens.",
          "Flatten boxes completely to save space in bins.",
          "Ensure items heavily contaminated with food oil (like pizza boxes) are placed in composting, not paper recycling.",
        ];
        wasteAvoidedGrams = 250;
        co2SavedKg = 0.4;
      }
    } else if (category === "Glass" || category === "Metal") {
      if (condition === "New" || condition === "Good") {
        primaryAction = "REUSE";
        alternatives = ["RECYCLE"];
        defaultReason = `Glass jars and aluminum canisters are durable and do not leach chemicals, making them ideal for long-term storage.`;
        defaultInstructions = [
          "Wash thoroughly with dish soap and allow to dry completely.",
          "Label with storage content and expiry dates.",
          "Keep away from sudden temperature shocks.",
        ];
        wasteAvoidedGrams = 300;
        co2SavedKg = 0.35;
      } else {
        primaryAction = "RECYCLE";
        alternatives = ["DISPOSE"];
        defaultReason = "Glass and metal are infinitely recyclable. Melt cycles consume significantly less energy than refining raw sand or aluminum ores.";
        defaultInstructions = [
          "Rinse out food liquids.",
          "Separate metallic lids from glass containers (recycle both, but separately).",
          "Place in your blue recycling cart.",
        ];
        wasteAvoidedGrams = 200;
        co2SavedKg = 0.5;
      }
    } else if (category === "Textile") {
      if (condition === "New" || condition === "Good") {
        primaryAction = "DONATE";
        alternatives = ["SELL", "REUSE"];
        defaultReason = "Fast fashion creates enormous textile landfill volumes. Donation keeps clothes in active utility, avoiding virgin fiber agriculture.";
        defaultInstructions = [
          "Wash the textile completely.",
          "Check for tears, button losses, or zip failures.",
          "Fold neatly and drop off at local clothing donation bins.",
        ];
        wasteAvoidedGrams = 800;
        co2SavedKg = 2.5;
      } else {
        primaryAction = "RECYCLE";
        alternatives = ["REUSE", "DISPOSE"];
        defaultReason = "Worn clothes or shredded fabrics can be recycled into industrial insulation, carpet pads, or rag wipers.";
        defaultInstructions = [
          "Cut off heavy metal buttons or plastic zippers.",
          "Place in dry textile recycling collection bins.",
          "Ensure fabrics are dry and free from mold or grease.",
        ];
        wasteAvoidedGrams = 500;
        co2SavedKg = 1.2;
      }
    } else {
      // Default / Other / Unknown
      primaryAction = "DISPOSE";
      alternatives = ["RECYCLE"];
      defaultReason = `This ${itemName} cannot be reliably sorted into recyclable categories. Landfill disposal prevents sorting contamination.`;
      defaultInstructions = [
        "Place inside your standard black landfill waste container.",
        "Check with local municipal guidelines if you suspect specialized materials.",
      ];
      wasteAvoidedGrams = 100;
      co2SavedKg = 0.05;
    }

    return {
      primaryAction,
      alternatives,
      defaultReason,
      defaultInstructions,
      environmentalImpact: {
        wasteAvoidedGrams,
        co2SavedKg,
        text: `Estimated carbon offset: ~${co2SavedKg.toFixed(2)} kg CO2 equivalent by avoiding landfill production.`,
      },
    };
  }

  /**
   * Use Gemini to generate a creative reason and step instructions,
   * while keeping the primary action DETERMINED strictly by local code rules.
   */
  async enrichExplanationsWithLLM(category, detectedObjects, condition, primaryAction) {
    const itemName = detectedObjects.join(", ") || category;
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an eco-friendly waste management advisor.
      An item classified as "${itemName}" (category: ${category}) in "${condition}" condition has been mapped to the primary action: "${primaryAction}".

      Generate a friendly explanation and instructions for the user.
      Provide the response STRICTLY in the following JSON format:
      {
        "reason": "A 1-2 sentence description explaining why this action is recommended and its eco-value",
        "instructions": [
          "Step 1 to prepare/execute this action",
          "Step 2 to prepare/execute this action",
          "Step 3 to prepare/execute this action"
        ],
        "alternatives": ["alternative action 1", "alternative action 2"]
      }

      Ensure your suggestions are realistic and focus on carbon reduction. Do not add markdown backticks.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(text);
  }
}

export default new DisposalDecisionEngine();
