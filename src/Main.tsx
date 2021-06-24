import {
    Switch,
    useHistory,
    Route
} from "react-router-dom";
import { useTransition } from "@itsy-ui/core";
import Home from './pages/Home';
import Details from './pages/Details';
import { useEffect } from "react";
import { ItsyProvider } from "@itsy-ui/app";

// Application action definitions
const Actions = {
    State: {
        NAVIGATE_URL: "NAVIGATE_URL",
        NAVIGATION_DONE: "NAVIGATION_DONE",
        INITIALIZE_DONE: "INITIALIZE_DONE",
        INITIALIZE: "INITIALIZE"
    },
    INIT: "Actions.INIT"
};

// application state
const initialState = {
    history: null
};

function reducer(state, action) {
    switch (action.type) {
        case Actions.INIT:
            return {
                ...state,
                history: action.history
            }
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

/**
 * Action triggered once when the application is initialized
 */
function doInit(event) {
    return (getState, dispatch, transition) => {
        dispatch({
            type: Actions.INIT,
            history: event.history
        });
        transition({
            type: Actions.State.INITIALIZE_DONE,
        });
    };
}

/**
 * Transition pattern for navigating to another URL. It uses history object to push the URL.
 * @param event - contains the URL to navivate
 * @returns void
 */
function doNavigateUrl(event) {
    return (getState, dispatch, transition) => {
        const { history } = getState();
        history.push(event.url);
        transition({
            type: Actions.State.NAVIGATION_DONE,
        });
    };
}

/**
 * StateJSON for application instance. Typically, application transitions are appicable for all pages,
 * For instance, navigating to another page, or showing a progress notification.
 */
const stateJSON = {
    "initial": "onLoaded",
    "states": {
        "onLoaded": {
            "on": {
                "INITIALIZE": "init",
                "NAVIGATE_URL": "navigateUrl"
            },
        },
        "init": {
            "onEntry": [
                "onInit",
            ],
            "on": {
                "INITIALIZE_DONE": "onLoaded",
            },
        },
        "navigateUrl": {
            "onEntry": [
                "onNavigateUrl",
            ],
            "on": {
                "NAVIGATION_DONE": "onLoaded",
            },
        }
    },
};

/**
 * Define the dispatcher to props, and these functions are available with useTransition hook.
 * @param dispatch - Dispatcher for actions
 * @returns Dispatcher object that is used by ItsyUI widget
 */
const mapDispatchToProps = (dispatch) => {
    return {
        onNavigateUrl: (event) => dispatch(doNavigateUrl(event)),
        onInit: (event) => dispatch(doInit(event))
    };
};

export const Main: React.FC = (props: any) => {
    const history = useHistory();
    const [state, transition]: any[] = useTransition("Main", reducer, mapDispatchToProps, stateJSON);
    useEffect(() => {
        transition({
            type: Actions.State.INITIALIZE,
            history
        });
    }, []);
    return (
        <ItsyProvider>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/details" component={Details} />
            </Switch>
        </ItsyProvider>
    );
};