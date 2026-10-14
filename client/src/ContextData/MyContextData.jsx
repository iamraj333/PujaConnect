import { createContext, useEffect, useState } from "react";

export const MyContextData = createContext();

export function ContextProvider({children}) {
    const [currentUser, setCurrentUser] = useState({
        role: '',
        user: ''
    })
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
                method: "GET",
                credentials: "include"
            })

            const data = await response.json()
            if (response.ok) {
                setCurrentUser({
                    role: data.role,
                    user: data.user
                })
            }
            else {
                setCurrentUser({
                    role: "",
                    user: ""
                })
            }
        }
        catch (e) {
            console.error("Server connection with Context API failed: ", e)
            setCurrentUser({
                role: '',
                user: ''
            })
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])


    const logout = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            })

            const data = await response.json()

            if (data.success) {
                return { success: data.success };
            }
            else {
                return { error: data.error }
            }
        }
        catch (e) {
            console.error("Server connection for logout failed: ", e)
            return { error: "Logout Failed" }
        }
        finally {
            setCurrentUser({
                role: '',
                user: ''
            })
        }
    }


    return (
        <MyContextData.Provider value={{ currentUser, fetchUser, logout, loading }}>
            {children}
        </MyContextData.Provider>
    )
}