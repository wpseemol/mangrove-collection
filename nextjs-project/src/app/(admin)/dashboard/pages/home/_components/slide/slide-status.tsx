import { SliderFormType } from "@/lib/schemas/zod/slide-schema";
import debounce from "@/utils/debounce";
import { useEffect, useState, useCallback } from "react";


interface SlideStatusProps {
  form: SliderFormType;
  loading: boolean;
  onSave?: () => void; // Optional callback for manual save
  autoSaveDelay?: number; // Delay for auto-save in milliseconds
}

export default function SlideStatus({ 
  form, 
  loading,
  onSave,
  autoSaveDelay = 2000 // Default 2 seconds delay
}: SlideStatusProps) {
  const { formState, handleSubmit } = form;
  const { isDirty, isValid, errors } = formState;
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number | null>(null);
  
  // Check if form has any errors
  const hasErrors = !!errors?.slides;

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(
    debounce(() => {
      if (isDirty && isValid && !hasErrors && !loading) {
        setIsSaving(true);
        
        // Trigger save action
        if (onSave) {
          onSave();
        } else {
          // If no onSave callback, just submit the form
          handleSubmit(() => {
            // Success callback
            setIsSaving(false);
            setLastSaved(new Date());
          }, () => {
            // Error callback
            setIsSaving(false);
          })();
        }
      }
    }, autoSaveDelay),
    [isDirty, isValid, hasErrors, loading, onSave, handleSubmit, autoSaveDelay]
  );

  // Reset countdown on form changes
  useEffect(() => {
    if (isDirty && isValid && !hasErrors && !loading) {
      setAutoSaveCountdown(autoSaveDelay / 1000);
      
      const interval = setInterval(() => {
        setAutoSaveCountdown(prev => {
          if (prev && prev > 1) return prev - 1;
          clearInterval(interval);
          return null;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setAutoSaveCountdown(null);
    }
  }, [isDirty, isValid, hasErrors, loading, autoSaveDelay]);

  // Trigger auto-save when conditions are met
  useEffect(() => {
    if (isDirty && isValid && !hasErrors && !loading) {
      debouncedAutoSave();
    }
    
    return () => {
      debouncedAutoSave();
    };
  }, [isDirty, isValid, hasErrors, loading, debouncedAutoSave]);

  // Handle manual save button click
  const handleManualSave = () => {
    if (onSave) {
      onSave();
    } else {
      handleSubmit(
        () => {
          setIsSaving(true);
          setTimeout(() => {
            setIsSaving(false);
            setLastSaved(new Date());
          }, 500); // Simulate save delay
        },
        () => {
          setIsSaving(false);
        }
      )();
    }
  };

  // Format time since last save
  const formatTimeSinceLastSave = () => {
    if (!lastSaved) return "";
    
    const seconds = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const currentLoading = loading || isSaving;
  const timeSinceLastSave = formatTimeSinceLastSave();

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 px-4 pb-4">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {currentLoading ? (
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm animate-spin">
              progress_activity
            </span>
            Saving...
          </span>
        ) : isDirty && isValid && !hasErrors ? (
          <div className="flex flex-col">
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
              Ready to save
            </span>
            {autoSaveCountdown !== null && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Auto-saving in {autoSaveCountdown}s
              </span>
            )}
          </div>
        ) : isDirty && hasErrors ? (
          <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              warning
            </span>
            Please fix errors
          </span>
        ) : isDirty ? (
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              edit
            </span>
            Unsaved changes
          </span>
        ) : (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                check
              </span>
              All changes saved
            </span>
            {timeSinceLastSave && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Last saved {timeSinceLastSave}
              </span>
            )}
          </div>
        )}
      </div>
      <button
        type="button" // Changed to button to prevent form submission
        onClick={handleManualSave}
        disabled={!isDirty || !isValid || currentLoading || hasErrors}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        {currentLoading ? (
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm animate-spin">
              progress_activity
            </span>
            Saving...
          </span>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}