import io
from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ── Brand colours ──────────────────────────────────────────────────────────────
TEAL       = colors.HexColor("#5BBFB0")
TEAL_DARK  = colors.HexColor("#2C5F5A")
PURPLE     = colors.HexColor("#5A3A7A")
PURPLE_MID = colors.HexColor("#A97CC4")
PURPLE_BG  = colors.HexColor("#F3EEF8")
GREY       = colors.HexColor("#666666")
LIGHT_GREY = colors.HexColor("#E0D0F0")
WHITE      = colors.white
BLACK      = colors.HexColor("#1A1A2E")


# ── Pydantic models (mirrors what Next.js sends) ───────────────────────────────

class NannyInfo(BaseModel):
    name: str
    city: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: list[str] = []
    education_level: Optional[str] = None
    religion: Optional[str] = None


class ParentInfo(BaseModel):
    full_name: str


class Scores(BaseModel):
    overall: float
    domain_a: Optional[float] = None  # Kondisi Kerja
    domain_b: Optional[float] = None  # Nilai & Gaya Hidup
    domain_c: Optional[float] = None  # Pengalaman & Kemampuan
    aspect_breakdown: dict[str, float] = {}


class ReportRequest(BaseModel):
    matching_request_id: str
    nanny: NannyInfo
    parent: ParentInfo
    scores: Scores
    match_highlights: list[str] = []
    mismatch_areas: list[str] = []
    negotiation_points: list[str] = []
    tips_for_parent: list[str] = []
    tips_for_nanny: list[str] = []
    generated_at: Optional[str] = None


# ── Style helpers ──────────────────────────────────────────────────────────────

def _styles() -> dict:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("title", parent=base["Normal"],
                                fontSize=22, textColor=WHITE,
                                fontName="Helvetica-Bold", alignment=TA_LEFT),
        "subtitle": ParagraphStyle("subtitle", parent=base["Normal"],
                                   fontSize=11, textColor=colors.HexColor("#D9C8F0"),
                                   fontName="Helvetica", alignment=TA_LEFT),
        "section_head": ParagraphStyle("section_head", parent=base["Normal"],
                                       fontSize=13, textColor=PURPLE,
                                       fontName="Helvetica-Bold", spaceBefore=4),
        "body": ParagraphStyle("body", parent=base["Normal"],
                               fontSize=10, textColor=BLACK,
                               fontName="Helvetica", leading=15),
        "body_small": ParagraphStyle("body_small", parent=base["Normal"],
                                     fontSize=9, textColor=GREY,
                                     fontName="Helvetica", leading=13),
        "bullet": ParagraphStyle("bullet", parent=base["Normal"],
                                 fontSize=10, textColor=BLACK,
                                 fontName="Helvetica", leading=15,
                                 leftIndent=12, firstLineIndent=-12),
        "score_big": ParagraphStyle("score_big", parent=base["Normal"],
                                    fontSize=36, textColor=WHITE,
                                    fontName="Helvetica-Bold", alignment=TA_CENTER),
        "score_label": ParagraphStyle("score_label", parent=base["Normal"],
                                      fontSize=9, textColor=colors.HexColor("#D9C8F0"),
                                      fontName="Helvetica", alignment=TA_CENTER),
        "footer": ParagraphStyle("footer", parent=base["Normal"],
                                 fontSize=8, textColor=GREY,
                                 fontName="Helvetica", alignment=TA_CENTER),
        "tag": ParagraphStyle("tag", parent=base["Normal"],
                              fontSize=9, textColor=TEAL_DARK,
                              fontName="Helvetica-Bold", alignment=TA_CENTER),
    }


def _score_label(score: float) -> str:
    if score >= 85:
        return "Sangat Cocok"
    if score >= 70:
        return "Cocok"
    if score >= 55:
        return "Cukup Cocok"
    return "Perlu Diskusi"


def _score_colour(score: float) -> colors.Color:
    if score >= 70:
        return TEAL
    if score >= 55:
        return PURPLE_MID
    return colors.HexColor("#C8B8DC")


