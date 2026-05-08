#!/usr/bin/env python3
"""Generate Zerve_Q2_2026_Plan.xlsx"""

from openpyxl import Workbook
from openpyxl.styles import (
    PatternFill, Font, Alignment, Border, Side, GradientFill
)
from openpyxl.utils import get_column_letter

wb = Workbook()

# ── Colour palette ──────────────────────────────────────────────────────────
HEADER_FILL   = PatternFill("solid", fgColor="1F2937")
ALT_FILL      = PatternFill("solid", fgColor="F9FAFB")
WHITE_FILL    = PatternFill("solid", fgColor="FFFFFF")

STREAM_COLORS = {
    "Enterprise Pipeline": "1F4E79",
    "Enterprise Pipeline & ARR": "1F4E79",
    "Mega Launch": "DC2626",
    "Features": "D97706",
    "Events & Hackathons": "7030A0",
    "Partnerships": "0E7490",
    "Community": "548235",
    "SEO": "BF8F00",
    "Foundation": "6B7280",
}

PRIORITY_STYLES = {
    "P0": {"color": "DC2626", "bold": True},
    "P1": {"color": "D97706", "bold": True},
    "P2": {"color": "6B7280", "bold": False},
}

TAB_COLORS = {
    "Overview":                 "1F2937",
    "Q2 Calendar":              "1F4E79",
    "Mega Launch":              "DC2626",
    "Enterprise Pipeline & BDR":"1F4E79",
    "Implications":             "6B7280",
}

def thin_border():
    s = Side(style="thin", color="D1D5DB")
    return Border(left=s, right=s, top=s, bottom=s)

def header_font():
    return Font(bold=True, color="FFFFFF", name="Calibri", size=11)

def bold_font(color="000000"):
    return Font(bold=True, color=color, name="Calibri", size=10)

def normal_font(color="000000"):
    return Font(color=color, name="Calibri", size=10)

def apply_header_row(ws, col_count):
    for cell in ws[1]:
        cell.fill   = HEADER_FILL
        cell.font   = header_font()
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border()

def style_data_rows(ws, start_row, end_row, col_count,
                    stream_col=None, priority_col=None):
    for row_idx in range(start_row, end_row + 1):
        alt = (row_idx - start_row) % 2 == 1
        fill = ALT_FILL if alt else WHITE_FILL
        for col_idx in range(1, col_count + 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.border    = thin_border()
            cell.alignment = Alignment(vertical="top", wrap_text=True)
            # default font
            cell.font = normal_font()
            # alt row fill (only if no stream colour already set)
            if cell.fill.fgColor.rgb in ("00000000", "FFFFFFFF", "FFF9FAFB"):
                cell.fill = fill

        # stream column colour
        if stream_col:
            sc = ws.cell(row=row_idx, column=stream_col)
            val = str(sc.value or "")
            for key, hex_col in STREAM_COLORS.items():
                if val.startswith(key):
                    sc.fill = PatternFill("solid", fgColor=hex_col)
                    sc.font = Font(color="FFFFFF", bold=True, name="Calibri", size=10)
                    break

        # priority column colour
        if priority_col:
            pc = ws.cell(row=row_idx, column=priority_col)
            pval = str(pc.value or "").strip()
            if pval in PRIORITY_STYLES:
                ps = PRIORITY_STYLES[pval]
                pc.font = Font(bold=ps["bold"], color=ps["color"], name="Calibri", size=10)

def set_col_widths(ws, widths):
    for col_idx, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(col_idx)].width = w

def freeze_header(ws):
    ws.freeze_panes = "A2"

# ═══════════════════════════════════════════════════════════════════════════
# Sheet 1 — Overview
# ═══════════════════════════════════════════════════════════════════════════
ws1 = wb.active
ws1.title = "Overview"
ws1.sheet_properties.tabColor = TAB_COLORS["Overview"]

headers = ["Stream", "Goal", "Target", "Owner", "Notes"]
ws1.append(headers)

rows = [
    ["Enterprise Pipeline", "New ARR",                          "$500K",                    "Phily / Zach",         ""],
    ["Enterprise Pipeline", "Q3 Pipeline",                      "$2.1M",                    "Phily / Zach / BDR",   ""],
    ["Enterprise Pipeline", "Hedge fund logos closed",          "3",                        "Phily / Zach",         ""],
    ["Enterprise Pipeline", "Partnership deals closed",         "2",                        "Phily",                ""],
    ["Enterprise Pipeline", "BDR hired",                        "1",                        "Phily / Zach",         "Start June 1"],
    ["Enterprise Pipeline", "BDR weekly outbound",              "500 calls/emails/LIs",     "BDR",                  "From mid-June"],
    ["Enterprise Pipeline", "Zach weekly outbound",             "200 emails/LIs",           "Zach",                 ""],
    ["Enterprise Pipeline", "Founder weekly outbound (each)",   "100",                      "P / J / G",            ""],
    ["Mega Launch",          "Social impressions in 48 hrs",    "5M",                       "Zach + Phily",         ""],
    ["Mega Launch",          "Virality coefficient",            "K ≥ 0.8 by week 2",        "Zach",                 ""],
    ["Mega Launch",          "Waitlist signups pre-launch",     "10,000",                   "Zach + Olga",          ""],
    ["Mega Launch",          "Researchers posting in 48 hrs",   "30+ across 4 domains",     "Zach",                 ""],
    ["Mega Launch",          "Pipeline generated from inbound", "$300K+",                   "BDR + Zach",           ""],
    ["Mega Launch",          "Product Hunt rank",               "#1 or #2",                 "Zach",                 ""],
    ["Community",            "Net adds by Sep",                 "5,000+",                   "Zach",                 "30%+ from launch + hackathons"],
    ["SEO",                  "High-quality articles in 12 wks", "18",                       "Zach + agents",        ""],
]

