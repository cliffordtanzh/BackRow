import streamlit as st

import json

from src.texts import *
from src.utils import format_url, update_score
from src.counter import Counter


def load_video(column):
    lang = st.session_state["lang"]
    column.text_input(url_prompt[lang])
    url = "https://www.youtube.com/watch?v=y84IV__hzhQ"
    if url != "":
        column.video(format_url(url))


def load_tracker(column):
    lang = st.session_state["lang"]
    stat_headers = st.session_state["stat_headers"]

    st.session_state["match_total"] = column.empty()
    update_score()
    
    left, mid, right = column.columns(3)
    for header in stat_headers["score"]:
        with left.container(border = True):
            counter = Counter(
                header, 
                lang, 
                text_color = "green",
                page = "team",
            )
            counter.render()

    for i, header in enumerate(stat_headers["lost"]):
        col = mid if i > 3 else right
        
        with col.container(border = True):
            counter = Counter(
                header, 
                lang, 
                text_color = "red",
                page = "team",
            )
            counter.render()


def main():
    st.set_page_config(layout = "wide")
    lang = "cn" if st.toggle("中文") else "en"
    st.title(header[lang])

    st.session_state["stat_headers"] = json.load(open("src/stat_headers.json", "r"))
    st.session_state["lang"] = lang

    left, right = st.columns(2)
    print(list(st.session_state.keys()))
    load_video(left)
    load_tracker(right)


if __name__ == "__main__":
    main()

