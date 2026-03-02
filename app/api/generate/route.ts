import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // --- THE CUSTOM TRIGGER OVERRIDE ---
    // starts the prompt with your unique trigger word so the AI wakes up your specific training!
    const finalPrompt = `TRKMNCULTURE. An authentic, photorealistic masterpiece of: ${prompt}. The scene is distinctively Turkmen, heavily featuring geometric dark red Tekke and Yomut carpet patterns, people wearing traditional fluffy white sheepskin Telpek hats, authentic silver and carnelian Turkmen jewelry, and majestic Akhal-Teke horses. Background features the Karakum desert and gleaming white marble architecture. Hyper-detailed, 8k resolution.`;

    // --- CUSTOM MODEL ---
    const output: any = await replicate.run(
        "mahri-d/turkmen-heritage:4b79364f8b5944aa690974587184824776261adc915a7c9abd5f98249d0dc00a",
        {
        input: {
          prompt: finalPrompt,
          output_format: "webp",
          output_quality: 90,
          num_outputs: 1,
          aspect_ratio: "1:1",
        }
      }
    );

    return NextResponse.json({ imageUrl: String(output[0]) });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to bake image" }, { status: 500 });
  }
}