"use client";
import { useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) {
      alert("Please enter a search term!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/news?query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setArticles(data.articles); // Set the articles including summaries
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">News Summariser</h1>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter a search term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 rounded-lg text-gray-900 text-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={handleSearch}
          className={`px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {articles.length > 0 && (
        <div className="w-full max-w-4xl bg-black bg-opacity-10 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Summarized Articles</h2>
          <div>
            {articles.map((article, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-xl font-bold">{article.title}</h3>
                {article.image && <img src={article.image} alt={article.title} className="w-full h-auto my-4" />}
                <p>{article.summary}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                  Read full article
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
