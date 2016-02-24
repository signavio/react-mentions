export default (props={}) => ({
    control: {
        backgroundColor: "#fff",

        fontSize: 12,
        fontWeight: "normal",

        ...(props.singleLine
            ? {
                display: "inline-block",

                width: 130,
            }
            : {
                fontFamily: "monospace",

                border: "1px solid silver",
            }
        )
    },
    highlighter: {
        ...(props.singleLine
            ? {
                padding: 1,
                border: "2px inset transparent",
            }
            : {
                padding: 9,
            }
        ),
    },
    textarea: {
        padding: 9,
        minHeight: 63,
        outline: 0,
        border: 0,
        margin: 0,
    },
    input: {
        padding: 1,
        margin: 0,
        border: "2px inset",
    },
    suggestions: {
        border: "1px solid rgba(0,0,0,0.15)",
        fontSize: 10,

        item: {
            padding: "5px 15px",
            borderBottom: "1px solid rgba(0,0,0,0.15)",

            "&focused": {
                backgroundColor: "#cee4e5",
            }
        }
    }
});
