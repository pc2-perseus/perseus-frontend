// React imports
import React from "react";

export interface AuthContextData {
    name: string;
    username: string;
    mail_address: string;
    expires: string;
    roles: string[];
}

const AuthContext: React.Context<null | AuthContextData> =
    React.createContext<null | AuthContextData>(null);

export default AuthContext;
