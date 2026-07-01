// React imports
import React, { useEffect, useRef, useState } from "react";

import UserMention from "../../../interfaces/UserMention";

// MUI imports
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    TextField,
} from "@mui/material";

// Icon imports
import AddIcon from "@mui/icons-material/Add";
import getNoteMentions from "../../../api/getNoteMentions";

interface CursorPosition {
    x: number;
    y: number;
}

export default function AddNote({
    onSubmit,
}: {
    onSubmit: (note: string) => void;
}): React.ReactElement {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [note, setNote] = useState<string>("");
    const [suggestions, setSuggestions] = useState<UserMention[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
    const [mentionStart, setMentionStart] = useState<number>(-1);
    const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
        x: 0,
        y: 0,
    });

    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const suggestionsRef = useRef<HTMLUListElement | null>(null);
    const mirrorRef = useRef<HTMLDivElement | null>(null);
    const latestSearchRef = useRef<string>("");

    // caching API results
    const cacheRef = useRef<Record<string, UserMention[]>>({});

    // clear timer
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const getCursorPosition = (
        textarea: HTMLTextAreaElement,
        position: number
    ): CursorPosition => {
        if (!mirrorRef.current) return { x: 0, y: 0 };

        const styles = window.getComputedStyle(textarea);
        const mirror = mirrorRef.current;

        mirror.style.font = styles.font;
        mirror.style.fontSize = styles.fontSize;
        mirror.style.fontFamily = styles.fontFamily;
        mirror.style.lineHeight = styles.lineHeight;
        mirror.style.padding = styles.padding;
        mirror.style.border = styles.border;
        mirror.style.whiteSpace = "pre-wrap";
        mirror.style.overflowWrap = "break-word";
        mirror.style.width = `${textarea.clientWidth}px`;

        const textBeforeCursor = textarea.value.substring(0, position);
        mirror.textContent = textBeforeCursor;

        const span = document.createElement("span");
        span.textContent = "|";
        mirror.appendChild(span);

        const rect = span.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();

        return {
            x: rect.top - textareaRect.top + textarea.scrollTop + 20,
            y: rect.left - textareaRect.left + textarea.scrollLeft,
        };
    };

    const searchUsers = async (search: string) => {
        if (!search || search.trim() === "") {
            setSuggestions([]);
            setIsLoading(false);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        setShowSuggestions(true);

        const normalizedSearch = search.trim().toLowerCase();
        latestSearchRef.current = normalizedSearch;

        const cachedUsers = cacheRef.current[normalizedSearch];

        if (cachedUsers) {
            setSuggestions(cachedUsers);
            setActiveSuggestion(0);
            setIsLoading(false);
            return;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
            try {
                const users = await getNoteMentions(normalizedSearch);

                if (users && users.length > 0) {
                    cacheRef.current[normalizedSearch] = users;

                    if (latestSearchRef.current !== normalizedSearch) {
                        return;
                    }

                    setSuggestions(users);
                    setActiveSuggestion(0);
                } else {
                    if (latestSearchRef.current !== normalizedSearch) {
                        return;
                    }

                    setSuggestions([]);
                }

                setIsLoading(false);
            } catch (error) {
                if (latestSearchRef.current !== normalizedSearch) {
                    return;
                }

                setSuggestions([]);
                setIsLoading(false);
                setShowSuggestions(false);
            }
        }, 300);
    };

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;

        setNote(value);

        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf("@");

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
                setMentionStart(lastAtIndex);

                if (textFieldRef.current) {
                    const pos = getCursorPosition(
                        textFieldRef.current,
                        cursorPos
                    );
                    setCursorPosition(pos);
                }

                searchUsers(textAfterAt);
            } else {
                setShowSuggestions(false);
                setIsLoading(false);
                setMentionStart(-1);
            }
        } else {
            setShowSuggestions(false);
            setIsLoading(false);
            setMentionStart(-1);
        }
    };

    // insert selected user
    const insertMention = (user: UserMention) => {
        if (mentionStart === -1) return;

        const username = user.username;
        const beforeMention = note.substring(0, mentionStart);
        const afterMention = note.substring(
            textFieldRef.current?.selectionStart || note.length
        );

        const newNote = `${beforeMention}@${username} ${afterMention}`;
        setNote(newNote);

        setShowSuggestions(false);
        setSuggestions([]);
        setIsLoading(false);
        setMentionStart(-1);

        setTimeout(() => {
            if (textFieldRef.current) {
                textFieldRef.current.focus();
                const newCursorPos = mentionStart + username.length + 2;
                textFieldRef.current.setSelectionRange(
                    newCursorPos,
                    newCursorPos
                );
            }
        }, 0);
    };

    // keyboard events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!showSuggestions || suggestions.length === 0 || isLoading) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveSuggestion((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;

            case "ArrowUp":
                e.preventDefault();
                setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : 0));
                break;

            case "Enter":
                if (showSuggestions && suggestions.length > 0) {
                    e.preventDefault();
                    insertMention(suggestions[activeSuggestion]);
                }
                break;

            case "Escape":
                e.preventDefault();
                // prevent dialog close, when serch results arr shown
                e.stopPropagation();

                setShowSuggestions(false);
                setIsLoading(false);
                setSuggestions([]);
                break;
        }
    };

    useEffect(() => {
        if (suggestionsRef.current && showSuggestions && !isLoading) {
            const activeElement = suggestionsRef.current.children[
                activeSuggestion
            ] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                });
            }
        }
    }, [activeSuggestion, showSuggestions, isLoading]);

    const resetDialog = () => {
        setNote("");
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
        setMentionStart(-1);
        latestSearchRef.current = "";
        // clear cache on dialog close
        cacheRef.current = {};
    };

    return (
        <>
            <Button
                variant="contained"
                onClick={() => {
                    resetDialog();
                    setShowDialog(true);
                }}
            >
                <AddIcon />
                Add note
            </Button>
            <Dialog
                open={showDialog}
                onClose={() => {
                    resetDialog();
                    setShowDialog(false);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add note</DialogTitle>
                <DialogContent>
                    <Box sx={{ position: "relative", width: "100%" }}>
                        <div
                            ref={mirrorRef}
                            style={{
                                position: "absolute",
                                visibility: "hidden",
                                pointerEvents: "none",
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                            }}
                        />

                        <TextField
                            multiline
                            placeholder="Add note here... Type @ to mention users"
                            value={note}
                            onChange={handleNoteChange}
                            onKeyDown={handleKeyDown}
                            rows={4}
                            fullWidth
                            inputRef={textFieldRef}
                            sx={{ mt: 1 }}
                        />

                        {showSuggestions && (
                            <Paper
                                elevation={3}
                                sx={{
                                    position: "absolute",
                                    top: `${cursorPosition.x + 50}px`,
                                    left: `${cursorPosition.y}px`,
                                    maxHeight: "100px",
                                    minWidth: "250px",
                                    overflowY: "auto",
                                    zIndex: 1300,
                                }}
                            >
                                {isLoading ? (
                                    <Box
                                        sx={{
                                            paddingTop: 1,
                                            paddingLeft: 1,
                                        }}
                                    >
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : suggestions.length > 0 ? (
                                    <List ref={suggestionsRef} dense>
                                        {suggestions.map((user, index) => (
                                            <ListItem
                                                key={user.username}
                                                disablePadding
                                            >
                                                <ListItemButton
                                                    selected={
                                                        index ===
                                                        activeSuggestion
                                                    }
                                                    onClick={() =>
                                                        insertMention(user)
                                                    }
                                                    sx={{
                                                        backgroundColor:
                                                            index ===
                                                            activeSuggestion
                                                                ? "primary.light"
                                                                : "transparent",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "primary.light",
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            user.displayName
                                                                ? `${user.displayName} (@${user.username})`
                                                                : `@${user.username}`
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : null}
                            </Paper>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            resetDialog();
                            setShowDialog(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            onSubmit(note);
                            resetDialog();
                            setShowDialog(false);
                        }}
                    >
                        Add note
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
