import streamlit as st


def format_url(input_url):
    if "https" not in input_url:
        return "https://" + input_url
    
    return input_url


def update_score():
    if "score" not in st.session_state["stat_headers"]:
        return

    own_score = 0
    opp_score = 0

    for header in st.session_state["stat_headers"]["score"]:
        text = header["en"]
        value_key = f"team_{text}_value"
        if value_key not in st.session_state:
            continue

        own_score += st.session_state[value_key]

    for header in st.session_state["stat_headers"]["lost"]:
        text = header["en"]
        value_key = f"team_{text}_value"
        if value_key not in st.session_state:
            continue

        opp_score += st.session_state[value_key]

    st.session_state["match_total"].subheader(
        f"{own_score} vs {opp_score}",
        text_alignment = "center"
    )