for r in rows:
    ws1.append(r)

apply_header_row(ws1, 5)
style_data_rows(ws1, 2, len(rows)+1, 5, stream_col=1)
ws1.row_dimensions[1].height = 22
set_col_widths(ws1, [28, 38, 26, 26, 36])
freeze_header(ws1)


# ═══════════════════════════════════════════════════════════════════════════
# Sheet 2 — Q2 Calendar
# ═══════════════════════════════════════════════════════════════════════════
ws2 = wb.create_sheet("Q2 Calendar")
ws2.sheet_properties.tabColor = TAB_COLORS["Q2 Calendar"]

headers2 = ["Month", "Week", "Stream", "Activity", "Owner", "Status", "Priority", "Deliverable", "Notes"]
ws2.append(headers2)

cal_rows = [
    # ── MAY ──
    ["May 2026","W1",        "Enterprise Pipeline","Final-round BDR candidates (3+)","Phily + Zach","Active","P0","Offer out by W3",""],
    ["May 2026","W1",        "Foundation","Onboard Simon (web dev) — replace Miroslav","Jason","Active","P0","Unblocker",""],
    ["May 2026","W1-W2",     "Enterprise Pipeline","Sales tech stack procurement: Alta, Clay, Zoom, Fathom, Apollo, Sales Nav, Nooks","Zach + Greg","Active","P0","All tools live by May W4",""],
    ["May 2026","W1-W2",     "Mega Launch","Vision for program — what researchers get","Zach + Phily","Active","P0","Approved doc","Verified research, tier-1 advisory board, search page anchor, waitlist"],
    ["May 2026","W1-W2",     "Mega Launch","Top 50 researchers list per domain","Zach","Active","P0","List in CRM","4 domains"],
    ["May 2026","W1-W2",     "Mega Launch","Validator outreach wave 1","Phily + Zach","Active","P0","",""],
    ["May 2026","W1-W2",     "SEO","Yoni keyword research kickoff","Yoni + Zach","Active","P0","Unblocks content",""],
    ["May 2026","W1 onwards","Community","Founder posting cadence (Jason 1×/wk, Phily 1×/wk)","Jason + Phily","Ongoing","P1","Lock cadence",""],
    ["May 2026","W1 onwards","Enterprise Pipeline","Founder outbound P/J/G 100 each per week","Phily + Jason + Greg","Ongoing","P0","CRM logged",""],
    ["May 2026","W1 onwards","Enterprise Pipeline","Zach outbound 200 emails/LIs per week","Zach","Ongoing","P0","CRM logged",""],
    ["May 2026","W2",        "Enterprise Pipeline","ICP one-pager (US HFs + multi-strats first 90 days)","Zach + Phily","Active","P0","Approved doc",""],
    ["May 2026","W2",        "Mega Launch","Define 4 agent use cases (finance/bio/economics/pharma)","Jason + Zach","Active","P0","Doc",""],
    ["May 2026","W2",        "Mega Launch","Build researcher personas","Zach","Active","P1","",""],
    ["May 2026","W2",        "Foundation","Design specs for Simon","Olga","Active","P0","Required before Simon ramps",""],
    ["May 2026","W2",        "Mega Launch","Decide PR channel (TechCrunch / Sifted / The Information)","Phily","Active","P0","Decision",""],
    ["May 2026","W2-W3",     "Enterprise Pipeline","US HF/FS account list (250-500 with role names)","Zach","Active","P0","List in CRM",""],
    ["May 2026","W2-W3",     "Enterprise Pipeline","Competitor doc (Hex, Cursor, Jupyter, Databricks, build-your-own)","Zach","Active","P0","Living doc",""],
    ["May 2026","W2-W3",     "Community","Zerve gallery filters (notebooks / reports / research)","Olga","Active","P0","",""],
    ["May 2026","W2-W4",     "SEO","15-20 launch-window content pieces in production","Zach + agents","Active","P0","Most live by launch",""],
    ["May 2026","W3",        "Enterprise Pipeline","Battlecards + positioning per competitor","Zach","Active","P0","Sales-ready",""],
    ["May 2026","W3",        "Mega Launch","STEPPS mechanics: waitlist referral + invite badges","Olga","Active","P0","Live by T-8",""],
    ["May 2026","W3",        "Events & Hackathons","Eagle Alpha hackathon (quant) — May 19","Zach","Confirmed","P0","Run + follow-up",""],
    ["May 2026","W3-W4",     "Enterprise Pipeline","3 outbound sequences (cold / warm-back / Eagle Alpha follow-up)","Zach (Phily review)","Active","P0","Live in Salesloft",""],
    ["May 2026","W3-W4",     "Enterprise Pipeline","Sales enablement pack v1 (quant 1-pager, enterprise data 1-pager, demo deck)","Zach + Phily","Active","P0","Versioned",""],
    ["May 2026","W3-W4",     "Enterprise Pipeline","Customer case studies × 2 (ITV / S&P / Algolia / BBC / Cubic)","Zach + Phily","Active","P0","Published",""],
    ["May 2026","W3-W4",     "Mega Launch","Confirm 1-2 researchers per domain who will publish","Phily + Zach","Active","P0","Signed",""],
    ["May 2026","W3-W4",     "Mega Launch","Brief each academic on the research piece","Zach","Active","P0","Briefs sent",""],
    ["May 2026","W3-W4",     "Mega Launch","Identify + confirm 10-20 early access users","Zach","Active","P0","List + outreach","Technical, complex problems"],
    ["May 2026","W3-W4",     "Mega Launch","Validator outreach wave 2","Phily + Zach","Active","P0","",""],
    ["May 2026","W3-W4",     "Mega Launch","Influencer identification + early outreach","Zach","Active","P0","","Eloqwnt video, Stephen Kinsella, others"],
    ["May 2026","W3-W4",     "Mega Launch","Promote waitlist for self-evolve agent pre-launch","Zach + Olga","Active","P0","",""],
    ["May 2026","W3-W4",     "Mega Launch","Website changes for self-evolving agent (new pages, home, pricing)","Olga + Simon","Active","P0","Live by W4",""],
    ["May 2026","W3-W4",     "Mega Launch","Promotional offer for launch (48 hrs unlimited credits?)","Phily + Zach","Active","P0","Decision",""],
    ["May 2026","W3-W4",     "Features","Data Discovery + Jira/Asana/Slack workflow integrations","Olga + Zach","Active","P1","Tier 2 launch","One LinkedIn post + one blog"],
    ["May 2026","W3-W4",     "Community","Separate research publications page on website (citable, DOI)","Olga","Active","P0","Live",""],
    ["May 2026","W3-W4",     "Community","Onboarding email revamp (consider agentifying)","Olga + Zach","Active","P1","","Can slip to June"],
    ["May 2026","W3-W4",     "SEO","Agent-generated blog content pilot","Jason + Zach","Active","P1","Pilot live","Story-in-itself"],
    ["May 2026","W3-W4",     "Features","Hearst customer story video","Zach","Active","P2","Tier 3 launch",""],
    ["May 2026","W4",        "Enterprise Pipeline","BDR onboarding plan (week 1/4/8/12 ramp targets)","Zach","Active","P0","Doc + week-1 schedule",""],
    ["May 2026","W4",        "Enterprise Pipeline","BDR comp structure (~$75K base + $35K OTE, SQO-weighted)","Greg + Phily + Zach","Active","P0","Signed offer",""],
    ["May 2026","W4",        "Events & Hackathons","Conference pipeline — book 3 events June→Sep","Zach","Open","P0","3 events booked","Gap to close"],
    ["May 2026","W4",        "Mega Launch","Lock 6 tier-1 validators + 12 tier-2","Zach + Phily","Active","P0","All confirmed",""],
    ["May 2026","W4",        "Foundation","Update product pages with consistent design","Olga + Simon","Active","P1","Pre-launch polish",""],
    # ── JUNE ──
    ["June 2026","W1",       "Enterprise Pipeline","BDR day 1 — product training, ICP, tools, shadowing","Zach + BDR","Planned","P0","","Tools live before day 1"],
    ["June 2026","W1-W2",    "Enterprise Pipeline","BDR sequences live by W2","BDR","Planned","P0","Outbound running",""],
    ["June 2026","W1-W2",    "Mega Launch","Press embargo briefings","Phily + PR partner","Planned","P0","",""],
    ["June 2026","W1-W2",    "Mega Launch","Podcast bookings for launch window","Zach","Planned","P0","",""],
    ["June 2026","W1-W2",    "Mega Launch","Define use cases / scripts / channels for early access cohort","Zach","Planned","P0","",""],
    ["June 2026","W1-W2",    "Events & Hackathons","HackerEarth hackathon (running)","Zach","Confirmed","P0","","Confirmed"],
    ["June 2026","W1 onwards","SEO","Sustained content drumbeat ≥2 pieces/week","Zach + agents","Ongoing","P1","Compounds",""],
    ["June 2026","W2",       "Mega Launch","Final QA of all assets","Zach + Olga","Planned","P0","",""],
    ["June 2026","W2",       "Mega Launch","Launch-day comms locked (PH/HN scheduled, validator posts pre-written, embargoes out)","Zach","Planned","P0","",""],
    ["June 2026","W2",       "Mega Launch","Influencer wave warmed","Zach","Planned","P0","",""],
    ["June 2026","W2",       "Mega Launch","Channel-by-launch-type matrix locked","Zach","Planned","P0","",""],
    ["June 2026","W2",       "Community","Public notebook embeds + 'Built with Zerve' badge","Olga","Planned","P1","Live",""],
    ["June 2026","W2",       "Features","Pricing changes (tied to mega launch)","Phily + Zach","Planned","P1","Tier 2 launch",""],
    ["June 2026","W3 (Tue June 16)","Mega Launch","LAUNCH DAY: Product Hunt + HN + Reddit + Devhunt + Peerlist + Indie Hackers + validator cascade + press live + newsletters + Eloqwnt video + Kinsella post","Zach + everyone","Planned","P0","Launch executed",""],
    ["June 2026","W3",       "Events & Hackathons","Future Alpha quant hackathon (around launch)","Zach","Confirmed","P0","Run + amplify",""],
    ["June 2026","W3",       "Features","Cubic customer story video","Zach","Active","P2","Tier 3 launch",""],
    ["June 2026","W2 onwards","Enterprise Pipeline","BDR target: 500 weekly touches","BDR","Ongoing","P0","Salesloft dashboard",""],
    ["June 2026","W2 onwards","Enterprise Pipeline","Weekly pipe-gen review (Mon) + call coaching (Wed)","Zach + BDR","Ongoing","P0","Recurring",""],
    ["June 2026","Ongoing",  "Enterprise Pipeline","Quant flagship deal — accelerate to close","Phily + Zach","Active","P0","Logo announcement",""],
    ["June 2026","Ongoing",  "Enterprise Pipeline","BDR + Zach split Eagle Alpha hackathon follow-up","BDR + Zach","Ongoing","P0","","Long-tail vs strategic top accounts"],
    ["June 2026","W4",       "Mega Launch","Launch retro + KR readouts (impressions, K-factor, waitlist→active)","Zach","Planned","P0","Retro doc",""],
    # ── JULY ──
    ["July 2026","W1-W2",    "Mega Launch","Validator wave 2 amplification","Zach","Planned","P1","",""],
    ["July 2026","W1-W2",    "Enterprise Pipeline","Inbound triage from launch (BDR + Zach split demos)","BDR + Zach","Planned","P0","",""],
    ["July 2026","W2",       "Features","Canal+ customer story video","Zach","Active","P2","Tier 3 launch",""],
    ["July 2026","W2-W3",    "Features","Model Registry + Reports/Charts polish + Citation enablement (Themed batch 3)","Olga + Zach","Planned","P1","Tier 2 launch",""],
    ["July 2026","W2",       "Community","Citation enablement on Zerve outputs","Olga","Planned","P1","",""],
    ["July 2026","Ongoing",  "SEO","Backlink push via academic preprints","Zach","Ongoing","P1","Highest-DA links available",""],
    ["July 2026","W2",       "SEO","Elicit-alternative SEO page","Zach","Planned","P1","Pre-positions Q3 partnership",""],
    ["July 2026","W3-W4",    "Partnerships","Elicit term sheet prepped (Day-1 Q3 ship)","Phily + Zach","Planned","P0","Term sheet",""],
    ["July 2026","W3-W4",    "Foundation","Pipeline-by-source dashboard (BDR / hackathon / founder-led / inbound) for deck v5","Zach","Planned","P0","Slide-ready",""],
    ["July 2026","W3-W4",    "Foundation","Series A deck v5 cleanup (slide 10 tearsheet, slide 2 citations, logo render)","Zach + Phily","Planned","P0","Investor-ready",""],
    ["July 2026","W3-W4",    "Foundation","Mid-quarter narrative refresh — what's the story?","Zach + Phily + Jason","Planned","P0","Lock September pitch",""],
    ["July 2026","Ongoing",  "Enterprise Pipeline","BDR sustains ≥30 meetings/month, ≥5 SQOs/month","BDR","Ongoing","P0","Dashboard",""],
    ["July 2026","Possible", "Events & Hackathons","Neudata London Summit (decision)","Zach","Open","P1","","Considering"],
    ["July 2026","Ongoing",  "Foundation","Diligence pack assembly (metrics, contracts, churn, cohorts)","Greg + Zach","Active","P0","",""],
    # ── AUGUST ──
    ["August 2026","Ongoing","Enterprise Pipeline","Close 3rd hedge fund logo","Phily + Zach","Active","P0","Signed",""],
    ["August 2026","Ongoing","Enterprise Pipeline","Q3 pipeline reaches $2.1M","All","Active","P0","Reported in deck",""],
    ["August 2026","Ongoing","Enterprise Pipeline","2 partnership deals signed","Phily","Active","P0","Announcements",""],
    ["August 2026","Ongoing","Partnerships","Identify 3-5 mid-size DB/data partner candidates beyond Eagle Alpha/Ravenpack/Ocient/KX","Phily + Zach","Active","P1","Shortlist","NOT Snowflake/Databricks"],
    ["August 2026","W4",    "Enterprise Pipeline","BDR 90-day review — adjust ICP if conversion poor","Zach + Phily","Planned","P1","Decision",""],
    ["August 2026","Ongoing","SEO","Continued ≥2 pieces/week + ICP-targeted content","Zach + agents","Ongoing","P1","",""],
    ["August 2026","Ongoing","Foundation","Series A close prep — final docs, references, customer calls","Phily + Greg + Zach","Active","P0","Close-ready",""],
]

