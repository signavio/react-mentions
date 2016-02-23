import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";

import { MentionsInput, Mention } from "../src";

describe("MentionsInput", () => {

    let node;

    beforeEach(() => {
        node = mount(
            <MentionsInput>
                <Mention />
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

});
