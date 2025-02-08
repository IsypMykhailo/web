import {defineStore} from "pinia";
import {useUserStore} from "./user";
import {authServiceURL} from "../configs/auth-service"
import router from "../router";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        // Owner JWT
        // jwt: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNjc5NTIxOTQ0LCJleHAiOjE2ODk1MTU1NDR9.4OhAPIJ3igIMx7xZt35TDwoLpoUuAmKk9aNLaqLlI4ORF2h8tmp_HFBq3Ie4gjzmNpqm1onSL0orfROcfA2EUQ',
        // Admin1 JWT
        // jwt: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzIiwiaWF0IjoxNjc5NTIwOTM2LCJleHAiOjE2ODk1MTQ1MzZ9.DkNHKdam-36HleeMmy-moZ8kNM7omJnvox3gywGmN17LRuiuRGXF0X66CiHmxfyCmg41YAPMzU9k36JjzN_zBg',
        // Teacher1 JWT
        // jwt: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNjc5NTIwOTU5LCJleHAiOjE2ODk1MTQ1NTl9.YkN2XzD-J2PBSRLWA0r10QShuy0px-ppLzEwOFntRi4QPl7k4rfhKAL31OKp_HjJzCeQIyo4I-x3MEUWceeWig',
        // Student1 JWt
        // jwt: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1IiwiaWF0IjoxNjc5NTIwOTgwLCJleHAiOjE2ODk1MTQ1ODB9.t5FMKdlhQfkGIGAn3KE-UKKmxOsMj7w3D2hn87C02WyRf_D_W-BWIr4AsFQEznJ4EZfnxaTZ490GeSY55zqegg',
        jwt: localStorage.getItem('jwt') || null,
        ErrorsValidation: null,
        Sending: false,
        refreshToken: localStorage.getItem('refreshToken') || null,
        successRegistration: null

    }),
    getters: {
        isAuthenticated: state => state.jwt !== null
    },
    actions: {
        UserLogout() {
            try {
               /* fetch("https://g4nv5xjbxl.execute-api.eu-central-1.amazonaws.com/oauth/auth/logout", {
                    method: 'POST',
                    headers: {
                        'Authorization': useAuthStore().jwt,
                        'Content-Type': 'application/json'
                    }})*/
                /*.*/
                this.forgetJwt();
                this.forgetRefreshToken()
                const curUser = useUserStore();
                curUser.forgetUser();
                localStorage.clear()
                router.push('/auth/sign-in')
            } catch (err) {
            }
        },
        tryAuth() {
            console.log(useAuthStore().jwt)
            fetch(authServiceURL + "oauth/user/me", {
                method: 'GET',
                headers: {
                    Authorization: useAuthStore().jwt
                }})
                .then(res => {
                    if (res.error) {
                        console.log(res)
                        //this.UserLogout();
                        //toast.error(res.error)
                    } else {
                        if (res) {
                          return res.json()
                        }
                    }

                }).then(res =>
            {
                console.log(res)
                const curUser = useUserStore();
                curUser.updateUser(res)
                console.log(curUser.user)
                router.push('/my-profile')
            })
        },
        tryLogin(email, password) {
            const user = {
                email: email,
                password: password
            }
            this.validateLoginForm(user)
            if (this.ErrorsValidation) {
                return false
            }
            this.Sending = true

            const data = {email: email, password: password};
            console.log(data)
            fetch(authServiceURL + 'oauth/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(res => {
                    return res.json();
                })
                .then(json => {
                    if (json.error ) {
                        console.log(json)
                        if(json.error === "Unauthorized")
                        {
                            this.ErrorsValidation = "Bad credentials";
                        }
                        if(json.error === "Internal Server Error")
                        {
                            this.ErrorsValidation = "Bad credentials";
                        }
                        else {
                            if(json.message)
                            {
                                this.ErrorsValidation = json.message;
                            }
                            else {
                                this.ErrorsValidation = json.error
                            }
                        }

                        this.Sending = false
                    } else {
                        this.ErrorsValidation = null
                        this.Sending = false
                        this.rememberJwt(json.tokenType + " " + json.accessToken)
                        this.rememberRefreshToken(json.refreshToken)
                        console.log("try auth")
                        this.tryAuth()
                    }

                })
                .catch(err => {
                    console.log(err)
                    this.ErrorsValidation = err;
                    this.Sending = false
                })
        },
        tryRegister(email, login, password, fullname, repeatPassword) {
            if(password !== repeatPassword)
            {
                this.ErrorsValidation = "Password doesnt match with Repeat password";
                return false;
            }
            const newUser = {
                login: login,
                email: email,
                fullname: fullname,
                password: password
            }
            this.validateRegForm(newUser)
            if (this.ErrorsValidation) {
                return false
            }
            this.Sending = true
            const data = {email: email, password: password, login: login, fullname: fullname};

            fetch(authServiceURL + 'oauth/auth/register', {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *client
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            })
                .then(res => {
                    return res.json();
                })
                .then(json => {
                    if (json.error || !json.success) {
                        this.ErrorsValidation = json.message;
                    } else {
                        if (json) {
                            this.ErrorsValidation = null
                            this.successRegistration = json.message
                        }
                    }
                    this.Sending = false
                })
                .catch(err => {
                    this.ErrorsValidation = err;
                    this.Sending = false
                })


        },
        validateRegForm(data) {
            this.ErrorsValidation = null
            if (data.email === null || data.email === '' || data.password === undefined) {
                this.ErrorsValidation = 'Email required'
            }
            if (data.password === null || data.password === '' || data.password === undefined) {
                this.ErrorsValidation = 'Password required'
            }
            if (data.login === null || data.login === '' || data.login === undefined) {
                this.ErrorsValidation = 'Login required'
            }

        },
        validateLoginForm(data) {
            this.ErrorsValidation = null
            if (data.password === null || data.password === '' || data.password === undefined) {
                this.ErrorsValidation = 'Invalid Attemp'
            }
            if (data.email === null || data.email === '' || data.email === undefined) {
                this.ErrorsValidation = 'Invalid Attemp'
            }
        },
        rememberJwt(jwt) {
            this.jwt = jwt
            localStorage.setItem('jwt', jwt)
        },
        rememberRefreshToken(refreshToken) {
            this.refreshToken = refreshToken
            localStorage.setItem('refreshToken', refreshToken)
        },
        forgetJwt() {
            this.jwt = null
            localStorage.removeItem('jwt')
        },

        forgetRefreshToken() {
            this.refreshToken = null
            localStorage.removeItem('refreshToken')
        },
    }
})