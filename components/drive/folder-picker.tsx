"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useDriveStore } from "@/store/drive-store";
import { listChildren, DriveFile } from "@/lib/drive-service";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Folder, Image as ImageIcon, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function FolderPicker() {
    const { accessToken } = useAuthStore();
    const {
        currentFolderId,
        files,
        setFiles,
        loading,
        setLoading,
        breadcrumbs,
        pushBreadcrumb,
        popBreadcrumb,
        setSelectedFolder: setGlobalSelectedFolder,
        selectedFolder: globalSelectedFolder
    } = useDriveStore();

    useEffect(() => {
        if (!accessToken) return;

        const fetchFiles = async () => {
            setLoading(true);
            try {
                const data = await listChildren(accessToken, currentFolderId);
                setFiles(data.files);
            } catch (error) {
                console.error("Failed to list files", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [accessToken, currentFolderId, setLoading, setFiles]);

    const handleFolderClick = (folder: DriveFile) => {
        pushBreadcrumb(folder.id, folder.name);
        useDriveStore.getState().setCurrentFolder(folder.id);
    };

    const handleBreadcrumbClick = (id: string) => {
        popBreadcrumb(id);
        useDriveStore.getState().setCurrentFolder(id);
    };

    const handleSelectFolder = () => {
        
        
        
        const current = breadcrumbs[breadcrumbs.length - 1];
        setGlobalSelectedFolder({ id: current.id, name: current.name, mimeType: 'application/vnd.google-apps.folder' });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-blue-400">Select Folder to Scan</span>
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-slate-400 mt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                            <button
                                onClick={() => handleBreadcrumbClick(crumb.id)}
                                className="hover:text-white transition-colors"
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-10 bg-slate-800/50 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => file.mimeType === 'application/vnd.google-apps.folder' ? handleFolderClick(file) : null}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border border-transparent transition-all cursor-pointer",
                                        file.mimeType === 'application/vnd.google-apps.folder'
                                            ? "hover:bg-slate-800 hover:border-slate-700"
                                            : "opacity-50 cursor-default"
                                    )}
                                >
                                    {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                        <Folder className="w-5 h-5 text-blue-400" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-slate-500" />
                                    )}
                                    <span className="truncate flex-1 text-sm font-medium">{file.name}</span>
                                </div>
                            ))}
                            {files.length === 0 && (
                                <div className="text-center text-slate-500 py-10">
                                    No folders found here.
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t border-slate-800 p-4 bg-slate-900/50">
                <div className="flex justify-between items-center w-full">
                    <div className="text-sm text-slate-400">
                        Current: <span className="text-white">{breadcrumbs[breadcrumbs.length - 1].name}</span>
                    </div>
                    <Button onClick={handleSelectFolder} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        <Check className="mr-2 w-4 h-4" />
                        Select This Folder
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
