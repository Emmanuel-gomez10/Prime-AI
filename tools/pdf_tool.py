from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from pathlib import Path


def create_pdf(title, content, filename=None):

    output_dir = Path("../data")
    output_dir.mkdir(parents=True, exist_ok=True)

    if filename is None:
        filename = "ai_answer.pdf"

    output_path = output_dir / filename

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER

    body_style = styles["BodyText"]
    body_style.leading = 16

    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50,
    )

    story = []

    story.append(
        Paragraph(title, title_style)
    )

    story.append(Spacer(1, 20))

    paragraphs = content.split("\n")

    for paragraph in paragraphs:

        if paragraph.strip():

            story.append(
                Paragraph(
                    paragraph.strip(),
                    body_style
                )
            )

            story.append(
                Spacer(1, 10)
            )

    document.build(story)

    return str(output_path)