for r in cal_rows:
    ws2.append(r)

apply_header_row(ws2, 9)
style_data_rows(ws2, 2, len(cal_rows)+1, 9, stream_col=3, priority_col=7)
ws2.row_dimensions[1].height = 22
set_col_widths(ws2, [14, 16, 26, 55, 26, 12, 10, 28, 38])
freeze_header(ws2)


# ═══════════════════════════════════════════════════════════════════════════
# Sheet 3 — Mega Launch
# ═══════════════════════════════════════════════════════════════════════════
ws3 = wb.create_sheet("Mega Launch")
ws3.sheet_properties.tabColor = TAB_COLORS["Mega Launch"]

def section_header(ws, text, col_count, row_num):
    ws.append([text] + [""]*(col_count-1))
    r = ws.max_row
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=col_count)
    cell = ws.cell(row=r, column=1)
    cell.fill  = PatternFill("solid", fgColor="374151")
    cell.font  = Font(bold=True, color="FFFFFF", name="Calibri", size=11)
    cell.alignment = Alignment(horizontal="left", vertical="center")
    cell.border = thin_border()

# (a) Goals
section_header(ws3, "A  |  Launch Goals", 3, 0)
ws3.append(["Metric", "Target", "Owner"])
apply_header_row(ws3, 3)

