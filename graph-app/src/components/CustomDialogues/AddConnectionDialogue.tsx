import React, { useState } from "react";
import {
    CreateRelRequestBody,
    Direction,
    NodeRelationship,
} from "../../../../shared/interfaces";
import Dialogue from "../Dialogue/Dialogue";
import { ERROR_MESSAGE_TIMEOUT, HOST } from "../../../../shared/variables";
import Error from "../Error/Error";
import { infoHover } from "../../InfoHover";

//dialogue to add a connection between two nodes
function AddConnectionDialogue({
    hideAddBox,
    firstNode,
    secondNode,
    reset,
    updateRelationship,
    setErrorMessage
}: {
    hideAddBox: () => void,
    firstNode: string | null,
    secondNode: string | null,
    reset: () => void,
    updateRelationship: (myRel1: NodeRelationship) => void,
    setErrorMessage: (value: string | null) => void
}) {
    const nameRef = React.useRef<HTMLInputElement | null>(null);
    const checkRef = React.useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    //function to send an api request to create a connection
    const createConnection = async (name: string, direction: Direction) => {
        if (firstNode == null || secondNode == null) {
            console.log("First or second is null");
            reset();
            return;
        }

        const body: CreateRelRequestBody = {
            name: name,
            toId: secondNode,
            fromId: firstNode,
            direction: direction,
        };

        await fetch(`${HOST}/createRel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }).then(async (res) => {
            if (res.status == 200) {
                const body = await res.json();

                //get the response for the updated relationship
                const myRel1 = body as NodeRelationship;

                //search for the relationship on the existing graph and update the value
                updateRelationship(myRel1);

                return;
            }

            setErrorMessage("error: " + res.status)
            setTimeout(() => setErrorMessage(null), ERROR_MESSAGE_TIMEOUT)
            reset();
        });
    };

    const tryCreateConnection = async () => {
        if (nameRef.current != null && checkRef.current != null) {
            if (nameRef.current.value != "") {
                setIsLoading(true);
                const name = nameRef.current.value;
                const isDoubleSided = checkRef.current.checked;
                await createConnection(
                    name,
                    isDoubleSided ? Direction.NEUTRAL : Direction.AWAY,
                );
                setIsLoading(false);
                hideAddBox();
                return;
            }
        }

        setErrorMessage("name is not set")
        setTimeout(() => setErrorMessage(""), ERROR_MESSAGE_TIMEOUT)
    };

    return (
        <React.Fragment>
            <Dialogue hideDialogue={hideAddBox} title={"Create Connection"}>
                {infoHover(5, 13, "Connect two nodes together with a single connection. This will allow others to find information through a new path.", 350)}

                <div>
                    {infoHover(2, 51, "Name the connection. This will be the label.", 200)}
                    <label>Connection name:</label>
                    <input type={"text"} ref={nameRef} />
                </div>
                <div>
                    {infoHover(2, 90, "Will the connection point one way or both ways?", 200)}
                    <label>Double sided:</label>
                    <input type={"checkbox"} ref={checkRef} />
                </div>

                {/*loading button for creating stack*/}
                {isLoading ? (
                    <button className={"buttonDisabled"}>Please wait...</button>
                ) : (
                    <button onClick={tryCreateConnection}>Create</button>
                )}
            </Dialogue>
        </React.Fragment>
    );
}

export default AddConnectionDialogue;
