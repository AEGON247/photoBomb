


export type DriveResourceType = "file" | "folder" | "unknown";

export interface ParsedDriveLink {
  id: string;
  type: DriveResourceType;
}


export function parseDriveLink(input: string): ParsedDriveLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const { hostname, pathname, searchParams } = url;

    if (!hostname.includes("drive.google.com")) {
      return null;
    }

    
    
    const folderMatch = pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch?.[1]) {
      return { id: folderMatch[1], type: "folder" };
    }

    
    const fileMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch?.[1]) {
      return { id: fileMatch[1], type: "file" };
    }

    
    const idParam = searchParams.get("id");
    if (idParam) {
      
      return { id: idParam, type: "unknown" };
    }

    return null;
  } catch {
    
    const asId = trimmed.match(/^[a-zA-Z0-9_-]+$/);
    if (asId) {
      return { id: trimmed, type: "unknown" };
    }
    return null;
  }
}

