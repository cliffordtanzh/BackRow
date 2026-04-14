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

    columns = column.columns(4)

    for col, header, section in zip(columns, player_stats, stat_headers.keys()):
        col.markdown("##### " + header[lang])
        for header in stat_headers[section]:
            with col.container(border = True):
                text_color = "red" if "error" in section else "green"
                counter = Counter(
                    header, 
                    lang, 
                    page = "player",
                    text_color = text_color,
                )
                counter.render()


def main():
    st.set_page_config(layout = "wide")
    lang = "cn" if st.toggle("中文") else "en"
    st.title(header[lang])

    st.session_state["stat_headers"] = json.load(open("src/player_headers.json", "r"))
    st.session_state["lang"] = lang

    left, right = st.columns(2)
    load_video(left)
    load_tracker(right)


if __name__ == "__main__":
    main()

