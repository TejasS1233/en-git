import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

// Known conflicting shortcuts
const CONFLICTING_SHORTCUTS = {
  "Ctrl+N": "Chrome: New Window",
  "Ctrl+Shift+N": "Chrome: New Incognito Window",
  "Ctrl+T": "Chrome: New Tab",
  "Ctrl+W": "Chrome: Close Tab",
  "Ctrl+Shift+T": "Chrome: Reopen Closed Tab",
  "Ctrl+Tab": "Chrome: Next Tab",
  "Ctrl+Shift+Tab": "Chrome: Previous Tab",
  "Ctrl+R": "Chrome: Reload Page",
  "Ctrl+Shift+R": "Chrome: Hard Reload",
  "Ctrl+F": "Chrome: Find in Page",
  "Ctrl+H": "Chrome: History",
  "Ctrl+J": "Chrome: Downloads",
  "Ctrl+D": "Chrome: Bookmark Page",
  "Ctrl+Shift+D": "Chrome: Bookmark All Tabs",
  "Ctrl+Shift+B": "Chrome: Toggle Bookmarks Bar",
  "Ctrl+L": "Chrome: Focus Address Bar",
  "Ctrl+P": "Chrome: Print",
  "Ctrl+S": "Chrome: Save Page",
  "Alt+F4": "Windows: Close Window",
  F5: "Browser: Refresh",
  F11: "Browser: Fullscreen",
  F12: "Browser: DevTools",
  "Ctrl+U": "Browser: View Source",
  "Ctrl+Shift+I": "Chrome: DevTools",
  "Ctrl+Shift+J": "Chrome: Console",
  "Ctrl+Shift+C": "Chrome: Inspect Element",
};

// Suggested alternatives for common actions
const SUGGESTED_ALTERNATIVES = {
  "New Repository": ["Ctrl+Alt+N", "Alt+N", "Ctrl+Shift+R"],
  "Quick Search": ["Ctrl+K", "Alt+S", "Ctrl+/"],
  "View Issues": ["Ctrl+Alt+I", "Alt+I", "Ctrl+Shift+E"],
  "View Pull Requests": ["Ctrl+Alt+P", "Alt+P", "Ctrl+Shift+P"],
};

export function ShortcutRecorder({ value, onChange, disabled, actionName }) {
  const [isRecording, setIsRecording] = useState(false);
  const [keys, setKeys] = useState([]);
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const pressedKeys = [];
      if (e.ctrlKey || e.metaKey) pressedKeys.push("Ctrl");
      if (e.shiftKey) pressedKeys.push("Shift");
      if (e.altKey) pressedKeys.push("Alt");

      // Add the actual key if it's not a modifier
      if (!["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
        pressedKeys.push(e.key.toUpperCase());
      }

      if (pressedKeys.length > 0) {
        setKeys(pressedKeys);
      }
    };

    const handleKeyUp = (e) => {
      if (keys.length > 0) {
        const shortcut = keys.join("+");

        // Check for conflicts
        if (CONFLICTING_SHORTCUTS[shortcut]) {
          setConflict({
            shortcut,
            conflictsWith: CONFLICTING_SHORTCUTS[shortcut],
          });
        } else {
          setConflict(null);
        }

        onChange(shortcut);
        setIsRecording(false);
        setKeys([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRecording, keys, onChange]);

  const handleClear = () => {
    onChange("");
    setKeys([]);
    setConflict(null);
  };

  const handleUseSuggestion = (suggestion) => {
    onChange(suggestion);
    setConflict(null);
  };

  // Check for conflicts when value changes
  useEffect(() => {
    if (value && CONFLICTING_SHORTCUTS[value]) {
      setConflict({
        shortcut: value,
        conflictsWith: CONFLICTING_SHORTCUTS[value],
      });
    } else {
      setConflict(null);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 px-3 py-2 border rounded-md text-sm ${isRecording ? "border-primary bg-primary/5 animate-pulse" : "border-input bg-background"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => !disabled && setIsRecording(true)}
        >
          {isRecording ? (
            <span className="text-primary font-medium">
              {keys.length > 0 ? keys.join(" + ") : "Press keys..."}
            </span>
          ) : value ? (
            <kbd className="font-mono">{value}</kbd>
          ) : (
            <span className="text-muted-foreground">Click to record</span>
          )}
        </div>
        {value && !disabled && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Conflict Warning */}
      {conflict && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <p className="font-medium mb-1">⚠️ Conflicts with: {conflict.conflictsWith}</p>
            <p className="text-muted-foreground mb-2">
              This shortcut may not work as expected. Try these alternatives:
            </p>
            <div className="flex flex-wrap gap-1">
              {(SUGGESTED_ALTERNATIVES[actionName] || ["Alt+N", "Ctrl+Alt+N"]).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleUseSuggestion(suggestion)}
                  disabled={disabled}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