goal_rows = [
    ["Social impressions in 48 hrs",    "5M",                           "Zach + Phily"],
    ["Virality coefficient",             "K ≥ 0.8 by week 2",           "Zach"],
    ["Waitlist signups pre-launch",      "10,000",                      "Zach + Olga"],
    ["Researchers posting in 48 hrs",    "30+ across 4 domains\n(finance, bio, economics, pharma)", "Zach"],
    ["Pipeline generated from inbound",  "$300K+",                      "BDR + Zach"],
    ["Product Hunt rank",                "#1 or #2",                    "Zach"],
]
for r in goal_rows:
    ws3.append(r)

g_start = 3
g_end   = g_start + len(goal_rows) - 1
style_data_rows(ws3, g_start, g_end, 3)

ws3.append([""])  # spacer

# (b) Workback
section_header(ws3, "B  |  T-Anchored Workback  (T+0 = Tue June 16, 2026)", 5, 0)
ws3.append(["Phase", "Window", "Focus", "Key Activities", "Owner"])
wb_header_row = ws3.max_row
# apply header style
for cell in ws3[wb_header_row]:
    cell.fill      = HEADER_FILL
    cell.font      = header_font()
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border    = thin_border()

wb_rows = [
    ["T-12 to T-8", "May W1-W2",       "Foundation",     "Vision doc, top-50 researcher list, validator outreach wave 1, 4 agent use cases defined, Yoni keyword research, content production starts, STEPPS mechanics shipped, PR channel decided",                "Zach + Phily + Jason + Olga"],
    ["T-8 to T-4",  "May W3 – June W1","Build pressure",  "Confirm 1-2 researchers per domain, brief academics, identify 10-20 early access users, press embargo briefings, podcast bookings, validator wave 2, hackathon #1 (Eagle Alpha May 19), waitlist promotion, influencer outreach (Eloqwnt, Kinsella), website changes shipped, promotional offer agreed", "Zach + Phily + Olga + Simon"],
    ["T-4 to T-0",  "June W2",         "Lock down",       "Final QA, launch-day comms locked, PH/HN scheduled, influencer wave warmed, channel matrix locked",                                                                                                     "Zach + Olga"],
    ["T+0",         "Tue June 16",     "Execute",         "PH, HN, Reddit (r/MachineLearning, r/datascience, r/quant, r/genomics), Devhunt, Peerlist, Indie Hackers, validator post cascade, press live (TC + Sifted + stretch), newsletters (Ben's Bites, TLDR, Import AI), Eloqwnt video, Kinsella post, Future Alpha hackathon kickoff", "Everyone"],
    ["T+1 to T+4",  "June W4 – July W3","Compound",       "Launch retro, KR readouts, validator wave 2 amplification, mid-quarter narrative refresh, inbound triage, agent-generated blog pilot",                                                                   "Zach + Phily"],
]
for r in wb_rows:
    ws3.append(r)

