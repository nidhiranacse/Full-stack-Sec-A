import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../src/store/store";
import App from "../src/App";

test("CampusConnect app renders", () => {
    render(
        <Provider store={store}>
            <App />
        </Provider>
    );

    expect(
        screen.getByText("CampusConnect")
    ).toBeInTheDocument();
});