# ── Score bar as a mini table ──────────────────────────────────────────────────

def _domain_bar_row(label: str, score: Optional[float], style: dict) -> list:
    if score is None:
        return []
    bar_width = 90 * mm
    filled = bar_width * (score / 100)

    bar_table = Table(
        [[""]],
        colWidths=[filled],
        rowHeights=[6],
    )
    bar_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), _score_colour(score)),
        ("ROUNDEDCORNERS", [3]),
        ("LINEABOVE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBELOW", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBEFORE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEAFTER", (0, 0), (-1, -1), 0, colors.transparent),
    ]))

    bg_table = Table(
        [[bar_table, ""]],
        colWidths=[filled, bar_width - filled],
        rowHeights=[6],
    )
    bg_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREY),
        ("LINEABOVE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBELOW", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBEFORE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEAFTER", (0, 0), (-1, -1), 0, colors.transparent),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))

    row = Table(
        [[Paragraph(label, style["body_small"]), bg_table,
          Paragraph(f"<b>{score:.0f}%</b>", style["body_small"])]],
        colWidths=[40 * mm, 90 * mm, 16 * mm],
        rowHeights=[14],
    )
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEABOVE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBELOW", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBEFORE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEAFTER", (0, 0), (-1, -1), 0, colors.transparent),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return [row, Spacer(1, 3)]


# ── Bullet list helper ─────────────────────────────────────────────────────────

def _bullet_list(items: list[str], style: dict, dot_colour: colors.Color = TEAL) -> list:
    elements = []
    for item in items:
        dot = f'<font color="#{dot_colour.hexval()[2:]}">●</font>  {item}'
        elements.append(Paragraph(dot, style["bullet"]))
        elements.append(Spacer(1, 3))
    return elements


# ── Section box (coloured background) ─────────────────────────────────────────

def _section_box(title: str, items: list[str], bg: colors.Color,
                 dot: colors.Color, style: dict) -> Table:
    content_rows: list = [Paragraph(f"<b>{title}</b>", style["section_head"])]
    content_rows.append(Spacer(1, 6))
    content_rows.extend(_bullet_list(items, style, dot_colour=dot))

    inner = Table([[content_rows]], colWidths=[160 * mm])
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("ROUNDEDCORNERS", [8]),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("LINEABOVE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBELOW", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBEFORE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEAFTER", (0, 0), (-1, -1), 0, colors.transparent),
    ]))
    return inner


# ── Main generator ─────────────────────────────────────────────────────────────

