from ddgs import DDGS
import time


def web_search(query, max_results=5):
    """
    General-purpose web search for PRIME.

    Searches the web for any topic and returns
    structured results.
    """

    results = []

    try:

        with DDGS() as ddgs:

            search_results = ddgs.text(
                query,
                max_results=max_results
            )

            for result in search_results:

                title = result.get("title", "").strip()
                url = result.get("href", "").strip()
                snippet = result.get("body", "").strip()

                if not title and not snippet:
                    continue

                results.append({
                    "title": title,
                    "url": url,
                    "snippet": snippet
                })

    except Exception as error:

        print(f"Web search error: {error}")

    return results


def research_topic(topic, max_results_per_query=5):
    """
    Performs general-purpose multi-query research.

    PRIME can use this for football, technology,
    science, history, business, politics, education,
    current events, products, or any other topic.
    """

    topic = topic.strip()

    if not topic:
        return []

    # Multiple search styles make the research
    # more reliable than relying on one query.
    queries = [
        topic,
        f"{topic} latest news",
        f"{topic} facts information",
        f"{topic} detailed analysis",
    ]

    all_results = []
    seen_urls = set()

    for query in queries:

        print(f"🔍 Search: {query}")

        try:

            results = web_search(
                query,
                max_results=max_results_per_query
            )

            for result in results:

                url = result.get("url", "")

                # Avoid duplicate sources.
                if url and url in seen_urls:
                    continue

                if url:
                    seen_urls.add(url)

                all_results.append(result)

        except Exception as error:

            print(
                f"⚠️ Search failed for '{query}': {error}"
            )

        # Small pause between searches.
        time.sleep(0.3)

    return all_results