wb_start = wb_header_row + 1
wb_end   = wb_start + len(wb_rows) - 1
style_data_rows(ws3, wb_start, wb_end, 5)
for row_idx in range(wb_start, wb_end + 1):
    ws3.row_dimensions[row_idx].height = 60

ws3.append([""])  # spacer

# (c) Channel matrix
section_header(ws3, "C  |  Channel-by-Launch-Type Matrix", 2, 0)
ws3.append(["Launch Type", "Primary Channels"])
ch_header_row = ws3.max_row
for cell in ws3[ch_header_row]:
    cell.fill      = HEADER_FILL
    cell.font      = header_font()
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border    = thin_border()

ch_rows = [
    ["Validated research publications", "LinkedIn (validator-led), X, academic Twitter, newsletters (Import AI)"],
    ["Early access cohort showcase",    "Devpost, Peerlist, Indie Hackers, Reddit r/MachineLearning"],
    ["General launch",                  "Product Hunt, Hacker News, Devhunt"],
    ["PR",                              "TechCrunch, Sifted, The Information warm-up"],
    ["Hackathon-tied",                  "Future Alpha, Eagle Alpha follow-up"],
]
for r in ch_rows:
    ws3.append(r)

ch_start = ch_header_row + 1
ch_end   = ch_start + len(ch_rows) - 1
style_data_rows(ws3, ch_start, ch_end, 2)