def generate_nanny_report(req: ReportRequest) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=10 * mm,
        bottomMargin=15 * mm,
    )

    s = _styles()
    story = []

    # ── Hero header (purple banner) ────────────────────────────────────────────
    overall = req.scores.overall
    score_label = _score_label(overall)
    generated = req.generated_at or datetime.now().isoformat()[:10]

    header_content = [
        [
            [
                Paragraph("BundaYakin", s["subtitle"]),
                Spacer(1, 4),
                Paragraph("Laporan Kecocokan Nanny", s["title"]),
                Spacer(1, 8),
                Paragraph(
                    f"Nanny: <b>{req.nanny.name}</b> · Orang tua: <b>{req.parent.full_name}</b>",
                    s["subtitle"],
                ),
                Spacer(1, 4),
                Paragraph(f"Dibuat: {generated}", s["subtitle"]),
            ],
            [
                Paragraph(f"{overall:.0f}%", s["score_big"]),
                Paragraph(score_label, s["score_label"]),
            ],
        ]
    ]

    header_table = Table(header_content, colWidths=[120 * mm, 50 * mm], rowHeights=[None])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PURPLE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("LEFTPADDING", (0, 0), (0, -1), 16),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 16),
        ("LINEABOVE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBELOW", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEBEFORE", (0, 0), (-1, -1), 0, colors.transparent),
        ("LINEAFTER", (0, 0), (-1, -1), 0, colors.transparent),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10 * mm))

    # ── Domain score bars ──────────────────────────────────────────────────────
    story.append(Paragraph("Skor per Domain", s["section_head"]))
    story.append(Spacer(1, 6))

    domains = [
        ("Domain A — Kondisi Kerja", req.scores.domain_a),
        ("Domain B — Nilai & Gaya Hidup", req.scores.domain_b),
        ("Domain C — Pengalaman & Kemampuan", req.scores.domain_c),
    ]
    for label, score in domains:
        story.extend(_domain_bar_row(label, score, s))

    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GREY))
    story.append(Spacer(1, 6 * mm))

    # ── Nanny profile snapshot ─────────────────────────────────────────────────
    story.append(Paragraph("Profil Nanny", s["section_head"]))
    story.append(Spacer(1, 5))

    nanny_rows = []
    if req.nanny.city:
        nanny_rows.append(["Kota", req.nanny.city])
    if req.nanny.years_of_experience is not None:
        nanny_rows.append(["Pengalaman", f"{req.nanny.years_of_experience} tahun"])
    if req.nanny.education_level:
        nanny_rows.append(["Pendidikan", req.nanny.education_level])
    if req.nanny.religion:
        nanny_rows.append(["Agama", req.nanny.religion])
    if req.nanny.skills:
        nanny_rows.append(["Keahlian", ", ".join(req.nanny.skills)])

    if nanny_rows:
        profile_data = [
            [Paragraph(f"<b>{k}</b>", s["body_small"]), Paragraph(v, s["body_small"])]
            for k, v in nanny_rows
        ]
        profile_table = Table(profile_data, colWidths=[45 * mm, 115 * mm])
        profile_table.setStyle(TableStyle([
            ("LINEABOVE", (0, 0), (-1, -1), 0, colors.transparent),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, LIGHT_GREY),
            ("LINEBEFORE", (0, 0), (-1, -1), 0, colors.transparent),
            ("LINEAFTER", (0, 0), (-1, -1), 0, colors.transparent),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(profile_table)

    story.append(Spacer(1, 8 * mm))

    # ── Match highlights ───────────────────────────────────────────────────────
    if req.match_highlights:
        story.append(_section_box(
            "Area Kecocokan", req.match_highlights,
            bg=colors.HexColor("#E5F6F4"), dot=TEAL, style=s,
        ))
        story.append(Spacer(1, 6 * mm))

    # ── Mismatch / negotiation ─────────────────────────────────────────────────
    if req.mismatch_areas:
        story.append(_section_box(
            "Area yang Perlu Diperhatikan", req.mismatch_areas,
            bg=PURPLE_BG, dot=PURPLE_MID, style=s,
        ))
        story.append(Spacer(1, 6 * mm))

    if req.negotiation_points:
        story.append(_section_box(
            "Topik untuk Didiskusikan Bersama", req.negotiation_points,
            bg=colors.HexColor("#FFF8F0"), dot=colors.HexColor("#E8A87C"), style=s,
        ))
        story.append(Spacer(1, 6 * mm))

    # ── Tips ───────────────────────────────────────────────────────────────────
    if req.tips_for_parent:
        story.append(Paragraph("Saran untuk Orang Tua", s["section_head"]))
        story.append(Spacer(1, 5))
        story.extend(_bullet_list(req.tips_for_parent, s, dot_colour=PURPLE_MID))
        story.append(Spacer(1, 6 * mm))

    if req.tips_for_nanny:
        story.append(Paragraph("Saran untuk Nanny", s["section_head"]))
        story.append(Spacer(1, 5))
        story.extend(_bullet_list(req.tips_for_nanny, s, dot_colour=TEAL))
        story.append(Spacer(1, 6 * mm))

    # ── Footer ─────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GREY))
    story.append(Spacer(1, 5))
    story.append(Paragraph(
        "Laporan ini dibuat secara otomatis oleh BundaYakin · Human Care Consulting (HCC) · bundayakin.com",
        s["footer"],
    ))
    story.append(Paragraph(
        "Dokumen bersifat konfidensial — hanya untuk orang tua dan nanny yang bersangkutan.",
        s["footer"],
    ))

    doc.build(story)
    return buffer.getvalue()
