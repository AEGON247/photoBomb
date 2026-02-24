// Utilities for working with Google Drive sharing links
// Convert user-pasted URLs into file/folder IDs and types we can use with the Drive API.

export type DriveResourceType = "file" | "folder" | "unknown";

export interface ParsedDriveLink {
  id: string;
  type: DriveResourceType;
}

// Supports common Drive URL formats, for both files and folders.
export function parseDriveLink(input: string): ParsedDriveLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const { hostname, pathname, searchParams } = url;

    if (!hostname.includes("drive.google.com")) {
      return null;
    }

    // e.g. https://drive.google.com/drive/folders/{folderId}
    //      https://drive.google.com/drive/u/0/folders/{folderId}
    const folderMatch = pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch?.[1]) {
      return { id: folderMatch[1], type: "folder" };
    }

    // e.g. https://drive.google.com/file/d/{fileId}/view
    const fileMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch?.[1]) {
      return { id: fileMatch[1], type: "file" };
    }

    // e.g. https://drive.google.com/open?id={id}
    const idParam = searchParams.get("id");
    if (idParam) {
      // We cannot reliably know if it's a file or folder without an API call
      return { id: idParam, type: "unknown" };
    }

    return null;
  } catch {
    // Not a valid URL at all – treat as raw ID, best-effort
    const asId = trimmed.match(/^[a-zA-Z0-9_-]+$/);
    if (asId) {
      return { id: trimmed, type: "unknown" };
    }
    return null;
  }
}

