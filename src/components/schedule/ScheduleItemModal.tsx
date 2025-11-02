"use client"

import { useState, useEffect } from 'react';
import { Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScheduledItem } from '@/lib/types';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/dashboard/Dashboard';
import { format } from 'date-fns';

type ScheduleItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  unscheduledItems: ScheduledItem[];
  defaultTime?: string;
  onConfirm: (item: ScheduledItem, startTime: string, endTime: string) => void;
}

export function ScheduleItemModal({ 
  isOpen, 
  onClose, 
  unscheduledItems, 
  defaultTime = '', 
  onConfirm 
}: ScheduleItemModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>(defaultTime);
  const [endTime, setEndTime] = useState<string>('');
  const [timeError, setTimeError] = useState<string>('');

  // Calculate default end time (1 hour after start time)
  const getDefaultEndTime = (start: string): string => {
    if (!start) return '';
    const [hours, minutes] = start.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours + 1, minutes, 0, 0);
    return format(endDate, 'HH:mm');
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedItemId('');
      setStartTime(defaultTime || '');
      setEndTime('');
      setTimeError('');
    }
  }, [isOpen, defaultTime]);

  useEffect(() => {
    if (startTime && !endTime) {
      const defaultEnd = getDefaultEndTime(startTime);
      setEndTime(defaultEnd);
    }
  }, [startTime]);

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    
    // If no end time is set or end time is before/invalid, set default
    if (!endTime || newStartTime >= endTime) {
      const defaultEnd = getDefaultEndTime(newStartTime);
      setEndTime(defaultEnd);
    }
    
    // Validate
    if (endTime && newStartTime >= endTime) {
      setTimeError('End time must be after start time');
    } else {
      setTimeError('');
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    
    // Validate
    if (newEndTime && startTime >= newEndTime) {
      setTimeError('End time must be after start time');
    } else {
      setTimeError('');
    }
  };

  const selectedItem = unscheduledItems.find(item => item.id === selectedItemId);

  const handleConfirm = () => {
    if (!selectedItem || !startTime || !endTime) return;
    
    // Don't allow confirmation if there's a time error
    if (timeError || startTime >= endTime) {
      return;
    }
    
    onConfirm(selectedItem, startTime, endTime);
    onClose();
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <ModalTitle className="text-xl">Schedule Item</ModalTitle>
              <ModalDescription>
                Select an unscheduled item and set its time
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-6">
          {/* Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="item" className="text-sm font-medium">Select Item</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger id="item" className="h-11">
                <SelectValue placeholder="Choose an unscheduled item..." />
              </SelectTrigger>
              <SelectContent>
                {unscheduledItems.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No unscheduled items available
                  </div>
                ) : (
                  unscheduledItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <Icon name={item.icon} className="h-4 w-4 text-primary" />
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground ml-auto">({item.type})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedItem && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 mt-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon name={selectedItem.icon} className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{selectedItem.title}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{selectedItem.type}</p>
                </div>
              </div>
            )}
          </div>

          {/* Time Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
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
                  value={endTime}
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
              {endTime && !timeError && startTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Duration: {(() => {
                    const [sh, sm] = startTime.split(':').map(Number);
                    const [eh, em] = endTime.split(':').map(Number);
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
            disabled={!selectedItem || !startTime || !endTime || !!timeError || startTime >= endTime}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

