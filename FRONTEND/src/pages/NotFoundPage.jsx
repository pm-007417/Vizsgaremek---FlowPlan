import { NavLink } from "react-router";
import { BackButton } from "../components/common/BackButton";

export function NotFoundPage(){
    return(
        <div>
            <h1>A keresett oldal nem található</h1>
            <NavLink className="text-primary" to="/">Vissza a főoldalra</NavLink>
            <BackButton />
        </div>
    );
}