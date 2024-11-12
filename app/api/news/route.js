import axios from 'axios';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    console.log("Query parameter is missing");
    return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
      status: 400,
    });
  }

  try {
    console.log("Fetching articles from News API...");
    const newsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: query,
        apiKey: process.env.NEWS_API_KEY,
        language: 'en',
        pageSize: 5,
      },
    });

    console.log("News API response:", newsResponse.data);

    const articles = newsResponse.data.articles;
    if (!articles || articles.length === 0) {
      console.log("No articles found from News API.");
      return new Response(JSON.stringify({ error: 'No articles found' }), {
        status: 404,
      });
    }

    console.log("Summarizing articles with Hugging Face API...");
    const summarizedArticles = await Promise.all(
      articles.map(async (article, index) => {
        try {
          const summaryResponse = await axios.post(
            'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
            {
              inputs: article.description,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );

          console.log(`Hugging Face summary response for article ${index + 1}:`, summaryResponse.data);

          return {
            title: article.title,
            url: article.url,
            image: article.urlToImage,
            summary: summaryResponse.data[0].summary_text.trim(),
          };
        } catch (err) {
          console.error(`Error summarizing article ${index + 1}:`, err);
          throw new Error(`Summarization failed for article ${index + 1}`);
        }
      })
    );

    return new Response(JSON.stringify({ articles: summarizedArticles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Internal server error:", error.message || error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
