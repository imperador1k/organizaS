"use client"

import { useState, useEffect } from 'react';
import { Clock, Copy, Move, Calendar, Target, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScheduledItem } from '@/lib/types';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Icon } from '@/components/dashboard/Dashboard';
import { format } from 'date-fns';

type TimeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: ScheduledItem | null;
  timeValue: string;
  onTimeChange: (time: string) => void;
  endTimeValue?: string;
  onEndTimeChange?: (time: string) => void;
  onConfirm: (action: 'move' | 'duplicate') => void;
  hasExistingSchedule: boolean;
}

export function TimeModal({ isOpen, onClose, item, timeValue, onTimeChange, endTimeValue, onEndTimeChange, onConfirm, hasExistingSchedule }: TimeModalProps) {
  const [action, setAction] = useState<'move' | 'duplicate'>('move');
  const [localEndTime, setLocalEndTime] = useState(endTimeValue || '');
  const [timeError, setTimeError] = useState<string>('');

  // Update local end time when prop changes
  useEffect(() => {
    setLocalEndTime(endTimeValue || '');
  }, [endTimeValue]);

  if (!item) return null;

  // Calculate default end time (1 hour after start time)
  const getDefaultEndTime = (startTime: string): string => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours + 1, minutes, 0, 0);
    return format(endDate, 'HH:mm');
  };

  const handleStartTimeChange = (newStartTime: string) => {
    onTimeChange(newStartTime);
    
    // If no end time is set or end time is before/invalid, set default
    if (!localEndTime || newStartTime >= localEndTime) {
      const defaultEnd = getDefaultEndTime(newStartTime);
      setLocalEndTime(defaultEnd);
      onEndTimeChange?.(defaultEnd);
    }
    
    // Validate
    if (localEndTime && newStartTime >= localEndTime) {
      setTimeError('End time must be after start time');
    } else {
      setTimeError('');
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setLocalEndTime(newEndTime);
    onEndTimeChange?.(newEndTime);
    
    // Validate
    if (newEndTime && timeValue >= newEndTime) {
      setTimeError('End time must be after start time');
    } else {
      setTimeError('');
    }
  };

  const getItemIcon = () => {
    switch (item.type) {
      case 'habit': return <Target className="h-4 w-4" />;
      case 'task': return <ClipboardList className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getItemTypeLabel = () => {
    switch (item.type) {
      case 'habit': return 'Habit';
      case 'task': return 'Task';
      case 'event': return 'Event';
      default: return 'Item';
    }
  };

  const handleConfirm = () => {
    // Don't allow confirmation if there's a time error
    if (timeError || (localEndTime && timeValue >= localEndTime)) {
      return;
    }
    onConfirm(action);
    onClose();
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <ModalTitle className="text-xl">Schedule {getItemTypeLabel()}</ModalTitle>
              <ModalDescription>
                Set the time for your {getItemTypeLabel().toLowerCase()}
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-6">
          {/* Item Preview */}
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon name={item.icon} className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{getItemTypeLabel()}</p>
            </div>
            {getItemIcon()}
          </div>

          {/* Time Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="pl-10 h-11"
                  placeholder="14:30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={localEndTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className={cn(
                    "pl-10 h-11",
                    timeError && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="15:30"
                />
              </div>
              {timeError && (
                <p className="text-sm text-destructive mt-1">{timeError}</p>
              )}
              {localEndTime && !timeError && (
                <p className="text-xs text-muted-foreground mt-1">
                  Duration: {(() => {
                    const [sh, sm] = timeValue.split(':').map(Number);
                    const [eh, em] = localEndTime.split(':').map(Number);
                    const startMinutes = sh * 60 + sm;
                    const endMinutes = eh * 60 + em;
                    const duration = endMinutes - startMinutes;
                    const hours = Math.floor(duration / 60);
                    const minutes = duration % 60;
                    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
                    if (hours > 0) return `${hours}h`;
                    return `${minutes}m`;
                  })()}
                </p>
              )}
            </div>
          </div>

          {/* Action Selection - Only show if item already has a schedule */}
          {hasExistingSchedule && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">What would you like to do?</Label>
              <RadioGroup value={action} onValueChange={(value) => setAction(value as 'move' | 'duplicate')}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="move" id="move" />
                  <Label htmlFor="move" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Move className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Move to new time</p>
                        <p className="text-sm text-muted-foreground">Remove from current time and schedule at {timeValue}</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="duplicate" id="duplicate" />
                  <Label htmlFor="duplicate" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Copy className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Duplicate at new time</p>
                        <p className="text-sm text-muted-foreground">Keep original and create copy at {timeValue}</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <ModalFooter className="gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!!timeError || !!(localEndTime && timeValue >= localEndTime)}
            className={cn(
              "flex-1 sm:flex-none",
              hasExistingSchedule 
                ? (action === 'duplicate' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-blue-600 hover:bg-blue-700")
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {hasExistingSchedule ? (
              action === 'duplicate' ? (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </>
              ) : (
                <>
                  <Move className="h-4 w-4 mr-2" />
                  Move
                </>
              )
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Set Time
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
