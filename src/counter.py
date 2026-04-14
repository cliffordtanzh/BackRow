import streamlit as st
from .utils import update_score


class Counter:
    def __init__(self, key, lang, text_color, page, initial_value = 0):
        self.key = key
        self.label = key[lang]
        self.lang = lang
        self.text_color = text_color
        self.page = page

        self.value_key = f"{page}_{self.key['en']}_value"

        if self.value_key not in st.session_state:
            st.session_state[self.value_key] = initial_value

    @property
    def value(self):
        return st.session_state[self.value_key]

    def increment(self):
        st.session_state[self.value_key] += 1
        update_score()

    def decrement(self):
        if st.session_state[self.value_key] > 0:
            st.session_state[self.value_key] -= 1

        update_score()
        
    def render(self):
        st.markdown(
            """
            <style>
            div[data-testid="stButton"] > button {
                height: 1.6rem !important;
                min-height: 1.6rem !important;
                padding-top: 0rem !important;
                padding-bottom: 0rem !important;
                line-height: 1 !important;
            }
            </style>
            """,
            unsafe_allow_html = True,
        )

        if self.text_color is not None:
            st.write(f":{self.text_color}[{self.label}]")
        else:
            st.write(self.label)


        left, mid, right = st.columns(
            [1, 2, 1], 
            vertical_alignment = "center", 
            gap = "small"
        )

        with left:
            st.button(
                "+",
                key = f"{self.value_key}_inc",
                on_click = self.increment,
                width = "stretch",
            )

        with mid.container(border = True, gap = None):
            st.markdown(
                f"""
                <div style="
                    height: 1.6rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: -0.02em;
                    line-height: 1;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                ">
                    {self.value}
                </div>
                """,
                unsafe_allow_html = True,
            )

        with right:
            st.button(
                "-",
                key = f"{self.value_key}_dec",
                on_click = self.decrement,
                width = "stretch",
            )