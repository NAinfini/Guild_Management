/**
// Supports multi-select filtering by role, class, power range, status, and media
 */

import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  Button,
  Badge,
  Separator,
  Switch,
  Slider,
  Select,
  SelectItem,
  Input,
  Label,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

import { useMediaQuery } from '../../../hooks/use-media-query';
import { RosterFilterState, useFilterPresets } from '../../../hooks/useFilterPresets';
import { formatClassDisplayName, formatPower, cn } from '@/lib/utils';

interface RosterFilterPanelProps {
  open: boolean;
  onClose: () => void;
  filters: RosterFilterState;
  onChange: (filters: RosterFilterState) => void;
  availableRoles: string[];
  availableClasses: string[];
}

export function RosterFilterPanel({
  open,
  onClose,
  filters,
  onChange,
  availableRoles,
  availableClasses,
}: RosterFilterPanelProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { presets, savePreset, deletePreset } = useFilterPresets();
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleClearAll = () => {
    onChange({
      roles: [],
      classes: [],
      powerRange: [0, 999999999],
      status: 'all',
      hasMedia: false,
    });
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim(), filters);
      setPresetName('');
      setSaveDialogOpen(false);
    }
  };

  const handleLoadPreset = (presetFilters: RosterFilterState) => {
    onChange(presetFilters);
  };

  const activeFilterCount = 
    filters.roles.length +
    filters.classes.length +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.hasMedia ? 1 : 0) +
    (filters.powerRange[0] > 0 || filters.powerRange[1] < 999999999 ? 1 : 0);

  // MultiSelect Component Logic
  const MultiSelect = ({ 
    options, 
    value, 
    onChange, 
    label, 
    placeholder,
    formatLabel = (s: string) => s
  }: { 
    options: string[], 
    value: string[], 
    onChange: (val: string[]) => void, 
    label: string, 
    placeholder: string,
    formatLabel?: (s: string) => string
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto min-h-10 py-2 px-3"
            >
              <div className="flex flex-wrap gap-1 items-center">
                {value.length > 0 ? (
                  value.map((item) => (
                    <Badge key={item} variant="secondary" className="mr-1">
                      {formatLabel(item)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground font-normal">{placeholder}</span>
                )}
              </div>
              <UnfoldMoreIcon sx={{ ml: 2, fontSize: 16, opacity: 0.5, flexShrink: 0 }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder={placeholder} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={(currentValue: string) => {
                        // cmdk converts to lowercase, so we need to match original option
                        // But here `option` is passed as value.
                        // If selected, remove. If not, add.
                        const isSelected = value.includes(option);
                        if (isSelected) {
                          onChange(value.filter((v) => v !== option));
                        } else {
                          onChange([...value, option]);
                        }
                      }}
                    >
                      <CheckIcon
                        sx={{
                          mr: 2,
                          fontSize: 16,
                          opacity: value.includes(option) ? 1 : 0
                        }}
                      />
                      {formatLabel(option)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(v: boolean) => !v && onClose()}
        direction={isMobile ? 'bottom' : 'right'}
      >
        <DrawerContent className={cn("flex flex-col h-full", isMobile ? "h-[85vh]" : "w-[360px]")}>
          
          <DrawerHeader className="border-b px-4 py-3 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2">
                 <FilterListIcon sx={{ fontSize: 20, color: "primary.main" }} />
                 <DrawerTitle>Filters</DrawerTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-2 font-bold h-5 px-1.5 min-w-[20px] justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
             </div>
             {/* Close button handled by drawer logic usually, but we can add explicit one */}
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Badge
                    key={preset.id}
                    variant={preset.isDefault ? "secondary" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors py-1 pl-2 pr-1 gap-1"
                    onClick={() => handleLoadPreset(preset.filters)}
                  >
                    {preset.name}
                    {!preset.isDefault && (
                      <span 
                        role="button" 
                        onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                        className="hover:text-destructive p-0.5 rounded-full hover:bg-destructive/10"
                      >
                         <DeleteIcon sx={{ fontSize: 14 }} />
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Role Filter */}
            <MultiSelect
              label="Roles"
              placeholder="Select roles..."
              options={availableRoles}
              value={filters.roles}
              onChange={(newVal) => onChange({ ...filters, roles: newVal })}
              formatLabel={(s) => s.charAt(0).toUpperCase() + s.slice(1)}
            />

            {/* Class Filter */}
            <MultiSelect
              label="Classes"
              placeholder="Select classes..."
              options={availableClasses}
              value={filters.classes}
              onChange={(newVal) => onChange({ ...filters, classes: newVal })}
              formatLabel={formatClassDisplayName}
            />

            {/* Power Range */}
            <div className="space-y-4">
               <Label>Power Range</Label>
               <div className="px-1">
                 <Slider
                   defaultValue={filters.powerRange}
                   value={filters.powerRange}
                   min={0}
                   max={50000000}
                   step={1000000}
                    onChange={(_e: any, val: number | number[]) => onChange({ ...filters, powerRange: val as [number, number] })}
                  />
               </div>
               <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
                  <span>{formatPower(filters.powerRange[0])}</span>
                  <span>{formatPower(filters.powerRange[1])}</span>
               </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onChange={(e: any) => onChange({ ...filters, status: e.target.value as any })}
                displayEmpty
                renderValue={(selected: any) => {
                  if (!selected) return <span className="text-muted-foreground">Select status</span>;
                  const labels: Record<string, string> = {
                    all: 'All Members',
                    active: 'Active Only',
                    inactive: 'Inactive Only'
                  };
                  return labels[selected as string] || selected;
                }}
               >
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
              </Select>
            </div>

            {/* Has Media Toggle */}
            <div className="flex items-center justify-between border rounded-lg p-3 bg-card/50">
               <div className="space-y-0.5">
                 <Label className="text-base">Only show media</Label>
                 <p className="text-xs text-muted-foreground">Members with uploaded images/videos</p>
               </div>
               <Switch
                 checked={filters.hasMedia}
                 onChange={(_e, checked) => onChange({ ...filters, hasMedia: checked })}
               />
            </div>

          </div>

          <DrawerFooter className="border-t p-4 flex-col gap-2">
             <Button variant="outline" className="w-full" onClick={() => setSaveDialogOpen(true)} disabled={activeFilterCount === 0}>
                 <SaveIcon sx={{ mr: 1, fontSize: 18 }} />
                Save as Preset
             </Button>
             <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleClearAll} disabled={activeFilterCount === 0}>
                Clear All Filters
             </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>Save Filter Preset</DialogTitle>
           </DialogHeader>
           <div className="py-4">
              <Label htmlFor="preset-name" className="mb-2 block">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="My Custom Filter"
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              />
           </div>
           <DialogFooter>
             <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleSavePreset} disabled={!presetName.trim()}>Save</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
