import React from "react";
import { BarChart } from "../../charts";
import { ShiftsData } from "./ShiftsData";

// Colors
const purple = "#5c00b8";
const lightTeal = "#00ebeb";
const darkTeal = "#009e9e";
const lightPink = "#eb00eb";
const darkPink = "#b200b2";

export const Shifts = () => {

    // Data for bar chart -------------------------------------------------------------------------------------

    let barData = ShiftsData.filter((item) => { return item.description !== "Total Shifts Posted "})

    const shiftsData = {
        labels: barData.map((data) => data.description),
        datasets: [{
            label: "Shifts",
            data: barData.map((data) => data.qty),
            backgroundColor: [
                purple, darkPink, lightPink, lightTeal, darkTeal
            ],
        }]
    }

    // Return ----------------------------------------------------------------------------------------------------

    return (
        <div className="row d-flex d-inline-flex justify-content-between" style={{ width: "100%" }}>
            {/* Left Column Starts */}
            <div className="col">
                <div className="row d-flex flex-column justify-content-between">
                    {/* Shifts Table Starts */}
                    <div className="col text-center">
                        <h2 className="mb-4">Shifts Table</h2>

                        <table className="table table-bordered text-center">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col"><h3 className="m-0">Description</h3></th>
                                    <th scope="col"><h3 className="m-0">Quantity</h3></th>
                                    <th scope="col"><h3 className="m-0">Percentages</h3></th>
                                </tr>
                            </thead>

                            <tbody>
                                {ShiftsData.map((item, i) => {
                                    return item.description === "Total Shifts Posted" ? (
                                        <tr key={i} style={{ background: "rgba(107, 107, 107, 0.35)" }}>
                                            <th scope="row"><h3 className="m-0">{item.description}</h3></th>
                                            <td><h3 className="m-0">{item.qty}</h3></td>
                                            <td><h3 className="m-0">{`${item.pct}%`}</h3></td>
                                        </tr>
                                    ) : (
                                        <tr key={i}>
                                            <th scope="row"><h3 className="m-0">{item.description}</h3></th>
                                            <td><h3 className="m-0">{item.qty}</h3></td>
                                            <td><h3 className="m-0">{`${item.pct}%`}</h3></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Shifts Table Ends */}
                </div>
            </div>
            {/* Left Column Ends */}

            {/* Right Column Starts */}
            <div className="col">
                <div className="row">
                    {/* Shifts Chart Starts*/}
                    <div className="col text-center">
                        <h2 className="mb-3">Shifts Chart</h2>

                        <div style={{ height: '20rem' }}>
                            <BarChart barData={shiftsData} />
                        </div>
                    </div>
                    {/* Shifts Chart Ends*/}
                </div>
            </div>
            {/* Right Column Ends */}
        </div>
    )
}