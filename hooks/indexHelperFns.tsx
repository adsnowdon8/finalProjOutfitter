import { compatibilityFlags } from "react-native-screens";
import { ClothingItem, EmbeddedItem, ForecastHour } from "./types";
import * as FileSystem from "expo-file-system";

export const itemToText = (item: ClothingItem) =>
  `${item.name} is in the ${item.category} category, suitable for ${
    item.temperatureRange[0]
  }–${item.temperatureRange[1]}°F. ${item.description ?? ""}`;

const embed = async (text: string) => {
  const res = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: {
        Authorization: "[HF API KEY]",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  const embedding = await res.json();
  return embedding;
};

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

export const getTopSimilarItems = (
  queryEmbedding: number[],
  items: EmbeddedItem[],
  k: number
) => {
  return items
    .map((item) => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
};

const generatePrompt = async ({
  retrievedItems,
  query,
  weather,
}: {
  retrievedItems: EmbeddedItem[];
  query: string;
  weather: string;
  //   { forecastHours: ForecastHour[] };
}) => {
  //  ${JSON.stringify(weather.forecastHours.slice(0, 3))}
  console.log("weather", JSON.stringify(weather, null, 2));

  const prompt = `
  You're an assistant.

  This is the users activity: "${query}"

  The weather: ${JSON.stringify(weather, null, 2)}
 ${
   retrievedItems.length > 0
     ? ` The following is a few items from my closet:
 ${retrievedItems.map((item) => `- ${itemToText(item)}`).join("\n")}.`
     : ""
 }
  
  Give me 3 sentences with no intro, on how to dress comfortably using items from my closet if convenient. Also list out the items you used after the special character '***'.`;
  return prompt;
};

const askGpt = async (prompt: string) => {
  const API_KEY = "[ENTER API KEY FOR GEMINI]";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  return reply || "No response";
};

export async function ragClothing({
  query,
  embeddedItems,
  weather,
  save = false,
  saveName = "B1",
}: {
  query: string;
  embeddedItems: EmbeddedItem[];
  weather: string;
  save?: boolean;
  saveName?: "B1" | "B2";
}): Promise<string> {
  // const queryEmbedding = await embed(query);
  // console.log("queryEmbedding", queryEmbedding);
  // console.log("embeddedItems", embeddedItems);
  // const topItems = getTopSimilarItems(queryEmbedding, embeddedItems, 5);
  // console.log("topItems", topItems);
  // # TODO confirm that this doesnt affect things too much, Test response
  const prompt = await generatePrompt({
    retrievedItems: embeddedItems,
    query,
    weather,
  });
  // console.log("prompt", prompt);
  // TODO send to flask server to save (if user asks to)
  if (save) {
    console.log("saving");
    const url = `https://adsnowdon8.pythonanywhere.com/set/${saveName}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ value: prompt }),
    })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .catch((err) => console.log(err));
    // const data = await res.json();
    // console.log("data", data);
    return res.json();
  }

  return await askGpt(prompt);
}

export const getEventTime = (pointInTime: string) => {
  const curTime = new Date().getTime();
  const case_map: Record<string, number> = {
    now: 0,
    "in 15 minutes": 15,
    "in 30 minutes": 30,
    "in 45 minutes": 45,
    "in 1 hour": 60,
    "in 2 hours": 120,
    "in 3 hours": 180,
  };

  const minutesToAdd = case_map[pointInTime];
  const timeOfEvent = curTime + (minutesToAdd ?? 0) * 60 * 1000;

  const timeOfEventDate = new Date(timeOfEvent);
  return timeOfEventDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const fileExists = async (fileUri: string | undefined) => {
  try {
    if (!fileUri) return false;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch (error) {
    console.error("Error checking file existence:", error);
    return false;
  }
};
