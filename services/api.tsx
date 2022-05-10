import axios, {AxiosError} from "axios";
import { parseCookies, setCookie } from "nookies";
import { singOut } from "../context/AuthContext";
import { AuthTokenError } from "../errors/AuthTokenError";


let isrefreshing = false;
let failedRequestQueue: { onSuccess: (token: string) => void; onFailure: (err: AxiosError<any>) => void; }[] = []


export function setupAPIClient(ctx: undefined) {
    let cookies = parseCookies(ctx);
    
    const api = axios.create({
        baseURL: "http://localhost:3333",
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    });

    api.interceptors.response.use(response => {    
        return response;
    }, (error: AxiosError) => {
        if(error.response?.status === 401){
            if(error.response.data?.code === 'token.expired'){
                //renovar o token
                cookies = parseCookies(ctx);

                const {'nextauth.refreshtoken': refreshToken} =  cookies;
                const originalConfig = error.config;
            
                if(!isrefreshing){
                    isrefreshing = true;

                    api.post('/refresh', {
                        refreshToken, 
                    }).then(response => {
                        const {token} =  response.data;
                    
                        setCookie(ctx, 'nextauth.token', token,{
                            maxAge: 60 * 60 * 24 * 30, // 30 dias
                            path: '/' //qualquer endereço da aplicação 
                        });

                        setCookie(ctx, 'nextauth.refreshtoken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, // 30 dias
                            path: '/' //qualquer endereço da aplicação 
                        });                      
                        api.defaults.headers['Authorization'] = `Bearer ${token}`;

                        failedRequestQueue.forEach(request => request.onSuccess(token))
                        failedRequestQueue = [];


                    }).catch(err => {
                        failedRequestQueue.forEach(request => request.onFailure(err))
                        failedRequestQueue = [];

                        if(process.browser){
                            singOut()
                        }
                    }).finally(()=>{
                        isrefreshing = false;
                    })
                }

                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`;

                            resolve(api(originalConfig))
                        },
                        onFailure: (err: AxiosError) => {
                            reject(err)
                        },
                    })
                })


            }else{
                //deslogar o usuário
                if(process.browser){
                    singOut()
                }else{
                    return Promise.reject(new AuthTokenError())
                }
            }
        }

        return Promise.reject(error);
    });

    return api;
}