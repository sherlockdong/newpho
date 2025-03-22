// src/app/api/weaviate/route.js

import weaviate from 'weaviate-ts-client';

export async function GET(request) {
  try {
    const client = weaviate.client({
      scheme: "https",
      host: process.env.WEAVIATE_URL.replace("https://", ""),
      apiKey: new weaviate.ApiKey(process.env.WEAVIATE_ADMIN_KEY),
    });

    // Example: fetch data from Weaviate
    const result = await client.graphql
      .get()
      .withClassName("PhysicsContent")
      .withFields(["title", "tags", "authorNote"])
      .do();

    // Return a Response object
    return new Response(JSON.stringify({ data: result.data.Get.PhysicsContent }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
