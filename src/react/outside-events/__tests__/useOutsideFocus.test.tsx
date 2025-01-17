import * as React from "react";
import { useOutsideFocus } from "../useOutsideFocus";
import { render, fireEvent } from "@testing-library/react";

const renderTestEl = (enable: boolean) => {
	// eslint-disable-next-line react/display-name
	const El = React.forwardRef((_, ref) => {
		const currentRef = React.useRef();
		const handleFn = jest.fn();

		useOutsideFocus(currentRef, enable, handleFn);

		React.useImperativeHandle(ref, () => ({
			handleFn
		}));

		return (
			<div data-testid={"parent"}>
				<div data-testid={"side"} />
				<div data-testid={"main"} ref={currentRef} />
			</div>
		);
	});

	const ref = React.createRef<{ handleFn: jest.Mock }>();
	const props = render(<El ref={ref} />);
	const sideEl = props.getByTestId("side");
	const mainEl = props.getByTestId("main");
	const parentEl = props.getByTestId("parent");

	return {
		sideEl,
		mainEl,
		parentEl,
		currentRef: ref.current,
		...props
	};
};

describe("useOutsideFocus", () => {
	test("handles clicks on the inside", () => {
		const { mainEl, currentRef } = renderTestEl(true);
		fireEvent.focusIn(mainEl);
		expect(currentRef.handleFn).not.toHaveBeenCalled();
	});

	test("handles clicks on the outside", () => {
		const { sideEl, currentRef } = renderTestEl(true);
		fireEvent.focusIn(sideEl);
		expect(currentRef.handleFn).toHaveBeenCalled();
	});

	test("disabled properly", () => {
		const { sideEl, currentRef } = renderTestEl(false);
		fireEvent.focusIn(sideEl);
		expect(currentRef.handleFn).not.toHaveBeenCalled();
	});
});
