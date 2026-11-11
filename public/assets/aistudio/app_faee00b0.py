import streamlit as st
from data import PROGRAMS
from classes import StudentPlanner

st.set_page_config(page_title="Course Plan Visualizer", page_icon="🎓", layout="wide")

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@400;600;700&family=Oswald:wght@300;500&display=swap');
    
    /* page */
    .stApp {
        background-color: #FFFFFF !important; /* white */
        color: #000000 !important; /* black */
        font-family: 'Merriweather Sans', 'Georgia', serif !important;
    }
    
    /* content headings */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Oswald', 'Merriweather Sans', sans-serif !important;
        color: #000000 !important; /* black */
        letter-spacing: 0.02em;
    }
    h1 {
        border-bottom: 3px solid #BA0C2F; /* bulldog red */
        padding-bottom: 0.35rem;
    }
    
    /* body text */
    p, li, span, label, div[data-testid="stMarkdownContainer"] {
        color: #000000 !important; /* black */
    }
    
    /* sidebar (cosmetic — no sidebar widgets yet, but harmless) */
    section[data-testid="stSidebar"] {
        background-color: #F2F2F2 !important; /* light grey */
        border-right: 1px solid #DEDEDE; /* light grey (border) */
    }
    
    /* progress bar */
    div[data-testid="stProgress"] > div > div > div {
        background-color: #E4002B !important; /* glory red */
    }
    
    /* tabs */
    .stTabs [data-baseweb="tab-list"] {
        border-bottom: 1px solid #DEDEDE; /* light grey (border) */
    }
    
    .stTabs [data-baseweb="tab"] {
        font-family: 'Oswald', sans-serif !important;
        color: #666666 !important; /* dark grey */
        font-weight: 400;
    }
    
    .stTabs [aria-selected="true"] {
        color: #BA0C2F !important; /* bulldog red */
        border-bottom: 2px solid #BA0C2F !important; /* bulldog red */
        font-weight: 500;
    }
    
    /* selectbox / input widgets */
    div[data-baseweb="select"] > div,
    div[data-baseweb="input"] > div {
        background-color: #FFFFFF !important; /* white */
        border-color: #DEDEDE !important; /* light grey (border) */
        color: #000000 !important; /* black */
    }
    
    div[data-baseweb="select"]:focus-within > div,
    div[data-baseweb="input"]:focus-within > div {
        border-color: #BA0C2F !important; /* bulldog red */
        box-shadow: 0 0 0 1px #BA0C2F !important; /* bulldog red */
    }
    
    /* multiselect pills */
    span[data-baseweb="tag"] {
        background-color: #BA0C2F !important; /* bulldog red */
        color: #FFFFFF !important; /* white */
        border: none !important;
    }
    
    /* horizontal rule (st.divider) */
    hr {
        border-color: #DEDEDE !important; /* light grey */
    }
    
    /* caption text */
    [data-testid="stCaptionContainer"] {
        color: #666666 !important; /* dark grey */
        font-family: 'Merriweather Sans', sans-serif !important;
    }
    
    /* alerts (st.success / st.info) */
    div[data-testid="stAlert"] {
        border-radius: 4px;
        border-left: 4px solid #BA0C2F; /* bulldog red */
    }
    """,
    unsafe_allow_html=True,
)

st.title("UGA Computing Course Plan Visualizer 🐾")
st.markdown("Select your program, check off completed courses, and instantly track your path to graduation!")

# program selector
prog_name = st.selectbox("Select Program", list(PROGRAMS.keys()))
program = PROGRAMS[prog_name]

# initialize or reset planner state on program switch
if "current_program" not in st.session_state or st.session_state.current_program != prog_name:
    st.session_state.planner = StudentPlanner(program)
    st.session_state.current_program = prog_name
    st.session_state.req_sel = []
    st.session_state.elec_sel = []

planner = st.session_state.planner
all_codes = list(program.courses.keys())

# user inputs
col1, col2 = st.columns(2)

with col1:
    satisfied = st.multiselect(
        "Required Courses (Completed)",
        all_codes,
        key="req_sel",
    )

with col2:
    st.multiselect(
        "Electives (Completed)",
        list(program.electives.keys()),
        format_func=lambda c: f"{c}",
        key="elec_sel",
    )

# sync planner state from widgets
planner.update_status(satisfied)
planner.set_electives(st.session_state.elec_sel)

st.divider()

# METRICS
total_required = len(program.courses)
satisfied_count = len(satisfied)

elec_count = planner.get_electives_count()
elec_req = program.electives_required
elec_credits = planner.get_elective_credits()
# cap counted electives at the requirement so extras don't push the bar past 100%
counted_electives = min(elec_count, elec_req)

# unified progress: required courses + counted electives
total_items = total_required + elec_req
completed_items = satisfied_count + counted_electives
overall_pct = completed_items / total_items if total_items else 0

st.subheader("Degree Progress")
st.progress(overall_pct)
st.write(f"**Overall:** {completed_items}/{total_items} requirements met ({overall_pct*100:.1f}%)")
st.caption(
    f"Required courses: {satisfied_count}/{total_required} | "
    f"Electives: {counted_electives}/{elec_req}"
)

# TABS
tab1, tab2, tab3 = st.tabs(
    ["Remaining Courses", "Unlocked (Ready to Take)", "Full Catalog Status"]
)

unlocked = planner.get_unlocked_remaining()
unlocked_codes = set(unlocked.keys())
unlocked_electives = planner.get_unlocked_electives()

with tab1:
    st.subheader("Required Courses Left to Complete")
    remaining = planner.get_remaining()
    if not remaining:
        st.success("🎉 You've completed all core courses in this degree program!")
    else:
        for code, course in remaining.items():
            ready = code in unlocked_codes
            status = "🟢 UNLOCKED" if ready else "🔒 LOCKED (Missing Prereqs)"
            st.markdown(f"**{code}: {course.name}** ({course.credits} credits) — {status}")
            if course.prereqs:
                missing = [p for p in course.prereqs if p not in planner.completed]
                if missing:
                    st.caption(f"Prerequisites: {', '.join(course.prereqs)} — missing: {', '.join(missing)}")
                else:
                    st.caption(f"Prerequisites: {', '.join(course.prereqs)}")

    st.subheader("Electives Left to Choose from")
    if elec_req and elec_count >= elec_req:
        extra = elec_count - elec_req
        extra_note = f" (+{extra} extra)" if extra > 0 else ""
        st.success(f"🎉 Elective requirement met — {elec_count} electives{extra_note}, {elec_credits} credits.")
    else:
        st.markdown(
            f"*{elec_count}/{elec_req} electives selected — "
            f"choose {elec_req - elec_count} more from the catalog below.*"
        )

        satisfied_now = planner.completed
        for code, course in program.electives.items():
            if code in planner.selected_electives:
                continue

            missing = [p for p in course.prereqs if p not in satisfied_now]
            if missing:
                status = "🔒 LOCKED (Missing Prereqs)"
            else:
                status = "🟢 UNLOCKED"

            st.markdown(
                f"**{code}: {course.name}** ({course.credits} credits) — {status}"
            )
            if course.prereqs:
                if missing:
                    st.caption(
                        f"Prerequisites: {', '.join(course.prereqs)} — "
                        f"missing: {', '.join(missing)}"
                    )
                else:
                    st.caption(f"Prerequisites: {', '.join(course.prereqs)}")

with tab2:
    st.subheader("Unlocked & Available Next Semester")

    st.markdown("**Required-**")
    if not unlocked:
        st.info("‼️ No required courses currently unlocked. Complete more prerequisites to unlock new classes.")
    else:
        for code, course in unlocked.items():
            st.markdown(f"👾 **{code}: {course.name}** — *{course.credits} credits*")

    st.markdown("**Electives-**")
    if not unlocked_electives:
        st.info("No electives available — all selected, or prerequisites not yet met.")
    else:
        for code, course in unlocked_electives.items():
            st.markdown(f"👾 **{code}: {course.name}** — *{course.credits} credits*")

with tab3:
    st.subheader(f"Complete Program Curriculum — {program.name}")

    st.markdown("**Required Courses**")
    for code, course in program.courses.items():
        if code in planner.completed:
            state_label = "✅ Completed"
        else:
            state_label = "⏳ Remaining"
        st.write(f"- **{code}**: {course.name} — *{state_label}*")

    st.markdown("**Electives**")
    if not program.electives:
        st.write("_No electives defined for this program yet._")
    else:
        for code, course in program.electives.items():
            if code in planner.selected_electives:
                st.write(f"- **{code}**: {course.name} — *✅ Completed*")
            else:
                st.write(f"- **{code}**: {course.name}")