set_col_widths(ws3, [28, 30, 55, 55, 30])
freeze_header(ws3)
# Row heights for goal rows
for i in range(g_start, g_end+1):
    ws3.row_dimensions[i].height = 30


# ═══════════════════════════════════════════════════════════════════════════
# Sheet 4 — Enterprise Pipeline & BDR
# ═══════════════════════════════════════════════════════════════════════════
ws4 = wb.create_sheet("Enterprise Pipeline & BDR")
ws4.sheet_properties.tabColor = TAB_COLORS["Enterprise Pipeline & BDR"]

# (a) Outbound targets
section_header(ws4, "A  |  Outbound Targets", 4, 0)
ws4.append(["Channel", "Target", "Cadence", "Owner"])
for cell in ws4[ws4.max_row]:
    cell.fill = HEADER_FILL; cell.font = header_font()
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = thin_border()

ot_rows = [
    ["BDR outbound",    "500 calls/emails/LIs per week", "From mid-June",        "BDR"],
    ["Zach outbound",   "200 emails/LIs per week",       "Ongoing from May W1",  "Zach"],
    ["Phily outbound",  "100 emails/LIs per week",       "Ongoing from May W1",  "Phily"],
    ["Jason outbound",  "100 emails/LIs per week",       "Ongoing from May W1",  "Jason"],
    ["Greg outbound",   "100 emails/LIs per week",       "Ongoing from May W1",  "Greg"],
]
for r in ot_rows:
    ws4.append(r)
ot_s = ws4.max_row - len(ot_rows) + 1; ot_e = ws4.max_row
style_data_rows(ws4, ot_s, ot_e, 4)

ws4.append([""])

# (b) BDR ramp
section_header(ws4, "B  |  BDR Ramp Targets", 3, 0)
ws4.append(["Period", "Activity Target", "Outcome Target"])
for cell in ws4[ws4.max_row]:
    cell.fill = HEADER_FILL; cell.font = header_font()
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = thin_border()

ramp_rows = [
    ["Week 1 (June W1)",   "Onboarding, product training, shadowing",                    "Tools live, ICP understood"],
    ["Weeks 2-4 (June)",   "Sequences live; 250 touches/wk ramping to 500",              "20-30 meetings booked in June"],
    ["Month 2 (July)",     "500 touches/wk sustained",                                   "≥30 meetings booked, ≥5 SQOs"],
    ["Month 3 (August)",   "500 touches/wk sustained",                                   "≥30 meetings booked, ≥5 SQOs, first SQO closed/late-stage"],
]
for r in ramp_rows:
    ws4.append(r)
ramp_s = ws4.max_row - len(ramp_rows) + 1; ramp_e = ws4.max_row
style_data_rows(ws4, ramp_s, ramp_e, 3)

ws4.append([""])

# (c) ICP
section_header(ws4, "C  |  ICP — First 90 Days", 2, 0)
icp_bullets = [
    ["• US-based", ""],
    ["• Hedge funds + multi-strats only", ""],
    ["• No prop trading, family offices, or non-US HFs in first 90 days", ""],
    ["• Re-evaluate at month 3", ""],
]
for r in icp_bullets:
    ws4.append(r)
