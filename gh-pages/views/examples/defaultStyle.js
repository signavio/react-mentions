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
        backgroundColor: "white",
        marginTop: 14,
        fontSize: 10,
        minWidth: 100,

        list: {
            margin: 0,
            padding: 0,
            listStyleType: "none",
        },
        item: {
            padding: "5px 15px",
            cursor: "pointer",
            borderBottom: "1px solid rgba(0,0,0,0.15)",

            "&focussed": {
                backgroundColor: "#cee4e5",
            }
        }
    }
});
