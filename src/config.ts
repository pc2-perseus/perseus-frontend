const CONFIG: ConfigData = {
    CORE_URL:
        !process.env.NODE_ENV || process.env.NODE_ENV === "development"
            ? "http://localhost:8000"
            : // @ts-expect-error Access to dynamically set value
              window.env.VITE_API_URL,
};

interface ConfigData {
    CORE_URL: string;
}
export default CONFIG;
