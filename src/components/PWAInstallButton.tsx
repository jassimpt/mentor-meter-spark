import { useState, useEffect } from "react";
import { Download, ArrowUpRight, Share, PlusSquare, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PWAInstallButtonProps {
  collapsed?: boolean;
  variant?: "default" | "quick-action";
}

export function PWAInstallButton({ collapsed = false, variant = "default" }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // In development or demo mode, always show the button so the user can see and test it!
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Prompt not supported/fired (e.g. iOS Safari, Firefox, or already registered) -> Show beautiful custom guide!
      setIsGuideOpen(true);
    }
  };

  if (!isVisible) return null;

  const renderGuideModal = () => (
    <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
      <DialogContent className="max-w-sm rounded-[2rem] p-6 max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-t-[2rem] max-md:rounded-b-none max-md:w-full">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Install MentorMeter
          </DialogTitle>
          <DialogDescription className="text-sm">
            Add MentorMeter to your home screen for a fast, native-like experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {isIOS ? (
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Share className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">1. Tap the Share button</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Find it in Safari's bottom toolbar.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <PlusSquare className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">2. Select 'Add to Home Screen'</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Scroll down the menu to find this option.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Monitor className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Using Chrome / Edge / Firefox</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Click the install icon (<Download className="inline h-3 w-3" />) in the browser's address bar at the top.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Share className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">On Mobile Browsers</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Tap the browser menu (three dots) and select 'Install app' or 'Add to Home Screen'.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => setIsGuideOpen(false)}
            className="w-full h-11 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-md shadow-primary/15 mt-2"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (variant === "quick-action") {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/action text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover/action:scale-105 transition-transform shrink-0">
            <Download className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Install App</p>
            <p className="text-xs text-muted-foreground">
              Install PWA on your device
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 ml-auto group-hover/action:text-primary transition-colors" />
        </button>
        {renderGuideModal()}
      </>
    );
  }

  if (collapsed) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleInstallClick}
              size="icon"
              className="h-11 w-11 rounded-xl bg-gradient-primary hover:opacity-90 text-white shadow-md shadow-primary/20 mx-auto flex justify-center items-center"
            >
              <Download className="h-[18px] w-[18px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="font-medium">
            Install App
          </TooltipContent>
        </Tooltip>
        {renderGuideModal()}
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        className="w-full gap-2 bg-gradient-primary hover:opacity-90 text-white rounded-xl shadow-md shadow-primary/20 h-11 px-4"
      >
        <Download className="h-4 w-4" />
        <span className="font-semibold text-sm">Install App</span>
      </Button>
      {renderGuideModal()}
    </>
  );
}
