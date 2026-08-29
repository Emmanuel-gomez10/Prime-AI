import re
import requests

from tools.pdf_tool import create_pdf
from tools.drive_tool import upload_file
from tools.web_search_tool import web_search


# ============================================================
# PRIME CONFIGURATION
# ============================================================

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3.2:1b"

# The API test showed that Ollama responds correctly.
# Keep the timeout high enough for the local CPU model,
# but lower than the old 90-second setting.
OLLAMA_TIMEOUT = 60

# Keep normal answers short and fast.
NORMAL_MAX_TOKENS = 60

# Research answers need more room, but we do not want
# to overload the small 1B model.
RESEARCH_MAX_TOKENS = 150

# Research limits.
MAX_RESEARCH_SOURCES = 5
MAX_SNIPPET_LENGTH = 300


# ============================================================
# PDF INTENT
# ============================================================

def wants_pdf(message):
    text = message.lower().strip()

    patterns = [
        r"\bcreate\b.*\bpdf\b",
        r"\bmake\b.*\bpdf\b",
        r"\bgenerate\b.*\bpdf\b",
        r"\bsave\b.*\bpdf\b",
        r"\bexport\b.*\bpdf\b",
        r"\bconvert\b.*\bpdf\b",
        r"\bturn\b.*\bpdf\b",
        r"\bdownload\b.*\bpdf\b",
        r"\bput\b.*\bpdf\b",
    ]

    return any(
        re.search(pattern, text)
        for pattern in patterns
    )


# ============================================================
# GOOGLE DRIVE INTENT
# ============================================================

def wants_drive(message):
    text = message.lower().strip()

    patterns = [
        r"\bgoogle drive\b",
        r"\bupload\b.*\bdrive\b",
        r"\bsave\b.*\bdrive\b",
        r"\bput\b.*\bdrive\b",
    ]

    return any(
        re.search(pattern, text)
        for pattern in patterns
    )


# ============================================================
# RESEARCH INTENT
# ============================================================

def needs_research(message):
    text = message.lower().strip()

    research_patterns = [
        r"\bresearch\b",
        r"\bdeep research\b",
        r"\bdeeply research\b",
        r"\binvestigate\b",
        r"\banalyze\b.*\bcurrent\b",
        r"\blatest\b",
        r"\bcurrent\b.*\bnews\b",
        r"\bnews\b",
        r"\btoday\b",
        r"\btoday's\b",
        r"\bthis week\b",
        r"\brecent\b",
        r"\bup[- ]to[- ]date\b",
        r"\bdevelopments\b",
        r"\bresults today\b",
        r"\blatest results\b",
        r"\bcurrent results\b",
        r"\bwhat happened today\b",
    ]

    return any(
        re.search(pattern, text)
        for pattern in research_patterns
    )


# ============================================================
# RESEARCH TOPIC CLEANING
# ============================================================