icp_s = ws4.max_row - len(icp_bullets) + 1; icp_e = ws4.max_row
style_data_rows(ws4, icp_s, icp_e, 2)

ws4.append([""])

# (d) Sales tech stack
section_header(ws4, "D  |  Sales Tech Stack", 3, 0)
ws4.append(["Tool", "Purpose", "Status"])
for cell in ws4[ws4.max_row]:
    cell.fill = HEADER_FILL; cell.font = header_font()
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = thin_border()

stack_rows = [
    ["Alta",                      "(TBC primary use)",            "Procuring May W1-W2"],
    ["Clay",                      "Account list enrichment",      "Procuring May W1-W2"],
    ["Zoom",                      "Meetings",                     "Live"],
    ["Fathom",                    "Call recording / coaching",    "Procuring May W1-W2"],
    ["Apollo",                    "Data",                         "Procuring May W1-W2"],
    ["LinkedIn Sales Navigator",  "Prospecting",                  "Procuring May W1-W2"],
    ["Nooks",                     "Parallel dialler",             "Procuring May W1-W2"],
    ["HubSpot (existing)",        "CRM",                          "Live, needs cleanup"],
]
for r in stack_rows:
    ws4.append(r)
stack_s = ws4.max_row - len(stack_rows) + 1; stack_e = ws4.max_row
style_data_rows(ws4, stack_s, stack_e, 3)

ws4.append([""])

# (e) BDR docs
section_header(ws4, "E  |  BDR Documentation Deliverables", 3, 0)
ws4.append(["Document", "Owner", "Deadline"])
for cell in ws4[ws4.max_row]:
    cell.fill = HEADER_FILL; cell.font = header_font()
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = thin_border()

doc_rows = [
    ["ICP one-pager",                                           "Zach + Phily",  "May W2"],
    ["Account list (250-500 with role names)",                  "Zach",          "May W2-W3"],
    ["Sales tech stack provisioned",                            "Zach + Greg",   "May W4"],
    ["Competitor doc",                                          "Zach",          "May W2-W3"],
    ["Battlecards & positioning",                               "Zach",          "May W3"],
    ["Onboarding plan + week-1 schedule",                       "Zach",          "May W4"],
    ["3 outbound sequences (cold / warm-back / Eagle Alpha)",   "Zach",          "May W3-W4"],
    ["Sales enablement pack v1 (1-pagers + demo deck)",         "Zach + Phily",  "May W3-W4"],
]
for r in doc_rows:
    ws4.append(r)
doc_s = ws4.max_row - len(doc_rows) + 1; doc_e = ws4.max_row
style_data_rows(ws4, doc_s, doc_e, 3)

ws4.append([""])

# (f) Comp
section_header(ws4, "F  |  BDR Comp Structure", 2, 0)
comp_rows = [
    ["Base salary",      "~$75K"],
    ["OTE (variable)",   "$35K (SQO-weighted accelerators above quota)"],
    ["Sign-off",         "Greg by May W2"],
]
for r in comp_rows:
    ws4.append(r)
comp_s = ws4.max_row - len(comp_rows) + 1; comp_e = ws4.max_row
style_data_rows(ws4, comp_s, comp_e, 2)

set_col_widths(ws4, [38, 44, 26, 20])
freeze_header(ws4)


# ═══════════════════════════════════════════════════════════════════════════
# Sheet 5 — Implications
# ═══════════════════════════════════════════════════════════════════════════
ws5 = wb.create_sheet("Implications")
ws5.sheet_properties.tabColor = TAB_COLORS["Implications"]

ws5.append(["Function", "Activity", "Trigger", "Owner", "Window"])
apply_header_row(ws5, 5)

def impl_section(ws, func_label):
    """Insert a light section-divider row."""
    ws.append([func_label, "", "", "", ""])
    r = ws.max_row
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
    cell = ws.cell(row=r, column=1)
    cell.fill  = PatternFill("solid", fgColor="E5E7EB")
    cell.font  = Font(bold=True, color="1F2937", name="Calibri", size=10)
    cell.alignment = Alignment(horizontal="left", vertical="center")
    cell.border = thin_border()

impl_section(ws5, "WEB DEV  (Olga + Simon)")
web_rows = [
    ["Web dev",    "Onboard Simon (replace Miroslav)",                                    "Foundation",        "Jason",          "May W1"],
    ["Web dev",    "Self-evolving agent landing page + waitlist flow",                    "Mega Launch",       "Olga + Simon",   "May W3"],
    ["Web dev",    "New product pages, home page update, pricing pages",                  "Mega Launch",       "Olga + Simon",   "May W4"],
    ["Web dev",    "STEPPS mechanics (referral + invite badges)",                         "Mega Launch",       "Olga",           "May W3-W4"],
    ["Web dev",    "Research publications page",                                          "Community",         "Olga",           "May W3-W4"],
    ["Web dev",    "Public notebook embeds + 'Built with Zerve' badge",                   "Community",         "Olga",           "June W2"],
    ["Web dev",    "Event landing pages (Eagle Alpha, Future Alpha, Neudata)",            "Events",            "Olga + Simon",   "As needed"],
    ["Web dev",    "Conference + partner pages updated post-launch",                      "Multiple",          "Olga + Simon",   "Rolling"],
    ["Web dev",    "Citation enablement",                                                 "Community",         "Olga",           "July"],
]
for r in web_rows:
    ws5.append(r)

