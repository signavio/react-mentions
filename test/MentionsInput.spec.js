import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";

import { MentionsInput, Mention } from "../src";

const data = [
    { id: "first", value: "First entry" },
    { id: "second", value: "Second entry" }
];

describe("MentionsInput", () => {

    let node;

    beforeEach(() => {
        node = mount(
            <MentionsInput>
                <Mention
                    trigger="@"
                    data={ data } />
            </MentionsInput>
        );
    });

    it("should render a textarea by default.", () => {
        expect(node.find("textarea")).to.have.length(1);
        expect(node.find("input")).to.have.length(0);
    });

    it("should render a regular input when singleLine is set to true.", () => {
        node.setProps({
            singleLine: true
        });

        expect(node.find("textarea")).to.have.length(0);
        expect(node.find("input")).to.have.length(1);
    });

    it("should show a list of suggestions once the trigger key has been entered.");
    it("should be possible to navigate through the suggestions with the up and down arrows.");
    it("should be possible to select a suggestion with enter.");
    it("should be possible to close the suggestions with esc.");

    it('should be able to handle sync responses from multiple mentions sources', () => {
        const wrapper = mount(
            <MentionsInput value="@">
                <Mention trigger="@" type="testentries" data={data} />
                <Mention
                    trigger="@"
                    type="testchars"
                    data={[ { id: "a", value: "A" }, { id: "b", value: "B" } ]}
                />
            </MentionsInput>
        )

        wrapper.find("textarea").simulate('focus')
        wrapper.find("textarea").simulate('select', {
            target: { selectionStart: 1, selectionEnd: 1 }
        })

        expect(wrapper.find('SuggestionsOverlay').find('Suggestion')).to.have.length(4)
    })

});
