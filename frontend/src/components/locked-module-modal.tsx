import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";

export default function LockedModuleModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [lockedInfo, setLockedInfo] = useState<{ moduleTitle: string; levelTitle: string } | null>(null);

    useEffect(() => {
        const handleShowLocked = (e: any) => {
            setLockedInfo(e.detail);
            setIsOpen(true);
        };

        window.addEventListener('show-locked-module', handleShowLocked);
        return () => window.removeEventListener('show-locked-module', handleShowLocked);
    }, []);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="sm:max-w-md">
                <SheetHeader>
                    <div className="mx-auto bg-orange-100 p-3 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-orange-600" />
                    </div>
                    <SheetTitle className="text-center text-2xl">Module Locked</SheetTitle>
                    <SheetDescription className="text-center text-base">
                        You haven't unlocked <strong>{lockedInfo?.moduleTitle}</strong> yet.
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium mb-1">How to unlock:</p>
                            <p className="text-muted-foreground">
                                Complete the previous modules in the <strong>{lockedInfo?.levelTitle}</strong> level with a score of at least 80% to progress to this lesson.
                            </p>
                        </div>
                    </div>
                </div>

                <SheetFooter className="sm:justify-center">
                    <SheetClose asChild>
                        <Button type="button" className="w-full">
                            Got it, I'll keep learning!
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
