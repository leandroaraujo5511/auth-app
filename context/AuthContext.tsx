import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import Router from 'next/router';
import {setCookie,parseCookies , destroyCookie} from 'nookies'


type User = {
    email: string;
    permissions: [];
    roles: string[];
}

type SingInCredentials = {
    email: string,
    password: string
}

type AuthContextData = {
    singIn(credentials: SingInCredentials): Promise<void>; 
    user: User;
    isAuthenticated: boolean;
};

type AuthProviderProps = {
    children: ReactNode
}

export const AuthContext =  createContext({} as AuthContextData)

export function singOut(){
    destroyCookie(undefined,'nextauth.token')
    destroyCookie(undefined,'nextauth.refreshtoken')

    Router.push('/')
}
export function AuthProvider({children}:AuthProviderProps){
    const [user, setUser] =  useState<User>();
    const isAuthenticated = !!user;

   

    useEffect(() => {
        const {'nextauth.token': token} = parseCookies()

        if(token){
            api.get('/me')
            .then(response => {
                const {email,permissions, roles} = response.data;
                setUser({
                    email, 
                    permissions, 
                    roles
                });
            })
            .catch(() => {
                singOut()
            })
        }
    },[])
    
    async function singIn({email, password}:SingInCredentials){
        try {
            const response = await api.post('sessions',{
                email,
                password
            })
            
            const {token, refreshToken, permissions, roles} =  response.data;

            // sesssionStorage -  Duração somente equanta a sessão estiver ativa (Terminna ao fechar o navegador)
            // localStorage - A Duração não depende da sessão esta ativa  - next não é apenas browser - no lado do servidor não tem acesso ao localStorage
            // cookies - A duração não expira - pode ser acessado tanto do lado do servidor como no browser 


            setCookie(undefined, 'nextauth.token', token,{
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/' //qualquer endereço da aplicação 
            });
            setCookie(undefined, 'nextauth.refreshtoken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/' //qualquer endereço da aplicação 
            });


            setUser({
                email,
                permissions,
                roles
            })
            
            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')

        } catch (error) {
              console.log(error);         
        }
        
    }
    
    return (
        <AuthContext.Provider value={{singIn,isAuthenticated,user}}>
            {children}
        </AuthContext.Provider>
    )
    
}

