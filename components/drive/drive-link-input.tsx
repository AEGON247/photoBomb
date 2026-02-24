"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useDriveStore } from "@/store/drive-store";
import { parseDriveLink } from "@/lib/drive-links";
import { getFileMetadata } from "@/lib/drive-service";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Link2 } from "lucide-react";

export function DriveLinkInput() {
  const { accessToken } = useAuthStore();
  const { setSelectedFolder, setCurrentFolder } = useDriveStore();

  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "ready" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  const handleApply = async () => {
    if (!accessToken) {
      setStatus("error");
      setMessage("Connect Google Drive on the login page before pasting a link.");
      return;
    }

    const parsed = parseDriveLink(link);
    if (!parsed) {
      setStatus("error");
      setMessage("That doesn't look like a valid Google Drive link or ID.");
      return;
    }

    setStatus("validating");
    setMessage("Validating link with Google Drive...");

    try {
      const meta = await getFileMetadata(accessToken, parsed.id);
      const isFolder = meta.mimeType === "application/vnd.google-apps.folder";

      if (!isFolder) {
        setStatus("error");
        setMessage("This link points to a single file. Please share a folder that contains the photos you want to scan.");
        return;
      }

      // Store as the selected root folder for scanning
      setSelectedFolder({
        id: meta.id,
        name: meta.name,
        mimeType: meta.mimeType,
        thumbnailLink: meta.thumbnailLink,
        parents: meta.parents,
      });
      setCurrentFolder(meta.id, meta.name);

      setResolvedName(meta.name);
      setStatus("ready");
      setMessage("Folder linked. You're ready to upload a reference face and start scanning.");
    } catch (error) {
      console.error("Failed to validate Drive link", error);
      setStatus("error");
      setMessage("Google Drive wouldn't let us access this link. Make sure it's shared with your Google account and try again.");
    }
  };

  const disabled = !link.trim();

  return (
    <Card className="w-full max-w-3xl mx-auto bg-slate-900 border-slate-800 text-slate-100">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-blue-400">Paste Google Drive folder link</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400">
          Share a Google Drive folder with the Google account you use to sign in, then paste its link here. We'll scan all images inside that folder and its subfolders.
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="https://drive.google.com/drive/folders/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-100"
          />
          <Button
            type="button"
            onClick={handleApply}
            disabled={disabled || status === "validating"}
            className="md:w-40 bg-blue-600 hover:bg-blue-700"
          >
            {status === "validating" ? (
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4 animate-pulse" />
                Linking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Use this folder
              </span>
            )}
          </Button>
        </div>
        {resolvedName && status === "ready" && (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Selected folder: <span className="font-semibold">{resolvedName}</span></span>
          </div>
        )}
        {message && status !== "ready" && (
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <span>Tip: You can create a dedicated Drive folder for all photos you want FaceFinder to search.</span>
        <span>Only folders you can already access via your Google account can be scanned.</span>
      </CardFooter>
    </Card>
  );
}