impl_section(ws5, "DESIGN  (Olga)")
design_rows = [
    ["Design",     "Design specs for Simon",                                              "Foundation",        "Olga",           "May W2 (blocking)"],
    ["Design",     "Customer story video assets (Hearst, Cubic, Canal+)",                "Features",          "Olga",           "May–July"],
    ["Design",     "Mega launch creative (PH assets, social cards, validator templates)","Mega Launch",       "Olga",           "May W4 onwards"],
    ["Design",     "Sales enablement pack design",                                       "Enterprise Pipeline","Olga",          "May W3-W4"],
]
for r in design_rows:
    ws5.append(r)

impl_section(ws5, "CONTENT PRODUCTION  (Zach + agents)")
content_rows = [
    ["Content",    "15-20 launch-window pieces",                                         "Mega Launch + SEO", "Zach + agents",  "May W2-W4"],
    ["Content",    "BDR enablement (battlecards, ICP one-pager, sequences)",             "Enterprise Pipeline","Zach",          "May"],
    ["Content",    "Customer case studies × 2",                                          "Enterprise Pipeline","Zach + Phily",  "May W3-W4"],
    ["Content",    "Series A deck v5",                                                   "Foundation",        "Zach + Phily",   "July W3-W4"],
    ["Content",    "Sustained content cadence ≥2/week",                                  "SEO",               "Zach + agents",  "June–August"],
]
for r in content_rows:
    ws5.append(r)

impl_section(ws5, "FOUNDER CONTENT CADENCE")
founder_rows = [
    ["Founder cadence","Jason 1× LinkedIn post per week",                                "Community",         "Jason",          "May onwards"],
    ["Founder cadence","Phily 1× LinkedIn post per week",                                "Community",         "Phily",          "May onwards"],
    ["Founder cadence","Phily mid-quarter narrative refresh",                            "Foundation",        "Phily",          "July W4"],
]
for r in founder_rows:
    ws5.append(r)

impl_section(ws5, "FOUNDATION / OPS")
ops_rows = [
    ["Foundation", "Onboard Simon",                                                       "Foundation",        "Jason",          "May W1"],
    ["Foundation", "BDR onboarding + tooling live",                                      "Enterprise Pipeline","Zach",          "June 1"],
    ["Foundation", "Finance + ops diligence prep (data room skeleton)",                  "Foundation",        "Greg",           "May–June"],
    ["Foundation", "Diligence pack assembly (metrics, contracts, churn, cohorts)",       "Foundation",        "Greg + Zach",    "July"],
    ["Foundation", "Series A deck v5 final",                                             "Foundation",        "Zach + Phily",   "July W3-W4"],
]
for r in ops_rows:
    ws5.append(r)

# Style all data rows (skip section-divider rows)
total_rows = ws5.max_row
for row_idx in range(2, total_rows + 1):
    cell_a = ws5.cell(row=row_idx, column=1)
    # skip section dividers (merged cells with grey fill)
    if cell_a.fill.fgColor.rgb == "FFE5E7EB":
        continue
    alt = row_idx % 2 == 0
    fill = ALT_FILL if alt else WHITE_FILL
    for col_idx in range(1, 6):
        cell = ws5.cell(row=row_idx, column=col_idx)
        cell.border    = thin_border()
        cell.alignment = Alignment(vertical="top", wrap_text=True)
        cell.font      = normal_font()
        if cell.fill.fgColor.rgb in ("00000000", "FFFFFFFF", "FFF9FAFB"):
            cell.fill = fill

set_col_widths(ws5, [22, 55, 26, 22, 20])
freeze_header(ws5)


# ── Row heights for readability on multi-line cells ─────────────────────
for ws in [ws2, ws3, ws4, ws5]:
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            if cell.value and "\n" in str(cell.value):
                ws.row_dimensions[cell.row].height = 45


# ── Save ────────────────────────────────────────────────────────────────
output_path = "Zerve_Q2_2026_Plan.xlsx"
wb.save(output_path)
print(f"Saved: {output_path}")

# ── Verification ─────────────────────────────────────────────────────────
sheets = [ws1, ws2, ws3, ws4, ws5]
names  = ["Overview", "Q2 Calendar", "Mega Launch", "Enterprise Pipeline & BDR", "Implications"]
for ws, name in zip(sheets, names):
    data_rows = ws.max_row - 1  # minus header
    print(f"  {name}: {ws.max_row} total rows ({data_rows} data rows)")
