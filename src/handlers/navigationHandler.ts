import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory, DataLoaderFactory } from "@itsy-ui/core";

// retrieve the DataLoaderFactory singleton
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
// retrieve the custom state machine provider
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");

// this function is called whenever a record is selected in the grid
function doMasterGridSelectedRowsDone(evt: any) {
    return (getState: any, dispatch: any, transition: any) => {
        const selectedRows = evt.selectedRows;

        // get the selected record and navigate to the details page
        transition({
            type: "NAVIGATE_URL",
            url: `/details?id=${selectedRows[0].id}`,
        });

        // always end the transition, for this event, we need to transition to GRID_SELECTED_ROWS_DONE
        transition({
         type: "GRID_SELECTED_ROWS_DONE",
         controlID: "master_details",
         strict: true,
         selectedRows: evt.selectedRows,
        });
    };
}

// Define the custom state machine override object.
// implements the ICustomStateMachineData interface.
const tabsGrid: ICustomStateMachineData = {
    stateJSON: {
        "states": {
            // State overrides are possible if the widget has that state declared already.
            // gridSelectedRows state is defined in ItsyGrid.
            "gridSelectedRows": {
                "onEntry": [
                    // define a custom "onEntry" that calls the mapDispatchToAction as defined below
                    "onMasterGridSelectedRowsDone",
                ],
                "on": {
                    "GRID_SELECTED_ROWS_DONE": "gridSelectedRowsDone",
                },
            },
        },
    },
    mapDispatchToAction: (dispatch) => {
        return {
            // Define a mapping action to implement business logic
            // whenever there is a change of state.
            onMasterGridSelectedRowsDone: (evt) => dispatch(doMasterGridSelectedRowsDone(evt)),
        };
    },
};

// register the custom override with Control Name, ContextPath in which the
// override needs to occur and the ICustomStateMachineData object.
customStateProvider.registerCustomStateMachine("GridWidget", { "id": "master_details" }, tabsGrid);
