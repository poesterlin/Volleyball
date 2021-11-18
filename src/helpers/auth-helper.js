let loggedIn = false;
let token = undefined;
let profile = undefined;

function readStorage(store) {
    token = store.getItem("id_token");
    profile = JSON.parse(store.getItem("profile"));
    loggedIn = !!token;
}

export default {
    authenticated: (store) => {
        if (!loggedIn) {
            readStorage(store);
        }
        return loggedIn;
    },
    getInfo() {
        return { token, profile }
    },
    readStorage,
    login: (store, authResult, profile) => {
        store.setItem("accessToken", authResult.accessToken);
        store.setItem("id_token", authResult.idToken);
        store.setItem("profile", JSON.stringify(profile));

        loggedIn = true;
        token = authResult.idToken;
    },
    logout: (store) => {
        store.removeItem("id_token");
        store.removeItem("accessToken");
        store.removeItem("profile");
        loggedIn = false;
        token = undefined;
        profile = undefined;
    }
};
