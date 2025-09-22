export default interface DatabaseItem {
    _id: string | null;
    files: { [key: string]: string };
    file_tags: { [key: string]: string[] };
}