def extract_research_topic(message):
    """
    Extract the actual subject the user wants PRIME to research.

    This function removes application commands such as:
    - research
    - create a PDF
    - make a report
    - upload to Google Drive
    - about it
    - and about it

    It intentionally does NOT modify the research,
    PDF, Drive, or Ollama pipeline.
    """

    topic = message.strip()

    # --------------------------------------------------------
    # Remove Google Drive instructions
    # --------------------------------------------------------

    topic = re.sub(
        r"\s+and\s+upload\s+(it\s+)?to\s+google\s+drive\b.*$",
        "",
        topic,
        flags=re.IGNORECASE
    )

    topic = re.sub(
        r"\s+upload\s+(it\s+)?to\s+google\s+drive\b.*$",
        "",
        topic,
        flags=re.IGNORECASE
    )

    topic = re.sub(
        r"\s+to\s+google\s+drive\b.*$",
        "",
        topic,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Remove PDF/report commands
    # --------------------------------------------------------

    topic = re.sub(
        r"\s+and\s+(create|make|generate|save|export)\s+(a\s+)?(pdf|report)\b.*$",
        "",
        topic,
        flags=re.IGNORECASE
    )

    topic = re.sub(
        r"\b(create|make|generate|save|export|download)\s+(a\s+)?(pdf|report)\b",
        "",
        topic,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Remove research commands
    # --------------------------------------------------------

    topic = re.sub(
        r"^\s*(research|investigate|deep\s+research|research\s+deeply)\s+",
        "",
        topic,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Remove phrases that refer to the subject indirectly
    # --------------------------------------------------------

    topic = re.sub(
        r"\s+about\s+it\b",
        "",
        topic,
        flags=re.IGNORECASE
    )

    topic = re.sub(
        r"\s+and\s+about\s+it\b",
        "",
        topic,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Clean dangling words left by command removal
    # --------------------------------------------------------

    topic = re.sub(
        r"\s+\band\s*$",
        "",
        topic,
        flags=re.IGNORECASE
    )

    topic = re.sub(
        r"^\s*about\s+",
        "",
        topic,
        flags=re.IGNORECASE
    )

    topic = re.sub(
        r"^\s*the\s+",
        "the ",
        topic,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Normalize whitespace and punctuation
    # --------------------------------------------------------

    topic = re.sub(
        r"\s+",
        " ",
        topic
    ).strip()

    topic = topic.strip(
        " .,!?;:-"
    )

    # --------------------------------------------------------
    # Safety fallback
    # --------------------------------------------------------

    if not topic:
        topic = message.strip()

    return topic



# ============================================================
# SEARCH QUERY GENERATION
# ============================================================

def build_search_queries(topic):
    """
    Creates focused searches instead of sending one huge
    sentence to the search engine.
    """

    topic_lower = topic.lower()

    queries = []

    # Main search
    queries.append(topic)

    # Current/latest topics
    if any(
        word in topic_lower
        for word in [
            "latest",
            "current",
            "today",
            "recent",
            "news",
            "results",
            "developments",
        ]
    ):

        queries.append(
            f"{topic} latest news"
        )

        queries.append(
            f"{topic} latest developments"
        )

        queries.append(
            f"{topic} current information"
        )

    else:

        queries.append(
            f"{topic} facts information"
        )

        queries.append(
            f"{topic} detailed analysis"
        )

        queries.append(
            f"{topic} history background"
        )

    # Special handling for football/soccer.
    if any(
        word in topic_lower
        for word in [
            "football",
            "soccer",
            "premier league",
            "champions league",
            "la liga",
            "serie a",
            "bundesliga",
        ]
    ):

        queries = [
            f"{topic} latest football news",
            f"{topic} football scores results fixtures",
            f"{topic} latest matches results",
            f"{topic} football news analysis",
        ]

    # Remove duplicates while preserving order.
    final_queries = []

    for query in queries:

        query = query.strip()

        if (
            query
            and query not in final_queries
        ):
            final_queries.append(query)

    return final_queries[:4]


# ============================================================
# WEB RESEARCH
# ============================================================

def conduct_research(topic):
    """
    Performs multiple searches and combines useful results.

    Individual search failures do not stop the entire
    research process.
    """

    queries = build_search_queries(topic)

    all_results = []
    seen_urls = set()

    print()
    print(
        "🔎 PRIME is researching the web..."
    )

    for query in queries:

        print(
            f"🔍 Search: {query}"
        )

        try:

            results = web_search(
                query,
                5
            )

        except Exception as error:

            print(
                f"⚠️ Search skipped: {error}"
            )

            continue

        if not results:

            print(
                "⚠️ No results for this search."
            )

            continue

        for result in results:

            if not isinstance(
                result,
                dict
            ):
                continue

            title = str(
                result.get(
                    "title",
                    ""
                )
            ).strip()

            url = str(
                result.get(
                    "url",
                    ""
                )
            ).strip()

            snippet = str(
                result.get(
                    "snippet",
                    ""
                )
            ).strip()

            if not title and not snippet:
                continue

            if (
                url
                and url in seen_urls
            ):
                continue

            if url:
                seen_urls.add(url)

            snippet = snippet[
                :MAX_SNIPPET_LENGTH
            ]

            all_results.append(
                {
                    "title": title,
                    "url": url,
                    "snippet": snippet
                }
            )

            if (
                len(all_results)
                >= MAX_RESEARCH_SOURCES
            ):
                break

        if (
            len(all_results)
            >= MAX_RESEARCH_SOURCES
        ):
            break

    print(
        f"✅ Research collected: "
        f"{len(all_results)} sources"
    )

    return all_results


# ============================================================
# FORMAT RESEARCH FOR LLAMA
# ============================================================

def format_research(results):

    if not results:

        return (
            "No reliable web research results "
            "were available."
        )

    sections = []

    for index, result in enumerate(
        results,
        1
    ):

        title = result.get(
            "title",
            ""
        )

        snippet = result.get(
            "snippet",
            ""
        )

        section = (
            f"SOURCE {index}\n"
            f"Title: {title}\n"
            f"Information: {snippet}\n"
        )

        sections.append(
            section
        )

    return "\n".join(
        sections
    )


# ============================================================
# PRIME SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are PRIME, a local AI assistant.

Be helpful, accurate, concise, conversational,
and natural.

Use supplied research when available.

Do not explain internal tools or implementation.

Do not tell the user how to create a PDF or upload
files. The application handles those tasks.

For current information, rely on the supplied research
and do not invent unsupported facts.

For research questions, organize the answer with
useful headings when appropriate.

For simple questions, answer directly and briefly.
"""


# ============================================================
# OLLAMA ERROR MESSAGE
# ============================================================

def ollama_error_message(error):
    """
    Converts technical Ollama/request failures into a
    simple message instead of exposing a long traceback.
    """

    if isinstance(
        error,
        requests.exceptions.Timeout
    ):

        return (
            "PRIME: The local AI took too long to "
            "respond. Ollama is running, but this "
            "request was too heavy for the current "
            "local model."
        )

    if isinstance(
        error,
        requests.exceptions.ConnectionError
    ):

        return (
            "PRIME: I could not connect to the "
            "local Ollama service."
        )

    if isinstance(
        error,
        requests.exceptions.HTTPError
    ):

        return (
            "PRIME: Ollama returned an error while "
            "processing the request."
        )

    return (
        f"PRIME: The local AI encountered an error: "
        f"{error}"
    )


# ============================================================
# LLAMA
# ============================================================

def ask_llama(
    message,
    research=None
):
    """
    Sends the user request and optional research
    to the local Llama model.

    The prompt is deliberately kept compact because
    PRIME is currently using llama3.2:1b locally.
    """

    if research:

        research_text = format_research(
            research
        )

        prompt = f"""
{SYSTEM_PROMPT}

User request:
{message}

Research:
{research_text}

Using the research above, answer the user's request.
Give the useful answer directly.

PRIME:
"""

        max_tokens = RESEARCH_MAX_TOKENS

    else:

        prompt = f"""
{SYSTEM_PROMPT}

User:
{message}

PRIME:
"""

        max_tokens = NORMAL_MAX_TOKENS

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": "30m",
        "options": {
            "temperature": 0,
            "num_predict": max_tokens
        }
    }

    print(
        "🧠 PRIME is thinking..."
    )

    print("DEBUG MODEL:", MODEL)
    print("DEBUG PROMPT LENGTH:", len(prompt))
    print("DEBUG MAX TOKENS:", max_tokens)

    try:

        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=OLLAMA_TIMEOUT
        )

        response.raise_for_status()

        data = response.json()

    except (
        requests.exceptions.Timeout,
        requests.exceptions.ConnectionError,
        requests.exceptions.HTTPError
    ) as error:

        print()

        print(
            ollama_error_message(error)
        )

        return ollama_error_message(error)

    except requests.exceptions.RequestException as error:

        print()

        message_text = (
            f"PRIME: The Ollama request failed: "
            f"{error}"
        )

        print(
            message_text
        )

        return message_text

    answer = data.get(
        "response",
        ""
    ).strip()

    if not answer:

        return (
            "PRIME: Ollama returned an empty response."
        )

    return answer


# ============================================================
# PDF TITLE
# ============================================================

def create_pdf_title(message):

    topic = extract_research_topic(
        message
    )

    topic = re.sub(
        r"\b(upload|save|put)\b.*$",
        "",
        topic,
        flags=re.IGNORECASE
    ).strip()

    if topic:
        return topic[:100]

    return (
        "PRIME AI Research Report"
    )


# ============================================================
# CREATE PDF + OPTIONAL GOOGLE DRIVE
# ============================================================

def create_and_upload_pdf(
    title,
    content,
    upload_to_drive=False
):

    print()
    print(
        "📄 Creating PDF..."
    )

    pdf_path = create_pdf(
        title,
        content
    )

    print(
        f"✅ PDF created: {pdf_path}"
    )

    if not upload_to_drive:

        return {
            "pdf_path": pdf_path,
            "uploaded": False
        }

    print()
    print(
        "☁️ Uploading to Google Drive..."
    )

    result = upload_file(
        pdf_path
    )

    print(
        "✅ Uploaded to Google Drive."
    )

    return {
        "pdf_path": pdf_path,
        "uploaded": True,
        "drive_result": result
    }


# ============================================================
# PRIME CORE
# ============================================================

def process_message(message):

    pdf_requested = wants_pdf(
        message
    )

    drive_requested = wants_drive(
        message
    )

    research_requested = needs_research(
        message
    )

    # --------------------------------------------------------
    # RESEARCH
    # --------------------------------------------------------

    research = None

    if research_requested:

        topic = extract_research_topic(
            message
        )

        print()
        print(
            f"🔍 Research topic: {topic}"
        )

        research = conduct_research(
            topic
        )

        if not research:

            print()
            print(
                "⚠️ No usable research results found."
            )

    # --------------------------------------------------------
    # GENERATE ANSWER
    # --------------------------------------------------------

    answer = ask_llama(
        message,
        research=research
    )

    # --------------------------------------------------------
    # NORMAL ANSWER
    # --------------------------------------------------------

    if not pdf_requested:

        return answer

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    print()
    print(
        "🛠️ PRIME is using the PDF tool..."
    )

    title = create_pdf_title(
        message
    )

    result = create_and_upload_pdf(
        title,
        answer,
        upload_to_drive=drive_requested
    )

    # --------------------------------------------------------
    # GOOGLE DRIVE RESULT
    # --------------------------------------------------------

    if result["uploaded"]:

        drive_result = result.get(
            "drive_result",
            {}
        )

        drive_link = drive_result.get(
            "webViewLink"
        )

        if drive_link:

            return (
                "Done. I created the PDF "
                "and uploaded it to Google Drive.\n"
                f"Drive link: {drive_link}"
            )

        return (
            "Done. I created the PDF "
            "and uploaded it to Google Drive."
        )

    # --------------------------------------------------------
    # LOCAL PDF RESULT
    # --------------------------------------------------------

    return (
        "Done. I created the PDF successfully.\n"
        f"File: {result['pdf_path']}"
    )


# ============================================================
# TERMINAL INTERFACE
# ============================================================

def main():

    print()
    print(
        "========================================"
    )

    print(
        "              🧠 PRIME"
    )

    print(
        "========================================"
    )

    print(
        "Natural-language research agent ready."
    )

    print(
        "Type 'exit' to quit."
    )

    print()

    while True:

        try:

            user_input = input(
                "You: "
            ).strip()

            if not user_input:
                continue

            # ------------------------------------------------
            # EXIT
            # ------------------------------------------------

            if user_input.lower() in [
                "exit",
                "quit"
            ]:

                print(
                    "PRIME: Goodbye."
                )

                break

            # ------------------------------------------------
            # PROCESS
            # ------------------------------------------------

            answer = process_message(
                user_input
            )

            print()

            print(
                "PRIME:",
                answer
            )

            print()

        except KeyboardInterrupt:

            print()
            print(
                "PRIME: Stopped."
            )
            break

        except requests.exceptions.Timeout:

            print()
            print(
                "PRIME: The local AI took too long "
                "to respond. Please try again."
            )
            print()

        except requests.exceptions.RequestException as error:

            print()
            print(
                "PRIME: I could not connect to "
                f"the local AI service: {error}"
            )
            print()

        except Exception as error:

            print()
            print(
                f"PRIME: Something went wrong: {error}"
            )
            print()


# ============================================================
# START PRIME
# ============================================================

if __name__ == "__main__":
    main()
