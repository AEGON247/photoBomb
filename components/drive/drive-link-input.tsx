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
import { useRouter } from "next/navigation";

export function DriveLinkInput() {
  const router = useRouter();
  const { setSelectedFolder, setCurrentFolder } = useDriveStore();

  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "ready" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  const handleApply = async () => {
    const parsed = parseDriveLink(link);
    if (!parsed) {
      setStatus("error");
      setMessage("That doesn't look like a valid Google Drive link or ID.");
      return;
    }

    setStatus("validating");
    setMessage("Validating link with Google Drive...");

    try {
      const meta = await getFileMetadata(parsed.id);
      const isFolder = meta.mimeType === "application/vnd.google-apps.folder";

      if (!isFolder) {
        setStatus("error");
        setMessage("This link points to a single file. Please share a folder that contains the photos you want to scan.");
        return;
      }

      
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
      setMessage("Access denied. Make sure you changed the folder sharing settings to 'Anyone with the link can view' before pasting the link.");
    }
  };

  const disabled = !link.trim();

  return (
    <Card className="w-full mx-auto comic-panel bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-display font-black uppercase flex items-center gap-2">
          <span className="text-foreground">Paste Google Drive folder link</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium text-foreground/80">
          Right-click a Google Drive folder, change sharing to <strong className="text-primary font-black uppercase tracking-wider">"Anyone with the link can view"</strong>, and paste the link below. No login required!
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="https://drive.google.com/drive/folders/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleApply}
            disabled={disabled || status === "validating"}
            className="md:w-48"
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
          <div className="flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-wider mt-2 border-2 border-primary p-2 bg-primary/10">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Selected folder: <span className="font-black text-foreground">{resolvedName}</span></span>
          </div>
        )}
        {message && status !== "ready" && (
          <div className="flex items-start gap-2 text-sm text-destructive font-bold uppercase tracking-wider mt-2 border-2 border-destructive p-2 bg-destructive/10">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t-[4px] border-foreground pt-4 text-xs font-bold uppercase text-foreground/60 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <span>Tip: You can create a dedicated Public Drive folder for all photos you want to scan.</span>
        <span>Only folders set to "Anyone with the link" can be scanned.</span>
      </CardFooter>
    </Card>
  );
}

