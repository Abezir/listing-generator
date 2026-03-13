import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional:
    "Write in a clean, factual, trustworthy tone. Lead with the most compelling feature. Be direct and informative. Avoid excessive superlatives.",
  warm: "Write in a warm, inviting, lifestyle-focused tone. Help the reader picture themselves living there. Use sensory language and emotional hooks. Paint a picture of everyday life in this home.",
  luxury:
    "Write in a premium, aspirational tone suited for high-end buyers. Use elevated vocabulary. Emphasize exclusivity, craftsmanship, and lifestyle. Every detail should feel intentional and refined.",
};

const EXAMPLE_LISTING = `Take a look at this impeccable two-story Colonial, situated on a quiet dead-end street and designed to impress at every turn. Offering over 5,000 square feet of beautifully finished living space, this exceptional home seamlessly blends timeless elegance with everyday comfort.

The home features four generously sized bedrooms, all conveniently located on one level, along with the laundry, providing both functionality and privacy. The spacious primary suite includes his-and-hers walk-in closets, creating a true retreat. A large bonus room offers incredible flexibility, while the dedicated main-floor office makes working from home effortless.

Step outside to enjoy exceptional outdoor living, including a large composite deck, outdoor patio, and fire pit, and beautifully landscaped yard — perfect for entertaining guests or relaxing evenings under the stars.

An oversized two-car garage with a convenient bump-out provides direct basement access, adding valuable functionality and storage options. Adding even more value and peace of mind, the home features a newer roof, updated furnaces and A/C, a recently replaced driveway, and newer appliances, offering modern efficiency and reducing future maintenance concerns.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const address = formData.get("address") as string;
    const price = formData.get("price") as string;
    const sqft = formData.get("sqft") as string;
    const bedrooms = formData.get("bedrooms") as string;
    const bathrooms = formData.get("bathrooms") as string;
    const halfBaths = formData.get("halfBaths") as string;
    const garageStalls = formData.get("garageStalls") as string;
    const garageSqft = formData.get("garageSqft") as string;
    const lotSqft = formData.get("lotSqft") as string;
    const appliances = formData.get("appliances") as string;
    const constructionMaterials = formData.get("constructionMaterials") as string;
    const roofAge = formData.get("roofAge") as string;
    const sellerFinancing = formData.get("sellerFinancing") as string;
    const citySewerWater = formData.get("citySewerWater") as string;
    const propertyType = formData.get("propertyType") as string;
    const additionalNotes = formData.get("additionalNotes") as string;
    const tone = (formData.get("tone") as string) || "warm";

    const photos = formData.getAll("photos") as File[];

    // Convert photos to base64 image blocks (max 10)
    const imageBlocks: Anthropic.ImageBlockParam[] = await Promise.all(
      photos.slice(0, 10).map(async (photo) => {
        const buffer = await photo.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mediaType = (
          photo.type && photo.type.startsWith("image/")
            ? photo.type
            : "image/jpeg"
        ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        return {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data: base64,
          },
        };
      })
    );

    // Build property details
    const details: string[] = [];
    if (address) details.push(`Address: ${address}`);
    if (price) details.push(`Price: ${price}`);
    if (sqft) details.push(`Living Space: ${sqft} sq ft`);
    if (bedrooms) details.push(`Bedrooms: ${bedrooms}`);
    if (bathrooms) details.push(`Full Bathrooms: ${bathrooms}`);
    if (halfBaths) details.push(`Half Bathrooms: ${halfBaths}`);
    if (garageStalls) details.push(`Garage Stalls: ${garageStalls}`);
    if (garageSqft) details.push(`Garage Sq Ft: ${garageSqft}`);
    if (lotSqft) details.push(`Lot Size: ${lotSqft} sq ft`);
    if (appliances) details.push(`Included Appliances: ${appliances}`);
    if (constructionMaterials) details.push(`Construction/Materials: ${constructionMaterials}`);
    if (roofAge) details.push(`Roof Age: ${roofAge}`);
    if (sellerFinancing) details.push(`Financing/Terms: ${sellerFinancing}`);
    if (citySewerWater) details.push(`City Sewer & Water: ${citySewerWater}`);
    if (propertyType) details.push(`Property Type: ${propertyType}`);
    if (additionalNotes) details.push(`Additional Highlights: ${additionalNotes}`);

    const propertyDetailsText = details.join("\n");
    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.warm;

    const systemPrompt = `You are an expert real estate copywriter specializing in MLS listing descriptions for Northstar MLS.

Your job is to write compelling, polished property descriptions that help homes sell.

STYLE GUIDE — match this quality and structure:
${EXAMPLE_LISTING}

RULES:
- Stay under 2,000 characters total (STRICT — count carefully)
- Start with a strong hook — not the address
- Weave in emotional lifestyle language, not just specs
- Don't list facts robotically — tell a story
- Highlight standout features prominently
- End with a value/peace-of-mind statement when updates exist
- Do NOT include the address, price, or raw spec numbers in your output (those live in dedicated MLS fields)
- Output ONLY the listing description — no intro text, no labels, no explanations`;

    const userPrompt = `${toneInstruction}

PROPERTY DETAILS:
${propertyDetailsText}

${photos.length > 0 ? `I've also attached ${photos.length} property photo(s). Use what you can see in them to add specific, accurate detail to the listing.` : ""}

Write the MLS listing description now. Under 2,000 characters. Make it compelling.`;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const contentBlocks: Anthropic.MessageParam["content"] = [
      ...imageBlocks,
      { type: "text", text: userPrompt },
    ];

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ listing: text.trim() });
  } catch (err: unknown) {
    console.error("Generation error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
