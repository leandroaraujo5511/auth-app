import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../context/AuthContext";
import { AuthTokenError } from "../errors/AuthTokenError";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../ultils/withSSRAuth";

export  default function Dashboard(){
    const {user} =  useContext(AuthContext);   

    useEffect(()=> {
        api.get('/me')
        .then((response: any) => console.log(response))
        .catch(err => console.log(err))
    },[])

    return(
        <>
            <h1>dashboard: {user?.email}</h1>
            <Can permissions={['metrics.list']} >
                <div>Métricas</div>

            </Can>
        </>
    )
}


export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');
    
    console.log(response);

     return {
        props:{}
    }
})